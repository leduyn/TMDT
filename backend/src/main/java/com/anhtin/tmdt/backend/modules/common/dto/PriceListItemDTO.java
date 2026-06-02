package com.anhtin.tmdt.backend.modules.common.dto;

import com.anhtin.tmdt.backend.modules.price.entity.PriceListItem;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class PriceListItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImageUrl;
    private Double price;
    private Boolean isVisible;
    private Double oldPrice;

    public PriceListItemDTO(PriceListItem item) {
        this.id = item.getId();
        this.productId = item.getProduct().getId();
        this.productName = item.getProduct().getName();
        this.productImageUrl = item.getProduct().getImageUrl();
        this.price = item.getPrice();
        this.isVisible = item.getIsVisible();
        this.oldPrice = item.getOldPrice();
    }
}
