package com.anhtin.tmdt.backend.modules.common.dto;

import com.anhtin.tmdt.backend.modules.price.entity.PriceUpdateVoucher;
import com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus;
import java.time.LocalDateTime;
import java.util.List;

public class PriceUpdateVoucherDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime scheduledAt;
    private VoucherStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime appliedAt;
    private List<Long> priceListIds;
    private List<VoucherItemDTO> items;

    public static class VoucherItemDTO {
        private Long productId;
        private String productName;
        private Double newPrice;
        private Boolean isVisible;

        public VoucherItemDTO() {}

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public Double getNewPrice() { return newPrice; }
        public void setNewPrice(Double newPrice) { this.newPrice = newPrice; }
        public Boolean getIsVisible() { return isVisible; }
        public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }
    public VoucherStatus getStatus() { return status; }
    public void setStatus(VoucherStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getAppliedAt() { return appliedAt; }
    public void setAppliedAt(LocalDateTime appliedAt) { this.appliedAt = appliedAt; }
    public List<Long> getPriceListIds() { return priceListIds; }
    public void setPriceListIds(List<Long> priceListIds) { this.priceListIds = priceListIds; }
    public List<VoucherItemDTO> getItems() { return items; }
    public void setItems(List<VoucherItemDTO> items) { this.items = items; }

    public PriceUpdateVoucherDTO(PriceUpdateVoucher voucher, List<Long> priceListIds, List<VoucherItemDTO> items) {
        this.id = voucher.getId();
        this.name = voucher.getName();
        this.description = voucher.getDescription();
        this.scheduledAt = voucher.getScheduledAt();
        this.status = voucher.getStatus();
        this.createdAt = voucher.getCreatedAt();
        this.appliedAt = voucher.getAppliedAt();
        this.priceListIds = priceListIds;
        this.items = items;
    }
}
