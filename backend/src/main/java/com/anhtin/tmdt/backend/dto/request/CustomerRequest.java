package com.anhtin.tmdt.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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
}
