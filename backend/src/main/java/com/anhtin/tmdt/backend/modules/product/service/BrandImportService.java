package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.BrandImportRequest;
import com.anhtin.tmdt.backend.modules.product.dto.BrandImportResult;
import com.anhtin.tmdt.backend.modules.product.dto.BrandImportRowResult;
import com.anhtin.tmdt.backend.modules.product.dto.BrandRequest;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;
import com.anhtin.tmdt.backend.modules.product.repository.BrandRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class BrandImportService {

    @Autowired
    private BrandService brandService;

    @Autowired
    private BrandRepository brandRepository;

    public ByteArrayInputStream exportTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Import Template");

            String[] headers = {
                "Mã thương hiệu*", "Tên thương hiệu*", "Logo URL", "Bravo ID",
                "Is Highlight", "Highlight Priority", "Status", "Bravo Sort Value"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("MAKITA");
            dataRow.createCell(1).setCellValue("Makita");
            dataRow.createCell(2).setCellValue("https://example.com/logo.png");
            dataRow.createCell(3).setCellValue(1001);
            dataRow.createCell(4).setCellValue(1);
            dataRow.createCell(5).setCellValue(1);
            dataRow.createCell(6).setCellValue(1);
            dataRow.createCell(7).setCellValue("A001");

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Error exporting template", e);
        }
    }

    public ByteArrayInputStream exportBrands() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Danh sách thương hiệu");

            String[] headers = {
                "ID", "Mã thương hiệu", "Tên thương hiệu", "Logo URL", "Bravo ID",
                "Is Highlight", "Highlight Priority", "Status", "Bravo Sort Value", "Ngày tạo", "Ngày cập nhật"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            List<Brand> brands = brandRepository.findAll();
            int rowIdx = 1;
            for (Brand b : brands) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(b.getId());
                row.createCell(1).setCellValue(b.getCode() != null ? b.getCode() : "");
                row.createCell(2).setCellValue(b.getName() != null ? b.getName() : "");
                row.createCell(3).setCellValue(b.getLogoUrl() != null ? b.getLogoUrl() : "");
                row.createCell(4).setCellValue(b.getBravoId() != null ? b.getBravoId() : 0);
                row.createCell(5).setCellValue(b.getIsHighlight() != null ? b.getIsHighlight() : 0);
                row.createCell(6).setCellValue(b.getHighlightPriority() != null ? b.getHighlightPriority() : 0);
                row.createCell(7).setCellValue(b.getStatus() != null ? b.getStatus() : 1);
                row.createCell(8).setCellValue(b.getBravoSortValue() != null ? b.getBravoSortValue() : "");
                row.createCell(9).setCellValue(b.getCreatedDate() != null ? b.getCreatedDate().toString() : "");
                row.createCell(10).setCellValue(b.getUpdatedDate() != null ? b.getUpdatedDate().toString() : "");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Error exporting brands", e);
        }
    }

    public BrandImportResult importBrands(MultipartFile file, BrandImportRequest request) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        BrandImportResult result = new BrandImportResult();
        List<BrandImportRowResult> rowResults = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(request.getSheetIndex());
            Map<String, String> mappings = request.getColumnMappings();

            int startRow = request.isHasHeaderRow() ? 1 : 0;
            String[] columnHeaders = null;

            if (request.isHasHeaderRow()) {
                Row headerRow = sheet.getRow(0);
                if (headerRow != null) {
                    columnHeaders = new String[headerRow.getLastCellNum()];
                    for (int c = 0; c < headerRow.getLastCellNum(); c++) {
                        columnHeaders[c] = getCellValueAsString(headerRow.getCell(c));
                    }
                }
            }

            int totalRows = 0;
            int successCount = 0;
            int errorCount = 0;

            for (int i = startRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                totalRows++;

                try {
                    BrandRequest brandRequest = buildBrandRequest(row, mappings, columnHeaders);

                    if (brandRequest.getCode() == null || brandRequest.getCode().isBlank()) {
                        throw new IllegalArgumentException("Mã thương hiệu không được để trống");
                    }
                    if (brandRequest.getName() == null || brandRequest.getName().isBlank()) {
                        throw new IllegalArgumentException("Tên thương hiệu không được để trống");
                    }

                    Optional<Brand> existing = brandRepository.findByCode(brandRequest.getCode());
                    if (existing.isPresent()) {
                        brandService.updateBrand(existing.get().getId(), brandRequest);
                        successCount++;
                        rowResults.add(new BrandImportRowResult(
                            i + 1, true, "Đã cập nhật", existing.get().getId(), brandRequest.getName()
                        ));
                    } else {
                        var dto = brandService.createBrand(brandRequest);
                        successCount++;
                        rowResults.add(new BrandImportRowResult(
                            i + 1, true, "Đã tạo mới", dto.getId(), dto.getName()
                        ));
                    }
                } catch (Exception e) {
                    errorCount++;
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "Lỗi không xác định";
                    if (errorMsg.length() > 200) errorMsg = errorMsg.substring(0, 200);
                    rowResults.add(new BrandImportRowResult(
                        i + 1, false, errorMsg, null, null
                    ));
                }
            }

            result.setTotalRows(totalRows);
            result.setSuccessCount(successCount);
            result.setErrorCount(errorCount);
            result.setRowResults(rowResults);

        } catch (Exception e) {
            throw new RuntimeException("Error importing file: " + e.getMessage(), e);
        }

        return result;
    }

    private BrandRequest buildBrandRequest(Row row, Map<String, String> mappings, String[] columnHeaders) {
        BrandRequest req = new BrandRequest();

        for (Map.Entry<String, String> entry : mappings.entrySet()) {
            String columnKey = entry.getKey();
            String field = entry.getValue();
            if (field == null || field.isEmpty()) continue;

            int colIndex = resolveColumnIndex(columnKey, columnHeaders);
            if (colIndex < 0) continue;

            String rawValue = getCellValueAsString(row.getCell(colIndex));
            if (rawValue == null || rawValue.isEmpty()) continue;

            setField(req, field, rawValue.trim());
        }

        return req;
    }

    private int resolveColumnIndex(String columnKey, String[] columnHeaders) {
        if (columnHeaders != null) {
            String cleanKey = columnKey.replace("*", "").trim();
            for (int i = 0; i < columnHeaders.length; i++) {
                if (columnHeaders[i] != null && columnHeaders[i].replace("*", "").trim().equalsIgnoreCase(cleanKey)) {
                    return i;
                }
            }
            for (int i = 0; i < columnHeaders.length; i++) {
                if (columnHeaders[i] != null && columnHeaders[i].replace("*", "").trim().toLowerCase()
                        .contains(cleanKey.toLowerCase())) {
                    return i;
                }
            }
        }
        if (columnKey.startsWith("col_")) {
            try {
                return Integer.parseInt(columnKey.substring(4));
            } catch (NumberFormatException e) {
                return -1;
            }
        }
        return -1;
    }

    private void setField(BrandRequest req, String field, String value) {
        try {
            switch (field) {
                case "code":
                    req.setCode(value);
                    break;
                case "name":
                    req.setName(value);
                    break;
                case "logoUrl":
                    req.setLogoUrl(value);
                    break;
                case "bravoId":
                    req.setBravoId(parseLong(value));
                    break;
                case "isHighlight":
                    req.setIsHighlight(parseInt(value));
                    break;
                case "highlightPriority":
                    req.setHighlightPriority(parseInt(value));
                    break;
                case "status":
                    req.setStatus(parseInt(value));
                    break;
                case "bravoSortValue":
                    req.setBravoSortValue(value);
                    break;
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Giá trị '" + value + "' không hợp lệ cho trường " + field, e);
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val) && !Double.isInfinite(val)) {
                    yield String.valueOf((long) val);
                }
                yield String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield String.valueOf((int) cell.getNumericCellValue());
                } catch (Exception e) {
                    try {
                        yield cell.getStringCellValue();
                    } catch (Exception e2) {
                        yield "";
                    }
                }
            }
            default -> "";
        };
    }

    private long parseLong(String value) {
        return Long.parseLong(value.replace(",", "").replace(" ", ""));
    }

    private int parseInt(String value) {
        return Integer.parseInt(value.replace(",", "").replace(" ", ""));
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
}
