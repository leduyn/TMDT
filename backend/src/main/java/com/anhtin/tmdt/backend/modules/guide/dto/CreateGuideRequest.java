package com.anhtin.tmdt.backend.modules.guide.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateGuideRequest {

    @NotBlank
    private String name;

    private String description;

    private Integer version = 1;

    private Boolean isActive = true;

    private String conditions;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }
}
