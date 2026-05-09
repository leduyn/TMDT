package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }
    public Double getDropshipPrice() { return dropshipPrice; }
    public void setDropshipPrice(Double dropshipPrice) { this.dropshipPrice = dropshipPrice; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public boolean isDropship() { return isDropship; }
    public void setDropship(boolean dropship) { isDropship = dropship; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Brand getBrand() { return brand; }
    public void setBrand(Brand brand) { this.brand = brand; }
    public Boolean getIsAppVisible() { return isAppVisible; }
    public void setIsAppVisible(Boolean isAppVisible) { this.isAppVisible = isAppVisible; }
    public Boolean getIsWebVisible() { return isWebVisible; }
    public void setIsWebVisible(Boolean isWebVisible) { this.isWebVisible = isWebVisible; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public Integer getBravoOrder() { return bravoOrder; }
    public void setBravoOrder(Integer bravoOrder) { this.bravoOrder = bravoOrder; }
    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }
    public String getInnerPackaging() { return innerPackaging; }
    public void setInnerPackaging(String innerPackaging) { this.innerPackaging = innerPackaging; }
    public String getOuterPackaging() { return outerPackaging; }
    public void setOuterPackaging(String outerPackaging) { this.outerPackaging = outerPackaging; }
    public Integer getMinPurchaseQuantity() { return minPurchaseQuantity; }
    public void setMinPurchaseQuantity(Integer minPurchaseQuantity) { this.minPurchaseQuantity = minPurchaseQuantity; }
    public Integer getQuantityStep() { return quantityStep; }
    public void setQuantityStep(Integer quantityStep) { this.quantityStep = quantityStep; }
    public String getUserManual() { return userManual; }
    public void setUserManual(String userManual) { this.userManual = userManual; }
}
