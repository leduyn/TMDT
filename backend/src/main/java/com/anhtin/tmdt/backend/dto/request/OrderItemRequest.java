package com.anhtin.tmdt.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderItemRequest {
    private Long productId;
    private Integer quantity;
}
