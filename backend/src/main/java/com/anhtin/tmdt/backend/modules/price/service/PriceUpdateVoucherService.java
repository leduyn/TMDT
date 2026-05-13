package com.anhtin.tmdt.backend.modules.price.service;

import com.anhtin.tmdt.backend.modules.price.dto.PriceUpdateVoucherRequest;
import com.anhtin.tmdt.backend.modules.common.dto.PriceUpdateVoucherDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.price.repository.PriceListItemRepository;
import com.anhtin.tmdt.backend.modules.price.entity.PriceUpdateVoucherPriceList;
import com.anhtin.tmdt.backend.modules.price.entity.PriceUpdateVoucherItem;
import com.anhtin.tmdt.backend.modules.price.entity.PriceUpdateVoucher;
import com.anhtin.tmdt.backend.modules.price.repository.PriceListRepository;
import com.anhtin.tmdt.backend.modules.price.entity.PriceList;
import com.anhtin.tmdt.backend.modules.price.repository.PriceUpdateVoucherPriceListRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.price.repository.PriceUpdateVoucherItemRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListItem;
import com.anhtin.tmdt.backend.modules.price.repository.PriceUpdateVoucherRepository;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

@Service
public class PriceUpdateVoucherService {

    @Autowired
    private PriceUpdateVoucherRepository voucherRepository;

    @Autowired
    private PriceUpdateVoucherItemRepository voucherItemRepository;

    @Autowired
    private PriceUpdateVoucherPriceListRepository voucherPriceListRepository;

    @Autowired
    private PriceListItemRepository priceListItemRepository;

    @Autowired
    private PriceListRepository priceListRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<PriceUpdateVoucherDTO> getAllVouchers() {
        return voucherRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PriceUpdateVoucherDTO getVoucherById(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        PriceUpdateVoucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        return convertToDTO(voucher);
    }

    @SuppressWarnings("null")
    @Transactional
    public PriceUpdateVoucherDTO createVoucher(PriceUpdateVoucherRequest request) {
        // Suppress or handle the loop null checks
        if (request.getName() == null) throw new IllegalArgumentException("Name cannot be null");
        PriceUpdateVoucher voucher = new PriceUpdateVoucher();
        voucher.setName(request.getName());
        voucher.setDescription(request.getDescription());
        voucher.setScheduledAt(request.getScheduledAt());
        voucher.setStatus(VoucherStatus.PENDING);
        PriceUpdateVoucher saved = voucherRepository.save(voucher);

        // Save target price lists
        if (request.getPriceListIds() != null) {
            for (Long plId : request.getPriceListIds()) {
                if (plId == null) continue;
                PriceList pl = priceListRepository.findById(plId).orElseThrow();
                PriceUpdateVoucherPriceList vpl = new PriceUpdateVoucherPriceList();
                vpl.setVoucher(saved);
                vpl.setPriceList(pl);
                voucherPriceListRepository.save(vpl);
            }
        }

        // Save items
        if (request.getItems() != null) {
            for (PriceUpdateVoucherRequest.VoucherItemRequest itemReq : request.getItems()) {
                if (itemReq == null || itemReq.getProductId() == null) continue;
                Product product = productRepository.findById(itemReq.getProductId()).orElseThrow();
                PriceUpdateVoucherItem item = new PriceUpdateVoucherItem();
                item.setVoucher(saved);
                item.setProduct(product);
                item.setNewPrice(itemReq.getNewPrice());
                item.setIsVisible(itemReq.getIsVisible() != null ? itemReq.getIsVisible() : true);
                voucherItemRepository.save(item);
            }
        }

        return convertToDTO(saved);
    }

    @Transactional
    public void cancelVoucher(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        PriceUpdateVoucher voucher = voucherRepository.findById(id)
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
        PriceUpdateVoucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));
        
        if (voucher.getStatus() != VoucherStatus.PENDING) {
            return; // Already processed
        }

        List<PriceUpdateVoucherPriceList> targetLists = voucherPriceListRepository.findByVoucherId(id);
        List<PriceUpdateVoucherItem> items = voucherItemRepository.findByVoucherId(id);

        for (PriceUpdateVoucherPriceList vpl : targetLists) {
            Long plId = vpl.getPriceList().getId();
            for (PriceUpdateVoucherItem vItem : items) {
                PriceListItem plItem = priceListItemRepository
                        .findByPriceListIdAndProductId(plId, vItem.getProduct().getId())
                        .orElseGet(() -> {
                            // Should exist due to auto-add hook, but safety first
                            PriceListItem ni = new PriceListItem();
                            ni.setPriceList(vpl.getPriceList());
                            ni.setProduct(vItem.getProduct());
                            return ni;
                        });
                
                plItem.setPrice(vItem.getNewPrice());
                plItem.setIsVisible(vItem.getIsVisible());
                priceListItemRepository.save(plItem);
            }
        }

        voucher.setStatus(VoucherStatus.APPLIED);
        voucher.setAppliedAt(LocalDateTime.now());
        voucherRepository.save(voucher);
    }

    @Transactional
    public void applyPendingVouchers() {
        List<PriceUpdateVoucher> pending = voucherRepository
                .findByStatusAndScheduledAtBefore(VoucherStatus.PENDING, LocalDateTime.now());
        for (PriceUpdateVoucher v : pending) {
            applyVoucher(v.getId());
        }
    }

    private PriceUpdateVoucherDTO convertToDTO(PriceUpdateVoucher voucher) {
        List<Long> plIds = voucherPriceListRepository.findByVoucherId(voucher.getId()).stream()
                .map(vpl -> vpl.getPriceList().getId())
                .collect(Collectors.toList());
        
        List<PriceUpdateVoucherDTO.VoucherItemDTO> items = voucherItemRepository.findByVoucherId(voucher.getId()).stream()
                .map(i -> {
                    PriceUpdateVoucherDTO.VoucherItemDTO dto = new PriceUpdateVoucherDTO.VoucherItemDTO();
                    dto.setProductId(i.getProduct().getId());
                    dto.setProductName(i.getProduct().getName());
                    dto.setNewPrice(i.getNewPrice());
                    dto.setIsVisible(i.getIsVisible());
                    return dto;
                }).collect(Collectors.toList());

        return new PriceUpdateVoucherDTO(voucher, plIds, items);
    }
}
