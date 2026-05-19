package com.anhtin.tmdt.backend.modules.region.dto;

import com.anhtin.tmdt.backend.modules.region.entity.BusinessRegion;
import com.anhtin.tmdt.backend.modules.region.entity.Ward;
import java.util.List;
import java.util.stream.Collectors;

public class BusinessRegionDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private boolean active;
    private List<Long> wardIds;

    public BusinessRegionDTO() {}

    public BusinessRegionDTO(BusinessRegion region) {
        this.id = region.getId();
        this.code = region.getCode();
        this.name = region.getName();
        this.description = region.getDescription();
        this.active = region.isActive();
        if (region.getWards() != null) {
            this.wardIds = region.getWards().stream().map(Ward::getId).collect(Collectors.toList());
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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
}
