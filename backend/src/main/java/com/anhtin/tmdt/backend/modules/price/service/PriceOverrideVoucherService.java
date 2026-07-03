package com.anhtin.tmdt.backend.modules.price.service;

import com.anhtin.tmdt.backend.modules.price.dto.PriceOverrideVoucherRequest;
import com.anhtin.tmdt.backend.modules.common.dto.PriceOverrideVoucherDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.anhtin.tmdt.backend.modules.price.entity.PriceOverrideVoucher;
import com.anhtin.tmdt.backend.modules.price.entity.PriceOverrideVoucherItem;
import com.anhtin.tmdt.backend.modules.price.repository.PriceOverrideVoucherRepository;
import com.anhtin.tmdt.backend.modules.price.repository.PriceOverrideVoucherItemRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPrice;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPriceHistory;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductPriceHistoryRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus;

@Service
public class PriceOverrideVoucherService {

    @Autowired
    private PriceOverrideVoucherRepository voucherRepository;

    @Autowired
    private PriceOverrideVoucherItemRepository itemRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AgencyProductPriceRepository agencyProductPriceRepository;

    @Autowired
    private AgencyProductPriceHistoryRepository historyRepository;

    public List<PriceOverrideVoucherDTO> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Page<PriceOverrideVoucherDTO> getAllVouchers(Pageable pageable) {
        return voucherRepository.findAll(pageable).map(this::convertToDTO);
    }

    public PriceOverrideVoucherDTO getVoucherById(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        PriceOverrideVoucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        return convertToDTO(voucher);
    }

    @Transactional
    public PriceOverrideVoucherDTO createVoucher(PriceOverrideVoucherRequest request) {
        if (request.getName() == null) throw new IllegalArgumentException("Name cannot be null");
        PriceOverrideVoucher voucher = new PriceOverrideVoucher();
        voucher.setName(request.getName());
        voucher.setDescription(request.getDescription());
        voucher.setScheduledAt(request.getScheduledAt());
        voucher.setStatus(VoucherStatus.PENDING);
        PriceOverrideVoucher saved = voucherRepository.save(voucher);

        if (request.getItems() != null) {
            for (PriceOverrideVoucherRequest.VoucherItemRequest itemReq : request.getItems()) {
                if (itemReq == null || itemReq.getAgencyId() == null || itemReq.getProductId() == null) continue;
                Agency agency = agencyRepository.findById(itemReq.getAgencyId()).orElseThrow();
                Product product = productRepository.findById(itemReq.getProductId()).orElseThrow();
                PriceOverrideVoucherItem item = new PriceOverrideVoucherItem();
                item.setVoucher(saved);
                item.setAgency(agency);
                item.setProduct(product);
                item.setNewPrice(itemReq.getNewPrice());
                item.setIsVisible(itemReq.getIsVisible() != null ? itemReq.getIsVisible() : true);
                itemRepository.save(item);
            }
        }

        return convertToDTO(saved);
    }

    @Transactional
    public void cancelVoucher(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        PriceOverrideVoucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        if (voucher.getStatus() != VoucherStatus.PENDING) {
            throw new RuntimeException("Can only cancel pending vouchers");
        }
        voucher.setStatus(VoucherStatus.CANCELLED);
        voucherRepository.save(voucher);
    }

    @Transactional
    public void applyVoucher(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        PriceOverrideVoucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        if (voucher.getStatus() != VoucherStatus.PENDING) {
            return;
        }

        List<PriceOverrideVoucherItem> items = itemRepository.findByVoucherId(id);

        for (PriceOverrideVoucherItem vItem : items) {
            Long agencyId = vItem.getAgency().getId();
            Long productId = vItem.getProduct().getId();

            AgencyProductPrice app = agencyProductPriceRepository
                    .findByAgencyIdAndProductId(agencyId, productId)
                    .orElse(new AgencyProductPrice());

            Double oldPrice = app.getId() != null ? app.getPrice() : null;

            app.setAgency(vItem.getAgency());
            app.setProduct(vItem.getProduct());
            app.setPrice(vItem.getNewPrice());
            if (oldPrice != null) {
                app.setOldPrice(oldPrice);
            }
            app.setIsOverride(true);
            app.setSourcePriceList(null);
            app.setUpdatedAt(LocalDateTime.now());
            agencyProductPriceRepository.save(app);

            // Save history
            AgencyProductPriceHistory history = new AgencyProductPriceHistory();
            history.setAgencyProductPrice(app);
            history.setAgency(vItem.getAgency());
            history.setProduct(vItem.getProduct());
            history.setOldPrice(oldPrice);
            history.setNewPrice(vItem.getNewPrice());
            history.setChangedAt(LocalDateTime.now());
            history.setChangeSource("VOUCHER_OVERRIDE");
            historyRepository.save(history);
        }

        voucher.setStatus(VoucherStatus.APPLIED);
        voucher.setAppliedAt(LocalDateTime.now());
        voucherRepository.save(voucher);
    }

    @Transactional
    public void applyPendingVouchers() {
        List<PriceOverrideVoucher> pending = voucherRepository
                .findByStatusAndScheduledAtBefore(VoucherStatus.PENDING, LocalDateTime.now());
        for (PriceOverrideVoucher v : pending) {
            applyVoucher(v.getId());
        }
    }

    private PriceOverrideVoucherDTO convertToDTO(PriceOverrideVoucher voucher) {
        List<PriceOverrideVoucherDTO.VoucherItemDTO> items = itemRepository.findByVoucherId(voucher.getId()).stream()
                .map(i -> {
                    PriceOverrideVoucherDTO.VoucherItemDTO dto = new PriceOverrideVoucherDTO.VoucherItemDTO();
                    dto.setAgencyId(i.getAgency().getId());
                    dto.setAgencyName(i.getAgency().getName());
                    dto.setProductId(i.getProduct().getId());
                    dto.setProductName(i.getProduct().getName());
                    dto.setNewPrice(i.getNewPrice());
                    dto.setIsVisible(i.getIsVisible());
                    return dto;
                }).collect(Collectors.toList());

        return new PriceOverrideVoucherDTO(voucher, items);
    }
}
