package com.anhtin.tmdt.backend.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

public class BrandRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String name;

    private String logoUrl;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}
