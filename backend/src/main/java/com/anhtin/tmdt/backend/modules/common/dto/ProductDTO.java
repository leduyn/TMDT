package com.anhtin.tmdt.backend.modules.common.dto;

import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.entity.ProductImage;

import java.util.List;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;

/**
 * Response DTO for product information.
 */
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private Double basePrice;
    private Double dropshipPrice;
    private Integer stockQuantity;
    private boolean isDropship;
    private String imageUrl;
    private List<String> imageUrls;
    private Long categoryId;
    private String categoryName;
    private BrandDTO brand;
    private Double appliedPrice;
    private String appliedPriceListName;
    private Long appliedPriceListId;

    private Boolean isAppVisible;
    private Boolean isWebVisible;
    private String tags;
    private Integer bravoOrder;
    private String unit;
    private String innerPackaging;
    private String outerPackaging;
    private Integer minPurchaseQuantity;
    private Integer quantityStep;
    private String userManual;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
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
    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public BrandDTO brand() { return brand; }
    public void setBrand(BrandDTO brand) { this.brand = brand; }
    public Double getAppliedPrice() { return appliedPrice; }
    public void setAppliedPrice(Double appliedPrice) { this.appliedPrice = appliedPrice; }
    public String getAppliedPriceListName() { return appliedPriceListName; }
    public void setAppliedPriceListName(String appliedPriceListName) { this.appliedPriceListName = appliedPriceListName; }
    public Long getAppliedPriceListId() { return appliedPriceListId; }
    public void setAppliedPriceListId(Long appliedPriceListId) { this.appliedPriceListId = appliedPriceListId; }
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
    
    public BrandDTO getBrand() { return brand; }

    public ProductDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.basePrice = product.getBasePrice();
        this.dropshipPrice = product.getDropshipPrice();
        this.stockQuantity = product.getStockQuantity();
        this.isDropship = product.isDropship();
        this.imageUrl = product.getImageUrl();
        this.isAppVisible = product.getIsAppVisible() != null ? product.getIsAppVisible() : true;
        this.isWebVisible = product.getIsWebVisible() != null ? product.getIsWebVisible() : true;
        this.tags = product.getTags();
        this.bravoOrder = product.getBravoOrder();
        this.unit = product.getUnit();
        this.innerPackaging = product.getInnerPackaging();
        this.outerPackaging = product.getOuterPackaging();
        this.minPurchaseQuantity = product.getMinPurchaseQuantity();
        this.quantityStep = product.getQuantityStep();
        this.userManual = product.getUserManual();
        if (product.getCategory() != null) {
            this.categoryId = product.getCategory().getId();
            this.categoryName = product.getCategory().getName();
        }
        if (product.getBrand() != null) {
            this.brand = new BrandDTO(
                product.getBrand().getId(),
                product.getBrand().getCode(),
                product.getBrand().getName(),
                product.getBrand().getLogoUrl()
            );
        }
    }

    public ProductDTO(Product product, List<ProductImage> images) {
        this(product);
        if (images != null) {
            this.imageUrls = images.stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList());
        }
    }
}
