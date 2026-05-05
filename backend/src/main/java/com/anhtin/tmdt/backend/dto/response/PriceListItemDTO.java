package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.PriceListItem;
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

    public PriceListItemDTO(PriceListItem item) {
        this.id = item.getId();
        this.productId = item.getProduct().getId();
        this.productName = item.getProduct().getName();
        this.productImageUrl = item.getProduct().getImageUrl();
        this.price = item.getPrice();
        this.isVisible = item.getIsVisible();
    }
}
