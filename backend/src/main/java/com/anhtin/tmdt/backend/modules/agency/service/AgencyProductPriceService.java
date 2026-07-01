package com.anhtin.tmdt.backend.modules.agency.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Collections;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPrice;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPriceHistory;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceHistoryRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyProductPriceDTO;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyProductPriceHistoryDTO;
import com.anhtin.tmdt.backend.modules.price.service.PriceListService;
import com.anhtin.tmdt.backend.modules.price.entity.PriceList;
import com.anhtin.tmdt.backend.modules.common.service.SystemConfigService;

@Service
public class AgencyProductPriceService {

    @Autowired
    private AgencyProductPriceRepository agencyProductPriceRepository;

    @Autowired
    private AgencyProductPriceHistoryRepository agencyProductPriceHistoryRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PriceListService priceListService;

    @Autowired
    private SystemConfigService systemConfigService;

    public Page<AgencyProductPriceDTO> getPricesForAgency(Long agencyId, Integer days, String search, Long categoryId, Long productTypeId, Boolean isOverride, Pageable pageable) {
        Page<AgencyProductPrice> pricesPage;
        if (search != null && !search.trim().isEmpty()) {
            List<Long> productIds = productRepository.findProductIdsByNameOrCodeContaining(search.trim());
            if (productIds.isEmpty()) {
                return Page.empty(pageable);
            }
            pricesPage = agencyProductPriceRepository.findFilteredWithProductIds(
                    agencyId, categoryId, productTypeId, isOverride, productIds, pageable);
        } else {
            pricesPage = agencyProductPriceRepository.findFiltered(
                    agencyId, categoryId, productTypeId, isOverride, pageable);
        }

        int discountDays = systemConfigService.getDiscountMaxDays();

        if (days != null && days > 0) {
            LocalDateTime sinceDate = LocalDateTime.now().minusDays(days);
            return pricesPage.map(p -> {
                AgencyProductPriceDTO dto = mapToDTO(p);
                agencyProductPriceHistoryRepository.findPriceAtDate(agencyId, p.getProduct().getId(), sinceDate)
                    .ifPresentOrElse(
                        historyAtDate -> dto.setOldPrice(historyAtDate.getNewPrice()),
                        () -> dto.setOldPrice(null)
                    );
                return dto;
            });
        }

        return pricesPage.map(p -> {
            AgencyProductPriceDTO dto = mapToDTO(p);
            if (dto.getOldPrice() != null && dto.getUpdatedAt() != null) {
                long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(dto.getUpdatedAt(), java.time.LocalDateTime.now());
                if (daysDiff > discountDays) {
                    dto.setOldPrice(null);
                }
            }
            return dto;
        });
    }

    public List<AgencyProductPriceDTO> getPricesForAgency(Long agencyId, Integer days) {
        return getPricesForAgency(agencyId, days, null, null, null, null, Pageable.unpaged()).getContent();
    }

    public List<AgencyProductPriceHistoryDTO> getHistoryForAgencyProduct(Long agencyId, Long productId) {
        return agencyProductPriceHistoryRepository.findByAgencyIdAndProductIdOrderByChangedAtDesc(agencyId, productId).stream()
                .map(this::mapHistoryToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void overridePrice(Long agencyId, Long productId, Double newPrice, Long changedById) {
        if (agencyId == null || productId == null || newPrice == null) throw new IllegalArgumentException("Invalid input");
        
        Agency agency = agencyRepository.findById(agencyId).orElseThrow(() -> new RuntimeException("Agency not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        AgencyProductPrice app = agencyProductPriceRepository.findByAgencyIdAndProductId(agencyId, productId)
                .orElse(new AgencyProductPrice());

        Double oldPrice = app.getId() != null ? app.getPrice() : null;
        if (oldPrice != null && oldPrice.equals(newPrice)) return;

        app.setAgency(agency);
        app.setProduct(product);
        app.setPrice(newPrice);
        if (oldPrice != null) {
            app.setOldPrice(oldPrice);
        }
        app.setIsOverride(true);
        app.setSourcePriceList(null);
        app.setUpdatedAt(LocalDateTime.now());
        agencyProductPriceRepository.save(app);

        saveHistory(app, agency, product, oldPrice, newPrice, changedById, "MANUAL_OVERRIDE");
    }

    @Transactional
    public void rollbackPrice(Long historyId, Long changedById) {
        AgencyProductPriceHistory history = agencyProductPriceHistoryRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("History not found"));
                
        AgencyProductPrice app = history.getAgencyProductPrice();
        Double oldPrice = app.getPrice();
        Double newPrice = history.getNewPrice(); // Rolling back to this version's new_price

        if (oldPrice != null && oldPrice.equals(newPrice)) return;

        app.setPrice(newPrice);
        if (oldPrice != null) {
            app.setOldPrice(oldPrice);
        }
        app.setSourcePriceList(history.getSourcePriceList());
        app.setUpdatedAt(LocalDateTime.now());
        // Do not change isOverride flag, keep it as is. If rolling back to an override, it's an override. 
        agencyProductPriceRepository.save(app);

        saveHistory(app, app.getAgency(), app.getProduct(), oldPrice, newPrice, changedById, "ROLLBACK");
    }

    @Transactional
    public void removeOverride(Long agencyId, Long productId, Long changedById) {
        if (agencyId == null || productId == null) throw new IllegalArgumentException("Invalid input");
        
        AgencyProductPrice app = agencyProductPriceRepository.findByAgencyIdAndProductId(agencyId, productId)
                .orElseThrow(() -> new RuntimeException("Price record not found"));

        if (!Boolean.TRUE.equals(app.getIsOverride())) {
            return; // Already not overridden
        }

        Double oldPrice = app.getPrice();
        
        // Remove override flag
        app.setIsOverride(false);
        
        // Calculate what the price SHOULD be from price lists
        PriceListService.ResolvedPriceInfo rawInfo = priceListService.calculateRawPriceInfoForAgency(productId, agencyId);
        
        Double newPrice = rawInfo != null ? rawInfo.getPrice() : null;
        app.setPrice(newPrice);
        if (oldPrice != null) {
            app.setOldPrice(oldPrice);
        }
        if (rawInfo != null && rawInfo.getPriceListId() != null) {
            PriceList pl = new PriceList();
            pl.setId(rawInfo.getPriceListId());
            app.setSourcePriceList(pl);
        } else {
            app.setSourcePriceList(null);
        }
        app.setUpdatedAt(LocalDateTime.now());
        agencyProductPriceRepository.save(app);

        saveHistory(app, app.getAgency(), app.getProduct(), oldPrice, newPrice, changedById, "REMOVE_OVERRIDE");
    }

    private void saveHistory(AgencyProductPrice app, Agency agency, Product product, Double oldPrice, Double newPrice, Long changedById, String source) {
        AgencyProductPriceHistory historyLog = new AgencyProductPriceHistory();
        historyLog.setAgencyProductPrice(app);
        historyLog.setAgency(agency);
        historyLog.setProduct(product);
        historyLog.setOldPrice(oldPrice);
        historyLog.setNewPrice(newPrice);
        historyLog.setChangeSource(source);
        historyLog.setSourcePriceList(app.getSourcePriceList());
        
        if (changedById != null) {
            User user = new User();
            user.setId(changedById);
            historyLog.setChangedBy(user);
        }
        
        agencyProductPriceHistoryRepository.save(historyLog);
    }

    private AgencyProductPriceDTO mapToDTO(AgencyProductPrice entity) {
        AgencyProductPriceDTO dto = new AgencyProductPriceDTO();
        dto.setId(entity.getId());
        dto.setAgencyId(entity.getAgency().getId());
        dto.setProductId(entity.getProduct().getId());
        dto.setProductName(entity.getProduct().getName());
        dto.setProductImageUrl(entity.getProduct().getImageUrl());
        dto.setPrice(entity.getPrice());
        dto.setOldPrice(entity.getOldPrice());
        dto.setIsOverride(entity.getIsOverride());
        dto.setUpdatedAt(entity.getUpdatedAt());
        if (entity.getSourcePriceList() != null) {
            dto.setSourcePriceListId(entity.getSourcePriceList().getId());
            dto.setSourcePriceListName(entity.getSourcePriceList().getName());
        }
        return dto;
    }

    private AgencyProductPriceHistoryDTO mapHistoryToDTO(AgencyProductPriceHistory entity) {
        AgencyProductPriceHistoryDTO dto = new AgencyProductPriceHistoryDTO();
        dto.setId(entity.getId());
        dto.setAgencyId(entity.getAgency().getId());
        dto.setProductId(entity.getProduct().getId());
        dto.setOldPrice(entity.getOldPrice());
        dto.setNewPrice(entity.getNewPrice());
        if (entity.getChangedBy() != null) {
            dto.setChangedById(entity.getChangedBy().getId());
            dto.setChangedByUsername(entity.getChangedBy().getUsername());
        }
        dto.setChangedAt(entity.getChangedAt());
        dto.setChangeSource(entity.getChangeSource());
        if (entity.getSourcePriceList() != null) {
            dto.setSourcePriceListId(entity.getSourcePriceList().getId());
            dto.setSourcePriceListName(entity.getSourcePriceList().getName());
        }
        return dto;
    }

    public ByteArrayInputStream exportPricesToExcel(Long agencyId) {
        List<AgencyProductPriceDTO> prices = getPricesForAgency(agencyId, null);
        Agency agency = agencyRepository.findById(agencyId).orElseThrow(() -> new RuntimeException("Agency not found"));

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Prices");

            // Header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"Mã Sản Phẩm", "Tên Sản Phẩm", "Giá Ghi Đè (VNĐ)"};
            for (int col = 0; col < headers.length; col++) {
                Cell cell = headerRow.createCell(col);
                cell.setCellValue(headers[col]);
            }

            // Data rows
            int rowIdx = 1;
            for (AgencyProductPriceDTO price : prices) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(price.getProductId());
                row.createCell(1).setCellValue(price.getProductName());
                
                Cell priceCell = row.createCell(2);
                if (price.getIsOverride()) {
                    priceCell.setCellValue(price.getPrice());
                } else {
                    priceCell.setCellValue(""); // empty to signify no override
                }
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Error exporting Excel", e);
        }
    }

    @Transactional
    public String importPricesFromExcel(Long agencyId, MultipartFile file, Long userId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        int updatedCount = 0;
        try (InputStream is = file.getInputStream(); Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                Cell productIdCell = row.getCell(0);
                Cell priceCell = row.getCell(2);

                if (productIdCell == null) continue;

                Long productId = null;
                if (productIdCell.getCellType() == CellType.NUMERIC) {
                    productId = (long) productIdCell.getNumericCellValue();
                } else if (productIdCell.getCellType() == CellType.STRING) {
                    try {
                        productId = Long.parseLong(productIdCell.getStringCellValue().trim());
                    } catch (NumberFormatException e) {
                        continue;
                    }
                }

                if (productId == null) continue;

                // If price cell has a value, override. If empty or blank, maybe we can ignore or rollback?
                // Let's just override if there's a valid number
                Double newPrice = null;
                if (priceCell != null) {
                    if (priceCell.getCellType() == CellType.NUMERIC) {
                        newPrice = priceCell.getNumericCellValue();
                    } else if (priceCell.getCellType() == CellType.STRING) {
                        try {
                            String val = priceCell.getStringCellValue().trim();
                            if (!val.isEmpty()) {
                                newPrice = Double.parseDouble(val);
                            }
                        } catch (NumberFormatException e) {
                            // skip
                        }
                    }
                }

                if (newPrice != null) {
                    overridePrice(agencyId, productId, newPrice, userId);
                    updatedCount++;
                }
            }
            return "Đã cập nhật " + updatedCount + " sản phẩm";
        } catch (Exception e) {
            throw new RuntimeException("Error importing Excel: " + e.getMessage(), e);
        }
    }
}
