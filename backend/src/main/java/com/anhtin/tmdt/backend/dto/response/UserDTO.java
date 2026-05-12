package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.Role;
import com.anhtin.tmdt.backend.entity.User;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private Long customerGroupId;
    private String customerGroupName;
    private java.util.List<Long> agencyIds;
    private java.util.List<String> agencyNames;
    private boolean active;
    private String organizationName;
    private String shippingAddress;
    private String billingAddress;
    private String taxCode;
    private String phone;
    private boolean approved; 
    private String displayName; 
    private String customName;
    private String customShippingAddress;
    private String customPhone;
    private Double totalDebt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Long getCustomerGroupId() { return customerGroupId; }
    public void setCustomerGroupId(Long customerGroupId) { this.customerGroupId = customerGroupId; }
    public String getCustomerGroupName() { return customerGroupName; }
    public void setCustomerGroupName(String customerGroupName) { this.customerGroupName = customerGroupName; }
    public java.util.List<Long> getAgencyIds() { return agencyIds; }
    public void setAgencyIds(java.util.List<Long> agencyIds) { this.agencyIds = agencyIds; }
    public java.util.List<String> getAgencyNames() { return agencyNames; }
    public void setAgencyNames(java.util.List<String> agencyNames) { this.agencyNames = agencyNames; }
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
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getCustomName() { return customName; }
    public void setCustomName(String customName) { this.customName = customName; }
    public String getCustomShippingAddress() { return customShippingAddress; }
    public void setCustomShippingAddress(String customShippingAddress) { this.customShippingAddress = customShippingAddress; }
    public String getCustomPhone() { return customPhone; }
    public void setCustomPhone(String customPhone) { this.customPhone = customPhone; }
    public Double getTotalDebt() { return totalDebt; }
    public void setTotalDebt(Double totalDebt) { this.totalDebt = totalDebt; }

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.active = user.isActive();
        this.organizationName = user.getOrganizationName();
        this.shippingAddress = user.getShippingAddress();
        this.billingAddress = user.getBillingAddress();
        this.taxCode = user.getTaxCode();
        this.phone = user.getPhone();
        
        if (user.getCustomerGroup() != null) {
            this.customerGroupId = user.getCustomerGroup().getId();
            this.customerGroupName = user.getCustomerGroup().getName();
        }
        
        if (user.getAssignments() != null && !user.getAssignments().isEmpty()) {
            this.agencyIds = user.getAssignments().stream().map(a -> a.getAgency().getId()).collect(java.util.stream.Collectors.toList());
            this.agencyNames = user.getAssignments().stream().map(a -> a.getAgency().getName()).collect(java.util.stream.Collectors.toList());
            
            // Lấy thông tin từ assignment đầu tiên làm mặc định cho các trường custom
            com.anhtin.tmdt.backend.entity.AgencyCustomerAssignment first = user.getAssignments().get(0);
            this.approved = first.isApproved();
            this.displayName = first.getCustomName();
            this.customName = first.getCustomName();
            this.customShippingAddress = first.getCustomShippingAddress();
            this.customPhone = first.getCustomPhone();
            
            // Tổng nợ = tổng các assignment
            this.totalDebt = user.getAssignments().stream()
                    .mapToDouble(com.anhtin.tmdt.backend.entity.AgencyCustomerAssignment::getTotalDebt)
                    .sum();
        } else {
            this.agencyIds = new java.util.ArrayList<>();
            this.agencyNames = new java.util.ArrayList<>();
        }
    }
}
