package com.anhtin.tmdt.backend.modules.order.dto;
import com.anhtin.tmdt.backend.modules.order.entity.Order;

public class OrderItemRequest {
    private Long productId;
    private Integer quantity;

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
