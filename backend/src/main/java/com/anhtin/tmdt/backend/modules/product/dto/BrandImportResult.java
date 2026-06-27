package com.anhtin.tmdt.backend.modules.product.dto;

import java.util.List;

public class BrandImportResult {
    private int totalRows;
    private int successCount;
    private int errorCount;
    private List<BrandImportRowResult> rowResults;

    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }
    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }
    public int getErrorCount() { return errorCount; }
    public void setErrorCount(int errorCount) { this.errorCount = errorCount; }
    public List<BrandImportRowResult> getRowResults() { return rowResults; }
    public void setRowResults(List<BrandImportRowResult> rowResults) { this.rowResults = rowResults; }
}
