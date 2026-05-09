package com.anhtin.tmdt.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class CustomerRequest {
    @NotBlank
    private String username;

    @NotBlank
    @Email
    private String email;

    private String password;

    private Long customerGroupId;

    private java.util.List<Long> agencyIds;

    private boolean active = true;

    private String organizationName;
    private String shippingAddress;
    private String billingAddress;
    private String taxCode;
    private String phone;
    private String customName;
    private String customShippingAddress;
    private String customPhone;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Long getCustomerGroupId() { return customerGroupId; }
    public void setCustomerGroupId(Long customerGroupId) { this.customerGroupId = customerGroupId; }
    public java.util.List<Long> getAgencyIds() { return agencyIds; }
    public void setAgencyIds(java.util.List<Long> agencyIds) { this.agencyIds = agencyIds; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCustomName() { return customName; }
    public void setCustomName(String customName) { this.customName = customName; }
    public String getCustomShippingAddress() { return customShippingAddress; }
    public void setCustomShippingAddress(String customShippingAddress) { this.customShippingAddress = customShippingAddress; }
    public String getCustomPhone() { return customPhone; }
    public void setCustomPhone(String customPhone) { this.customPhone = customPhone; }
}
