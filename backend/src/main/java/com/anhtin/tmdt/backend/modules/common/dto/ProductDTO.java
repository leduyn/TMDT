package com.anhtin.tmdt.backend.modules.common.dto;

import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.entity.ProductImage;

import java.util.List;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;
import com.anhtin.tmdt.backend.modules.salespolicy.dto.ProductPolicyPreviewDTO;

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
    private ProductTypeDTO productType;
    private Double appliedPrice;
    private String appliedPriceListName;
    private Long appliedPriceListId;
    private Boolean showDiscount;
    private Double oldAppliedPrice;
    private Double priceChangeRatio;

    private Boolean retailPriceEligible;
    private ProductPolicyPreviewDTO policyPreview;

    public Boolean getRetailPriceEligible() { return retailPriceEligible; }
    public void setRetailPriceEligible(Boolean v) { this.retailPriceEligible = v; }
    public ProductPolicyPreviewDTO getPolicyPreview() { return policyPreview; }
    public void setPolicyPreview(ProductPolicyPreviewDTO v) { this.policyPreview = v; }

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

    private String productCode;
    private String retailWarrantyPeriod;
    private String wholesaleWarrantyPeriod;
    private String status;
    private String otherName;
    private String shortName;
    private String specification;
    private String feature1;
    private String feature2;

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
    public ProductTypeDTO getProductType() { return productType; }
    public void setProductType(ProductTypeDTO productType) { this.productType = productType; }
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
    public Boolean getShowDiscount() { return showDiscount; }
    public void setShowDiscount(Boolean showDiscount) { this.showDiscount = showDiscount; }
    public Double getOldAppliedPrice() { return oldAppliedPrice; }
    public void setOldAppliedPrice(Double oldAppliedPrice) { this.oldAppliedPrice = oldAppliedPrice; }
    public Double getPriceChangeRatio() { return priceChangeRatio; }
    public void setPriceChangeRatio(Double priceChangeRatio) { this.priceChangeRatio = priceChangeRatio; }
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
    
    public BrandDTO getBrand() { return brand; }

    public ProductDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.basePrice = product.getBasePrice();
        this.dropshipPrice = product.getDropshipPrice();
        this.stockQuantity = product.getStockQuantity();
        this.isDropship = product.getDropship() != null ? product.getDropship() : false;
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
        this.showDiscount = product.getShowDiscount() != null ? product.getShowDiscount() : false;
        this.productCode = product.getProductCode();
        this.retailWarrantyPeriod = product.getRetailWarrantyPeriod();
        this.wholesaleWarrantyPeriod = product.getWholesaleWarrantyPeriod();
        this.status = product.getStatus();
        this.otherName = product.getOtherName();
        this.shortName = product.getShortName();
        this.specification = product.getSpecification();
        this.feature1 = product.getFeature1();
        this.feature2 = product.getFeature2();
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
        if (product.getProductType() != null) {
            this.productType = new ProductTypeDTO(
                product.getProductType().getId(),
                product.getProductType().getCode(),
                product.getProductType().getName(),
                product.getProductType().getDescription()
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
