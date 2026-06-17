package com.anhtin.tmdt.backend.modules.product.dto;

import jakarta.validation.constraints.NotBlank;

public class BrandRequest {
    @NotBlank
    private String code;

    @NotBlank
    private String name;

    private String logoUrl;
    private Long bravoId;
    private Integer isHighlight;
    private Integer highlightPriority;
    private Integer status;
    private String createdDate;
    private String bravoSortValue;

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public Long getBravoId() { return bravoId; }
    public void setBravoId(Long bravoId) { this.bravoId = bravoId; }
    public Integer getIsHighlight() { return isHighlight; }
    public void setIsHighlight(Integer isHighlight) { this.isHighlight = isHighlight; }
    public Integer getHighlightPriority() { return highlightPriority; }
    public void setHighlightPriority(Integer highlightPriority) { this.highlightPriority = highlightPriority; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public String getCreatedDate() { return createdDate; }
    public void setCreatedDate(String createdDate) { this.createdDate = createdDate; }
    public String getBravoSortValue() { return bravoSortValue; }
    public void setBravoSortValue(String bravoSortValue) { this.bravoSortValue = bravoSortValue; }
}
