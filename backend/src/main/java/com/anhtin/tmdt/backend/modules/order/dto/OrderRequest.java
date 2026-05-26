package com.anhtin.tmdt.backend.modules.order.dto;

import java.util.List;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.order.entity.OrderType;

public class OrderRequest {
    private Long agencyId;
    private Long customerId;
    private NewCustomerInfo newCustomerInfo;
    private String shippingAddress;
    private List<OrderItemRequest> items;
    private String orderType;
    private String promotionCode;
    private Integer pointsToRedeem;
    private Double deliveryFee;
    private Integer debtTermDays;

    public static class NewCustomerInfo {
        private String name;
        private String phone;
        private String shippingAddress;
        private String invoiceName;
        private String invoiceTaxCode;
        private String invoiceAddress;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getShippingAddress() { return shippingAddress; }
        public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
        public String getInvoiceName() { return invoiceName; }
        public void setInvoiceName(String invoiceName) { this.invoiceName = invoiceName; }
        public String getInvoiceTaxCode() { return invoiceTaxCode; }
        public void setInvoiceTaxCode(String invoiceTaxCode) { this.invoiceTaxCode = invoiceTaxCode; }
        public String getInvoiceAddress() { return invoiceAddress; }
        public void setInvoiceAddress(String invoiceAddress) { this.invoiceAddress = invoiceAddress; }
    }

    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public NewCustomerInfo getNewCustomerInfo() { return newCustomerInfo; }
    public void setNewCustomerInfo(NewCustomerInfo newCustomerInfo) { this.newCustomerInfo = newCustomerInfo; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public List<OrderItemRequest> getItems() { return items; }
    public void setItems(List<OrderItemRequest> items) { this.items = items; }
    public String getOrderType() { return orderType; }
    public void setOrderType(String orderType) { this.orderType = orderType; }
    public String getPromotionCode() { return promotionCode; }
    public void setPromotionCode(String promotionCode) { this.promotionCode = promotionCode; }
    public Integer getPointsToRedeem() { return pointsToRedeem; }
    public void setPointsToRedeem(Integer pointsToRedeem) { this.pointsToRedeem = pointsToRedeem; }
    public Double getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(Double deliveryFee) { this.deliveryFee = deliveryFee; }
    public Integer getDebtTermDays() { return debtTermDays; }
    public void setDebtTermDays(Integer debtTermDays) { this.debtTermDays = debtTermDays; }
}
