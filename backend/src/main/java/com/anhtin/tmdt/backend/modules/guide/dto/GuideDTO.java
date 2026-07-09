package com.anhtin.tmdt.backend.modules.guide.dto;

import com.anhtin.tmdt.backend.modules.guide.entity.Guide;

import java.time.LocalDateTime;
import java.util.List;

public class GuideDTO {

    private Long id;
    private String name;
    private String description;
    private Integer version;
    private Boolean isActive;
    private String conditions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<GuideStepDTO> steps;

    public GuideDTO() {}

    public GuideDTO(Guide guide) {
        this.id = guide.getId();
        this.name = guide.getName();
        this.description = guide.getDescription();
        this.version = guide.getVersion();
        this.isActive = guide.getIsActive();
        this.conditions = guide.getConditions();
        this.createdAt = guide.getCreatedAt();
        this.updatedAt = guide.getUpdatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<GuideStepDTO> getSteps() { return steps; }
    public void setSteps(List<GuideStepDTO> steps) { this.steps = steps; }
}
