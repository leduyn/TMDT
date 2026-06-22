package com.anhtin.tmdt.backend.modules.product.dto;

public class CategoryImportRowResult {
    private int rowIndex;
    private boolean success;
    private String message;
    private Long categoryId;
    private String categoryName;

    public CategoryImportRowResult() {}

    public CategoryImportRowResult(int rowIndex, boolean success, String message, Long categoryId, String categoryName) {
        this.rowIndex = rowIndex;
        this.success = success;
        this.message = message;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
    }

    public int getRowIndex() { return rowIndex; }
    public void setRowIndex(int rowIndex) { this.rowIndex = rowIndex; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
}
