package com.anhtin.tmdt.backend.modules.common.dto;

import com.anhtin.tmdt.backend.modules.price.entity.PriceOverrideVoucher;
import com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus;
import java.time.LocalDateTime;
import java.util.List;

public class PriceOverrideVoucherDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime scheduledAt;
    private VoucherStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime appliedAt;
    private List<VoucherItemDTO> items;

    public static class VoucherItemDTO {
        private Long agencyId;
        private String agencyName;
        private Long productId;
        private String productName;
        private Double newPrice;
        private Boolean isVisible;

        public VoucherItemDTO() {}

        public Long getAgencyId() { return agencyId; }
        public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
        public String getAgencyName() { return agencyName; }
        public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public String getProductName() { return productName; }
        public void setProductName(String productName) { this.productName = productName; }
        public Double getNewPrice() { return newPrice; }
        public void setNewPrice(Double newPrice) { this.newPrice = newPrice; }
        public Boolean getIsVisible() { return isVisible; }
        public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }
    }

    public PriceOverrideVoucherDTO() {}

    public PriceOverrideVoucherDTO(PriceOverrideVoucher voucher, List<VoucherItemDTO> items) {
        this.id = voucher.getId();
        this.name = voucher.getName();
        this.description = voucher.getDescription();
        this.scheduledAt = voucher.getScheduledAt();
        this.status = voucher.getStatus();
        this.createdAt = voucher.getCreatedAt();
        this.appliedAt = voucher.getAppliedAt();
        this.items = items;
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
    public List<VoucherItemDTO> getItems() { return items; }
    public void setItems(List<VoucherItemDTO> items) { this.items = items; }
}
