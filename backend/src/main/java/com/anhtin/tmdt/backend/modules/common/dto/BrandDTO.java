package com.anhtin.tmdt.backend.modules.common.dto;

import java.time.LocalDateTime;

public class BrandDTO {
    public BrandDTO() {}

    public BrandDTO(Long id, String code, String name, String logoUrl,
                    Long bravoId, Integer isHighlight, Integer highlightPriority,
                    Integer status, LocalDateTime createdDate, String bravoSortValue,
                    LocalDateTime updatedDate) {
        this.id = id;
        this.code = code;
        this.name = name;
        this.logoUrl = logoUrl;
        this.bravoId = bravoId;
        this.isHighlight = isHighlight;
        this.highlightPriority = highlightPriority;
        this.status = status;
        this.createdDate = createdDate;
        this.bravoSortValue = bravoSortValue;
        this.updatedDate = updatedDate;
    }

    private Long id;
    private String code;
    private String name;
    private String logoUrl;
    private Long bravoId;
    private Integer isHighlight;
    private Integer highlightPriority;
    private Integer status;
    private LocalDateTime createdDate;
    private String bravoSortValue;
    private LocalDateTime updatedDate;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public String getBravoSortValue() { return bravoSortValue; }
    public void setBravoSortValue(String bravoSortValue) { this.bravoSortValue = bravoSortValue; }
    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
}
