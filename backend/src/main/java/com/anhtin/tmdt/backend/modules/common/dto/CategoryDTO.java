package com.anhtin.tmdt.backend.modules.common.dto;

import lombok.Getter;
import lombok.Setter;
import com.anhtin.tmdt.backend.modules.product.entity.Category;

import java.util.Map;

@Getter
@Setter
public class CategoryDTO {
    private Long id;
    private String name;
    private String imageUrl;
    private Long parentId;
    private String parentName;
    private Integer level;
    private String levelName;
    private Long bravoId;
    private Integer status;
    private Integer priority;
    private String bravoSortValue;
    private Integer isBranch;
    private Integer showOnLeftMenu;
    private Integer displayStatus;
    private String backgroundColor;

    public CategoryDTO(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.imageUrl = category.getImageUrl();
        this.level = category.getLevel();
        this.levelName = category.getLevelName();
        this.bravoId = category.getBravoId();
        this.status = category.getStatus();
        this.priority = category.getPriority();
        this.bravoSortValue = category.getBravoSortValue();
        this.isBranch = category.getIsBranch();
        this.showOnLeftMenu = category.getShowOnLeftMenu();
        this.displayStatus = category.getDisplayStatus();
        this.backgroundColor = category.getBackgroundColor();
        if (category.getParent() != null) {
            this.parentId = category.getParent().getId();
            this.parentName = category.getParent().getName();
        }
    }

    public CategoryDTO(Category category, Map<Integer, String> levelNames) {
        this.id = category.getId();
        this.name = category.getName();
        this.imageUrl = category.getImageUrl();
        this.level = category.getLevel();
        this.levelName = levelNames.getOrDefault(category.getLevel(), "Cấp " + category.getLevel());
        this.bravoId = category.getBravoId();
        this.status = category.getStatus();
        this.priority = category.getPriority();
        this.bravoSortValue = category.getBravoSortValue();
        this.isBranch = category.getIsBranch();
        this.showOnLeftMenu = category.getShowOnLeftMenu();
        this.displayStatus = category.getDisplayStatus();
        this.backgroundColor = category.getBackgroundColor();
        if (category.getParent() != null) {
            this.parentId = category.getParent().getId();
            this.parentName = category.getParent().getName();
        }
    }
}

