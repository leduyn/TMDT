package com.anhtin.tmdt.backend.modules.price.dto;

import java.time.LocalDateTime;
import java.util.List;

public class PriceUpdateVoucherRequest {
    private String name;
    private String description;
    private LocalDateTime scheduledAt;
    private List<Long> priceListIds;
    private List<VoucherItemRequest> items;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public List<Long> getPriceListIds() { return priceListIds; }
    public void setPriceListIds(List<Long> priceListIds) { this.priceListIds = priceListIds; }

    public List<VoucherItemRequest> getItems() { return items; }
    public void setItems(List<VoucherItemRequest> items) { this.items = items; }

    public static class VoucherItemRequest {
        private Long productId;
        private Double newPrice;
        private Boolean isVisible;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Double getNewPrice() { return newPrice; }
        public void setNewPrice(Double newPrice) { this.newPrice = newPrice; }

        public Boolean getIsVisible() { return isVisible; }
        public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }
    }
}
