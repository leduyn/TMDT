package com.anhtin.tmdt.backend.modules.guide.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateGuideStepRequest {

    @NotNull
    private Long targetId;

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String placement;

    @NotNull
    private Integer stepOrder;

    private String navigateToScreen;

    private String navigateToParams;

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
}
