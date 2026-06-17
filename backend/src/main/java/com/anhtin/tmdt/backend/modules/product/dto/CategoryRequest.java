package com.anhtin.tmdt.backend.modules.product.dto;

import jakarta.validation.constraints.NotBlank;

public class CategoryRequest {
    @NotBlank(message = "Tên danh mục không được để trống")
    private String name;

    private Long parentId;

    private String imageUrl;

    private Long bravoId;
    private Integer status;
    private Integer priority;
    private String bravoSortValue;
    private Integer isBranch;
    private Integer showOnLeftMenu;
    private Integer displayStatus;
    private String backgroundColor;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Long getBravoId() { return bravoId; }
    public void setBravoId(Long bravoId) { this.bravoId = bravoId; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
    public String getBravoSortValue() { return bravoSortValue; }
    public void setBravoSortValue(String bravoSortValue) { this.bravoSortValue = bravoSortValue; }
    public Integer getIsBranch() { return isBranch; }
    public void setIsBranch(Integer isBranch) { this.isBranch = isBranch; }
    public Integer getShowOnLeftMenu() { return showOnLeftMenu; }
    public void setShowOnLeftMenu(Integer showOnLeftMenu) { this.showOnLeftMenu = showOnLeftMenu; }
    public Integer getDisplayStatus() { return displayStatus; }
    public void setDisplayStatus(Integer displayStatus) { this.displayStatus = displayStatus; }
    public String getBackgroundColor() { return backgroundColor; }
    public void setBackgroundColor(String backgroundColor) { this.backgroundColor = backgroundColor; }
}
