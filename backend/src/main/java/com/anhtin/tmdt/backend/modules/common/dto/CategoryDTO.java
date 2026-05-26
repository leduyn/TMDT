package com.anhtin.tmdt.backend.modules.common.dto;

import lombok.Getter;
import lombok.Setter;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@Getter
@Setter
public class CategoryDTO {
    private Long id;
    private String name;
    private String imageUrl;
    private Long parentId;
    private String parentName;

    public CategoryDTO(Category category) {
        this.id = category.getId();
        this.name = category.getName();
        this.imageUrl = category.getImageUrl();
        if (category.getParent() != null) {
            this.parentId = category.getParent().getId();
            this.parentName = category.getParent().getName();
        }
    }
}
