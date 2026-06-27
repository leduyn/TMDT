package com.anhtin.tmdt.backend.modules.product.dto;

import java.util.Map;

public class BrandImportRequest {
    private Map<String, String> columnMappings;
    private boolean hasHeaderRow = true;
    private int sheetIndex = 0;

    public Map<String, String> getColumnMappings() { return columnMappings; }
    public void setColumnMappings(Map<String, String> columnMappings) { this.columnMappings = columnMappings; }
    public boolean isHasHeaderRow() { return hasHeaderRow; }
    public void setHasHeaderRow(boolean hasHeaderRow) { this.hasHeaderRow = hasHeaderRow; }
    public int getSheetIndex() { return sheetIndex; }
    public void setSheetIndex(int sheetIndex) { this.sheetIndex = sheetIndex; }
}
