package com.anhtin.tmdt.backend.modules.product.dto;

public class ProductImportRowResult {
    private int rowIndex;
    private boolean success;
    private String message;
    private Long productId;
    private String productName;
    private String action;

    public ProductImportRowResult() {}

    public ProductImportRowResult(int rowIndex, boolean success, String message, Long productId, String productName) {
        this.rowIndex = rowIndex;
        this.success = success;
        this.message = message;
        this.productId = productId;
        this.productName = productName;
    }

    public ProductImportRowResult(int rowIndex, boolean success, String message, Long productId, String productName, String action) {
        this.rowIndex = rowIndex;
        this.success = success;
        this.message = message;
        this.productId = productId;
        this.productName = productName;
        this.action = action;
    }

    public int getRowIndex() { return rowIndex; }
    public void setRowIndex(int rowIndex) { this.rowIndex = rowIndex; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
}
