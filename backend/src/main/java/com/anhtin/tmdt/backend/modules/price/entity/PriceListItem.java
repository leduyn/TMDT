package com.anhtin.tmdt.backend.modules.price.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

/**
 * Chi tiết giá từng sản phẩm trong bảng giá.
 * price = -1  → "Liên hệ" (không hiển thị giá trực tiếp).
 * isVisible   → Sản phẩm có hiển thị trong bảng giá này không.
 */
@Entity
@Table(name = "price_list_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"price_list_id", "product_id"})
})
@NoArgsConstructor
@AllArgsConstructor
public class PriceListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_list_id", nullable = false)
    private PriceList priceList;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Double price = -1.0;

    @Column(name = "is_visible")
    private Boolean isVisible = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PriceList getPriceList() { return priceList; }
    public void setPriceList(PriceList priceList) { this.priceList = priceList; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Boolean getIsVisible() { return isVisible; }
    public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }
}
