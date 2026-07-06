package com.anhtin.tmdt.backend.modules.user.dto;

import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import java.util.List;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private Role role;
    private boolean active;
    private String organizationName;
    private String taxCode;
    private String phone;
    private String shippingAddress;
    private String billingAddress;
    private Long customerGroupId;
    private String customerGroupName;
    private Long agencyId;
    private List<Long> agencyIds;
    private List<String> agencyNames;
    private String avatarUrl;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
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
    public Long getCustomerGroupId() { return customerGroupId; }
    public void setCustomerGroupId(Long customerGroupId) { this.customerGroupId = customerGroupId; }
    public String getCustomerGroupName() { return customerGroupName; }
    public void setCustomerGroupName(String customerGroupName) { this.customerGroupName = customerGroupName; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public List<Long> getAgencyIds() { return agencyIds; }
    public void setAgencyIds(List<Long> agencyIds) { this.agencyIds = agencyIds; }
    public List<String> getAgencyNames() { return agencyNames; }
    public void setAgencyNames(List<String> agencyNames) { this.agencyNames = agencyNames; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public UserDTO() {}

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.role = user.getRole();
        this.active = user.isActive();
        this.organizationName = user.getOrganizationName();
        this.taxCode = user.getTaxCode();
        this.phone = user.getPhone();
        this.avatarUrl = user.getAvatarUrl();
        this.shippingAddress = user.getShippingAddress();
        this.billingAddress = user.getBillingAddress();
        if (user.getCustomerGroup() != null) {
            this.customerGroupId = user.getCustomerGroup().getId();
            this.customerGroupName = user.getCustomerGroup().getName();
        }
    }
}
