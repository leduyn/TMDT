package com.anhtin.tmdt.backend.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class OrderRequest {
    private Long agencyId; // optional
    private String shippingAddress;
    private List<OrderItemRequest> items;
    private String orderType; // "DROPSHIP" hoặc "MARKETPLACE" (optional)
    private String promotionCode; // Mã giảm giá (optional)
    private Integer pointsToRedeem; // Số điểm muốn đối trừ (optional)
}
