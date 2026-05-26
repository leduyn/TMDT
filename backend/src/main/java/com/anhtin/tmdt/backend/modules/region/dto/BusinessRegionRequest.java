package com.anhtin.tmdt.backend.modules.region.dto;

import java.util.List;

public class BusinessRegionRequest {
    private String code;
    private String name;
    private String description;
    private boolean active;
    private List<Long> wardIds;
    private List<Long> provinceIds;

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public List<Long> getWardIds() { return wardIds; }
    public void setWardIds(List<Long> wardIds) { this.wardIds = wardIds; }

    public List<Long> getProvinceIds() { return provinceIds; }
    public void setProvinceIds(List<Long> provinceIds) { this.provinceIds = provinceIds; }
}
