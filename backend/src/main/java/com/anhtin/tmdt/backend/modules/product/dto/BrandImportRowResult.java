package com.anhtin.tmdt.backend.modules.product.dto;

public class BrandImportRowResult {
    private int rowIndex;
    private boolean success;
    private String message;
    private Long brandId;
    private String brandName;

    public BrandImportRowResult() {}

    public BrandImportRowResult(int rowIndex, boolean success, String message, Long brandId, String brandName) {
        this.rowIndex = rowIndex;
        this.success = success;
        this.message = message;
        this.brandId = brandId;
        this.brandName = brandName;
    }

    public int getRowIndex() { return rowIndex; }
    public void setRowIndex(int rowIndex) { this.rowIndex = rowIndex; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getBrandId() { return brandId; }
    public void setBrandId(Long brandId) { this.brandId = brandId; }
    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
}
