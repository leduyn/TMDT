package com.anhtin.tmdt.backend.dto.request;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class OrderRequest {
    private Long agencyId;
    private Long customerId;
    private NewCustomerInfo newCustomerInfo;
    private String shippingAddress;
    private List<OrderItemRequest> items;
    private String orderType;
    private String promotionCode;
    private Integer pointsToRedeem;

    @Data
    public static class NewCustomerInfo {
        private String name;
        private String phone;
        private String shippingAddress;
        private String invoiceName;
        private String invoiceTaxCode;
        private String invoiceAddress;
    }
}