package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.Agency;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AgencyDTO {
    private Long id;
    private String name;
    private String phone;
    private String address;
    private String username;
    private Long userId;
    private boolean active;
    private String status;
    private String organizationName;
    private String taxCode;
    private String billingAddress;
    private String email;
    private Double defaultCommissionRate;

    public AgencyDTO(Agency agency) {
        this.id = agency.getId();
        this.name = agency.getName();
        this.phone = agency.getPhone();
        this.address = agency.getAddress();
        this.defaultCommissionRate = agency.getDefaultCommissionRate();
        if (agency.getUser() != null) {
            this.username = agency.getUser().getUsername();
            this.userId = agency.getUser().getId();
            this.email = agency.getUser().getEmail();
            this.organizationName = agency.getUser().getOrganizationName();
            this.taxCode = agency.getUser().getTaxCode();
            this.billingAddress = agency.getUser().getBillingAddress();
        }
        this.active = agency.isActive();
        this.status = agency.getStatus() != null ? agency.getStatus().name() : null;
    }
}
