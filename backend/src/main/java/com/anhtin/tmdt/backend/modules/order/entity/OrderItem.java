package com.anhtin.tmdt.backend.modules.order.entity;

import jakarta.persistence.*;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    private Integer quantity;
    private Double price;

    @Column(name = "price_list_id")
    private Long priceListId;

    @Column(name = "adjusted_price")
    private Double adjustedPrice;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Long getPriceListId() { return priceListId; }
    public void setPriceListId(Long priceListId) { this.priceListId = priceListId; }
    public Double getAdjustedPrice() { return adjustedPrice; }
    public void setAdjustedPrice(Double adjustedPrice) { this.adjustedPrice = adjustedPrice; }
}
