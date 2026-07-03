package com.anhtin.tmdt.backend.modules.user.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String email;
    private List<String> roles;
    private Long agencyId;
    private String shippingAddress;
    private String phone;
    private String name;
    private String code;
    private String agencyStatus;
    private String agencyType;

    public JwtResponse(String accessToken, Long id, String username, String email, List<String> roles, Long agencyId, String shippingAddress) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
        this.agencyId = agencyId;
        this.shippingAddress = shippingAddress;
    }

    public JwtResponse(String accessToken, Long id, String phone, String name, String code, List<String> roles, Long agencyId, String agencyStatus, String agencyType) {
        this.token = accessToken;
        this.id = id;
        this.username = phone;
        this.phone = phone;
        this.email = "";
        this.name = name;
        this.code = code;
        this.roles = roles;
        this.agencyId = agencyId;
        this.shippingAddress = "";
        this.agencyStatus = agencyStatus;
        this.agencyType = agencyType;
    }
}
