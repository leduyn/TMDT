package com.anhtin.tmdt.backend.modules.product.dto;

import java.util.ArrayList;
import java.util.List;

public class ProductImportAttributeConfig {
    private String specColumn;
    private String specDelimiter = " - ";
    private List<String> variantColumns = new ArrayList<>();

    public String getSpecColumn() { return specColumn; }
    public void setSpecColumn(String specColumn) { this.specColumn = specColumn; }
    public String getSpecDelimiter() { return specDelimiter; }
    public void setSpecDelimiter(String specDelimiter) { this.specDelimiter = specDelimiter; }
    public List<String> getVariantColumns() { return variantColumns; }
    public void setVariantColumns(List<String> variantColumns) { this.variantColumns = variantColumns; }
}
