package com.anhtin.tmdt.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AgencyWithAccountRequest {
    // Account info
    private String username;
    private String email;
    private String password;
    
    // Agency info
    private String name;
    private String phone;
    private String address;
    private String organizationName;
    private String taxCode;
    private String billingAddress;
    private Double latitude;
    private Double longitude;
    private Double defaultCommissionRate;
}
