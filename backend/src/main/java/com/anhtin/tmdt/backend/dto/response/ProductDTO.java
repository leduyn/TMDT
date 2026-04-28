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

    public ProductDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.basePrice = product.getBasePrice();
        this.dropshipPrice = product.getDropshipPrice();
        this.stockQuantity = product.getStockQuantity();
        this.isDropship = product.isDropship();
        this.imageUrl = product.getImageUrl();
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
