package com.anhtin.tmdt.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class PriceListItemUpdateRequest {
    private Long productId;
    private Double price;
    private Boolean isVisible;
}
