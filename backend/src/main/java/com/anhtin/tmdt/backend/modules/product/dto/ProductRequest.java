package com.anhtin.tmdt.backend.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

/**
 * Request DTO for creating or updating a product.
 */
public class ProductRequest {
    @NotBlank
    private String name;

    private String description;

    @NotNull
    private Long categoryId;

    private Long brandId;

    @NotNull
    private Double basePrice;

    private Double dropshipPrice;

    @NotNull
    private Integer stockQuantity;

    private boolean isDropship;

    private String imageUrl;

    private List<String> imageUrls;

    private List<Long> attributeValueIds;

    private Boolean isAppVisible = true;
    private Boolean isWebVisible = true;
    private String tags;
    private Integer bravoOrder;
    private String unit;
    private String innerPackaging;
    private String outerPackaging;
    private Integer minPurchaseQuantity = 1;
    private Integer quantityStep = 1;
    private String userManual;
    private Boolean showDiscount = false;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getBrandId() { return brandId; }
    public void setBrandId(Long brandId) { this.brandId = brandId; }
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
    public List<Long> getAttributeValueIds() { return attributeValueIds; }
    public void setAttributeValueIds(List<Long> attributeValueIds) { this.attributeValueIds = attributeValueIds; }
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
}
