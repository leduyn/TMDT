package com.anhtin.tmdt.backend.modules.product.entity;

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
    private Boolean isDropship = false;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_type_id")
    private ProductType productType;

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

    @Column(name = "show_discount")
    private Boolean showDiscount = false;

    @Column(name = "product_code", unique = true, nullable = false, length = 100)
    private String productCode;

    @Column(name = "retail_warranty_period", length = 100)
    private String retailWarrantyPeriod;

    @Column(name = "wholesale_warranty_period", length = 100)
    private String wholesaleWarrantyPeriod;

    @Column(name = "status", length = 50)
    private String status = "ACTIVE";

    @Column(name = "other_name", length = 500)
    private String otherName;

    @Column(name = "short_name", length = 300)
    private String shortName;

    @Column(name = "specification", length = 1000)
    private String specification;

    @Column(name = "feature1", length = 500)
    private String feature1;

    @Column(name = "feature2", length = 500)
    private String feature2;

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
    public Boolean getDropship() { return isDropship; }
    public void setDropship(Boolean dropship) { isDropship = dropship; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Brand getBrand() { return brand; }
    public void setBrand(Brand brand) { this.brand = brand; }
    public ProductType getProductType() { return productType; }
    public void setProductType(ProductType productType) { this.productType = productType; }
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
    public Boolean getShowDiscount() { return showDiscount; }
    public void setShowDiscount(Boolean showDiscount) { this.showDiscount = showDiscount; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public String getRetailWarrantyPeriod() { return retailWarrantyPeriod; }
    public void setRetailWarrantyPeriod(String retailWarrantyPeriod) { this.retailWarrantyPeriod = retailWarrantyPeriod; }
    public String getWholesaleWarrantyPeriod() { return wholesaleWarrantyPeriod; }
    public void setWholesaleWarrantyPeriod(String wholesaleWarrantyPeriod) { this.wholesaleWarrantyPeriod = wholesaleWarrantyPeriod; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getOtherName() { return otherName; }
    public void setOtherName(String otherName) { this.otherName = otherName; }
    public String getShortName() { return shortName; }
    public void setShortName(String shortName) { this.shortName = shortName; }
    public String getSpecification() { return specification; }
    public void setSpecification(String specification) { this.specification = specification; }
    public String getFeature1() { return feature1; }
    public void setFeature1(String feature1) { this.feature1 = feature1; }
    public String getFeature2() { return feature2; }
    public void setFeature2(String feature2) { this.feature2 = feature2; }
}
