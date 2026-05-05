package com.anhtin.tmdt.backend.dto.response;

import lombok.Getter;
import lombok.Setter;
import com.anhtin.tmdt.backend.entity.Product;
import com.anhtin.tmdt.backend.entity.ProductImage;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
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
