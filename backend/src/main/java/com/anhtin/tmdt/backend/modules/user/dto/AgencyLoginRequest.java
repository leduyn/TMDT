package com.anhtin.tmdt.backend.modules.user.dto;

import jakarta.validation.constraints.NotBlank;

public class AgencyLoginRequest {
    @NotBlank
    private String phone;

    @NotBlank
    private String password;

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
