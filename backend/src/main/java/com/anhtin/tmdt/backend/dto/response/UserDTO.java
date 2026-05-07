package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.Role;
import com.anhtin.tmdt.backend.entity.User;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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
    private boolean approved; // Status duyệt cho quan hệ Agency-Customer
    private String customName;
    private String customShippingAddress;

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
            
            // Lấy thông tin từ assignment đầu tiên làm mặc định
            com.anhtin.tmdt.backend.entity.AgencyCustomerAssignment first = user.getAssignments().get(0);
            this.approved = first.isApproved();
            this.customName = first.getCustomName();
            this.customShippingAddress = first.getCustomShippingAddress();
        } else {
            this.agencyIds = new java.util.ArrayList<>();
            this.agencyNames = new java.util.ArrayList<>();
        }
    }
}
