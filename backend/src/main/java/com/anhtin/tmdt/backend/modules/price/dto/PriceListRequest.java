package com.anhtin.tmdt.backend.modules.price.dto;

import lombok.NoArgsConstructor;

@NoArgsConstructor
public class PriceListRequest {
    private String name;
    private String description;
    private Boolean isDefault;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
}
