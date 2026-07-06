package com.anhtin.tmdt.backend.modules.agency.dto;

import com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment;
import com.anhtin.tmdt.backend.modules.customer.entity.Customer;

public class AgencyCustomerDTO {
    private Long id;
    private Long userId;
    private String username;
    private String displayName;
    private String organizationName;
    private String taxCode;
    private String phone;
    private String shippingAddress;
    private String billingAddress;
    private String customName;
    private String customShippingAddress;
    private String customPhone;
    private boolean approved;
    private Double totalDebt;
    private Long agencyId;

    public AgencyCustomerDTO() {}

    public AgencyCustomerDTO(AgencyCustomerAssignment assignment, Customer customer) {
        this.id = customer.getId();
        this.userId = customer.getUserId();
        this.organizationName = customer.getOrganizationName();
        this.taxCode = customer.getTaxCode();
        this.billingAddress = customer.getBillingAddress();
        this.agencyId = customer.getAgencyId();

        if (assignment != null) {
            this.customName = assignment.getCustomName();
            this.customShippingAddress = assignment.getCustomShippingAddress();
            this.customPhone = assignment.getCustomPhone();
            this.approved = assignment.isApproved();
            this.totalDebt = assignment.getTotalDebt();
        }

        this.displayName = assignment != null && assignment.getCustomName() != null
            ? assignment.getCustomName()
            : (customer.getOrganizationName() != null ? customer.getOrganizationName() : customer.getReceiverName());
        this.username = this.displayName;
        this.phone = assignment != null && assignment.getCustomPhone() != null
            ? assignment.getCustomPhone()
            : customer.getReceiverPhone();
        this.shippingAddress = assignment != null && assignment.getCustomShippingAddress() != null
            ? assignment.getCustomShippingAddress()
            : customer.getShippingAddress();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }
    public String getTaxCode() { return taxCode; }
    public void setTaxCode(String taxCode) { this.taxCode = taxCode; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getBillingAddress() { return billingAddress; }
    public void setBillingAddress(String billingAddress) { this.billingAddress = billingAddress; }
    public String getCustomName() { return customName; }
    public void setCustomName(String customName) { this.customName = customName; }
    public String getCustomShippingAddress() { return customShippingAddress; }
    public void setCustomShippingAddress(String customShippingAddress) { this.customShippingAddress = customShippingAddress; }
    public String getCustomPhone() { return customPhone; }
    public void setCustomPhone(String customPhone) { this.customPhone = customPhone; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public Double getTotalDebt() { return totalDebt; }
    public void setTotalDebt(Double totalDebt) { this.totalDebt = totalDebt; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
}
