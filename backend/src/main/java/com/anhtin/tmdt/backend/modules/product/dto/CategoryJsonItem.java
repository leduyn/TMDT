package com.anhtin.tmdt.backend.modules.product.dto;

public class CategoryJsonItem {
    private Long id;
    private String name;
    private String parentName;
    private String imageUrl;
    private String status;
    private Integer priority;
    private String bravoSortValue;
    private Integer isBranch;
    private Integer showOnLeftMenu;
    private Integer displayStatus;
    private String backgroundColor;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getParentName() { return parentName; }
    public void setParentName(String parentName) { this.parentName = parentName; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
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
