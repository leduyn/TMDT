package com.anhtin.tmdt.backend.modules.common.dto;


public class BrandDTO {
    public BrandDTO() {}

    public BrandDTO(Long id, String code, String name, String logoUrl) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.logoUrl = logoUrl;
    }

    private Long id;
    private String code;
    private String name;
    private String logoUrl;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}
