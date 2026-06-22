package com.anhtin.tmdt.backend.modules.product.dto;

import java.util.List;

public class CategoryJsonImportRequest {
    private List<CategoryJsonItem> categories;

    public List<CategoryJsonItem> getCategories() { return categories; }
    public void setCategories(List<CategoryJsonItem> categories) { this.categories = categories; }
}
