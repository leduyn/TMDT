package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "base_price", nullable = false)
    private Double basePrice;

    @Column(name = "dropship_price")
    private Double dropshipPrice;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Column(name = "is_dropship")
    private boolean isDropship;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(name = "is_app_visible")
    private Boolean isAppVisible = true;

    @Column(name = "is_web_visible")
    private Boolean isWebVisible = true;

    @Column(name = "tags")
    private String tags;

    @Column(name = "bravo_order")
    private Integer bravoOrder;

    @Column(name = "unit")
    private String unit;

    @Column(name = "inner_packaging")
    private String innerPackaging;

    @Column(name = "outer_packaging")
    private String outerPackaging;

    @Column(name = "min_purchase_quantity")
    private Integer minPurchaseQuantity = 1;

    @Column(name = "quantity_step")
    private Integer quantityStep = 1;

    @Column(name = "user_manual", columnDefinition = "TEXT")
    private String userManual;
}
