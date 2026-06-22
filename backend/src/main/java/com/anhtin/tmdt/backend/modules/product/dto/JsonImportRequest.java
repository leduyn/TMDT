package com.anhtin.tmdt.backend.modules.product.dto;

public class JsonImportRequest {
    private String fileName;
    private String fileContent;
    private ProductImportRequest mapping;

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileContent() { return fileContent; }
    public void setFileContent(String fileContent) { this.fileContent = fileContent; }
    public ProductImportRequest getMapping() { return mapping; }
    public void setMapping(ProductImportRequest mapping) { this.mapping = mapping; }
}
