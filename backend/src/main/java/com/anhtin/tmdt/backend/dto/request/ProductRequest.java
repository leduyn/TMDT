package com.anhtin.tmdt.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
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

    // Danh sách ảnh gallery (bao gồm ảnh chính ở vị trí đầu tiên)
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
}
