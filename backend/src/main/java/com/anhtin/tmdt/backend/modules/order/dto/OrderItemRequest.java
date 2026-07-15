package com.anhtin.tmdt.backend.modules.order.dto;
import com.anhtin.tmdt.backend.modules.order.entity.Order;

public class OrderItemRequest {
    private Long productId;
    private Integer quantity;
    private Double adjustedPrice;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getAdjustedPrice() { return adjustedPrice; }
    public void setAdjustedPrice(Double adjustedPrice) { this.adjustedPrice = adjustedPrice; }
}
