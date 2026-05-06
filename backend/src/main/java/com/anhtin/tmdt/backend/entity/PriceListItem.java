package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Chi tiết giá từng sản phẩm trong bảng giá.
 * price = -1  → "Liên hệ" (không hiển thị giá trực tiếp).
 * isVisible   → Sản phẩm có hiển thị trong bảng giá này không.
 */
@Entity
@Table(name = "price_list_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"price_list_id", "product_id"})
})
@Getter
@Setter
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

    /**
     * Giá sản phẩm trong bảng giá này.
     * -1.0 = "Liên hệ" (giá không hiển thị).
     */
    @Column(nullable = false)
    private Double price = -1.0;

    /**
     * true  = sản phẩm hiển thị trong bảng giá này.
     * false = sản phẩm bị ẩn với đối tượng áp dụng bảng giá này.
     */
    @Column(name = "is_visible")
    private Boolean isVisible = true;
}
