package com.anhtin.tmdt.backend.modules.guide.dto;

import com.anhtin.tmdt.backend.modules.guide.entity.GuideStep;

import java.time.LocalDateTime;

public class GuideStepDTO {

    private Long id;
    private Long guideId;
    private Long targetId;
    private String title;
    private String description;
    private String placement;
    private Integer stepOrder;
    private String navigateToScreen;
    private String navigateToParams;
    private LocalDateTime createdAt;
    private String targetKey;
    private String targetName;

    public GuideStepDTO() {}

    public GuideStepDTO(GuideStep step) {
        this.id = step.getId();
        this.guideId = step.getGuideId();
        this.targetId = step.getTargetId();
        this.title = step.getTitle();
        this.description = step.getDescription();
        this.placement = step.getPlacement();
        this.stepOrder = step.getStepOrder();
        this.navigateToScreen = step.getNavigateToScreen();
        this.navigateToParams = step.getNavigateToParams();
        this.createdAt = step.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getGuideId() { return guideId; }
    public void setGuideId(Long guideId) { this.guideId = guideId; }
    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getPlacement() { return placement; }
    public void setPlacement(String placement) { this.placement = placement; }
    public Integer getStepOrder() { return stepOrder; }
    public void setStepOrder(Integer stepOrder) { this.stepOrder = stepOrder; }
    public String getNavigateToScreen() { return navigateToScreen; }
    public void setNavigateToScreen(String navigateToScreen) { this.navigateToScreen = navigateToScreen; }
    public String getNavigateToParams() { return navigateToParams; }
    public void setNavigateToParams(String navigateToParams) { this.navigateToParams = navigateToParams; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getTargetKey() { return targetKey; }
    public void setTargetKey(String targetKey) { this.targetKey = targetKey; }
    public String getTargetName() { return targetName; }
    public void setTargetName(String targetName) { this.targetName = targetName; }
}
