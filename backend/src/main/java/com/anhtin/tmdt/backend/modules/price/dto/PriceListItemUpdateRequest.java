package com.anhtin.tmdt.backend.modules.price.dto;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class PriceListItemUpdateRequest {
    private Long productId;
    private Double price;
    private Boolean isVisible;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Boolean getIsVisible() { return isVisible; }
    public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }
}
