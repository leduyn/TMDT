package com.anhtin.tmdt.backend.modules.customer.dto;

import com.anhtin.tmdt.backend.modules.customer.entity.Customer;

public class CustomerDTO {
    private Long id;
    private Long agencyId;
    private String organizationName;
    private String taxCode;
    private String shippingAddress;
    private String billingAddress;
    private String receiverName;
    private String receiverPhone;
    private String note;
    private String createdAt;
    private String updatedAt;

    public CustomerDTO() {}

    public CustomerDTO(Customer customer) {
        this.id = customer.getId();
        this.agencyId = customer.getAgencyId();
        this.organizationName = customer.getOrganizationName();
        this.taxCode = customer.getTaxCode();
        this.shippingAddress = customer.getShippingAddress();
        this.billingAddress = customer.getBillingAddress();
        this.receiverName = customer.getReceiverName();
        this.receiverPhone = customer.getReceiverPhone();
        this.note = customer.getNote();
        this.createdAt = customer.getCreatedAt() != null ? customer.getCreatedAt().toString() : null;
        this.updatedAt = customer.getUpdatedAt() != null ? customer.getUpdatedAt().toString() : null;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getReceiverPhone() { return receiverPhone; }
    public void setReceiverPhone(String receiverPhone) { this.receiverPhone = receiverPhone; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
