package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.CategoryImportRequest;
import com.anhtin.tmdt.backend.modules.product.dto.CategoryImportResult;
import com.anhtin.tmdt.backend.modules.product.dto.CategoryImportRowResult;
import com.anhtin.tmdt.backend.modules.product.dto.CategoryJsonImportRequest;
import com.anhtin.tmdt.backend.modules.product.dto.CategoryJsonItem;
import com.anhtin.tmdt.backend.modules.product.dto.CategoryRequest;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class CategoryImportService {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private CategoryRepository categoryRepository;

    public ByteArrayInputStream exportTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Import Template");

            String[] headers = {
                "ID", "Tên danh mục*", "Danh mục cha (ID)", "Image URL", "Bravo ID",
                "Trạng thái", "Thứ tự ưu tiên", "Bravo Sort Value",
                "Is Branch (0/1)", "Hiển thị menu trái (0/1)",
                "Trạng thái hiển thị", "Màu nền"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue(1001);
            dataRow.createCell(1).setCellValue("Danh mục mới");
            dataRow.createCell(2).setCellValue(1);
            dataRow.createCell(3).setCellValue("https://example.com/image.png");
            dataRow.createCell(4).setCellValue(1001);
            dataRow.createCell(5).setCellValue(1);
            dataRow.createCell(6).setCellValue(1);
            dataRow.createCell(7).setCellValue("A001");
            dataRow.createCell(8).setCellValue(1);
            dataRow.createCell(9).setCellValue(1);
            dataRow.createCell(10).setCellValue(1);
            dataRow.createCell(11).setCellValue("#FF5733");

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Error exporting template", e);
        }
    }

    public CategoryImportResult importCategories(MultipartFile file, CategoryImportRequest request) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        CategoryImportResult result = new CategoryImportResult();
        List<CategoryImportRowResult> rowResults = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(request.getSheetIndex());
            Map<String, String> mappings = request.getColumnMappings();

            int startRow = request.isHasHeaderRow() ? 1 : 0;
            String[] columnHeaders = null;

            if (request.isHasHeaderRow()) {
                Row headerRow = sheet.getRow(0);
                if (headerRow != null) {
                    columnHeaders = new String[headerRow.getLastCellNum()];
                    for (int c = 0; c < headerRow.getLastCellNum(); c++) {
                        columnHeaders[c] = getCellValueAsString(headerRow.getCell(c));
                    }
                }
            }

            int totalRows = 0;
            int successCount = 0;
            int errorCount = 0;

            for (int i = startRow; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                totalRows++;

                try {
                    CategoryRequest categoryRequest = buildCategoryRequest(row, mappings, columnHeaders);
                    var dto = categoryService.createCategory(categoryRequest);
                    successCount++;
                    rowResults.add(new CategoryImportRowResult(
                        i + 1, true, "OK", dto.getId(), dto.getName()
                    ));
                } catch (Exception e) {
                    errorCount++;
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "Lỗi không xác định";
                    if (errorMsg.length() > 200) errorMsg = errorMsg.substring(0, 200);
                    rowResults.add(new CategoryImportRowResult(
                        i + 1, false, errorMsg, null, null
                    ));
                }
            }

            result.setTotalRows(totalRows);
            result.setSuccessCount(successCount);
            result.setErrorCount(errorCount);
            result.setRowResults(rowResults);

        } catch (Exception e) {
            throw new RuntimeException("Error importing file: " + e.getMessage(), e);
        }

        return result;
    }

    @Transactional
    public CategoryImportResult importCategoriesFromJson(CategoryJsonImportRequest request) {
        CategoryImportResult result = new CategoryImportResult();
        List<CategoryImportRowResult> rowResults = new ArrayList<>();
        int totalRows = 0, successCount = 0, errorCount = 0;

        List<CategoryJsonItem> items = request.getCategories();
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Danh sách danh mục rỗng");
        }

        for (int i = 0; i < items.size(); i++) {
            totalRows++;
            try {
                CategoryJsonItem item = items.get(i);
                if (item.getName() == null || item.getName().isBlank()) {
                    throw new IllegalArgumentException("Thiếu tên danh mục (name)");
                }

                CategoryRequest req = new CategoryRequest();
                req.setId(item.getId());
                req.setName(item.getName().trim());
                req.setImageUrl(item.getImageUrl());
                req.setPriority(item.getPriority());
                req.setBravoSortValue(item.getBravoSortValue());
                req.setIsBranch(item.getIsBranch());
                req.setShowOnLeftMenu(item.getShowOnLeftMenu());
                req.setDisplayStatus(item.getDisplayStatus());
                req.setBackgroundColor(item.getBackgroundColor());

                if (item.getStatus() != null && !item.getStatus().isBlank()) {
                    try {
                        req.setStatus(Integer.parseInt(item.getStatus().trim()));
                    } catch (NumberFormatException e) {
                        req.setStatus(item.getStatus().trim().equalsIgnoreCase("ACTIVE") ? 1 : 0);
                    }
                }

                if (item.getParentName() != null && !item.getParentName().isBlank()) {
                    lookupAndSetParent(req, item.getParentName().trim());
                }

                var dto = categoryService.createCategory(req);
                successCount++;
                rowResults.add(new CategoryImportRowResult(
                    i + 1, true, "OK", dto.getId(), dto.getName()
                ));
            } catch (Exception e) {
                errorCount++;
                String errorMsg = e.getMessage() != null ? e.getMessage() : "Lỗi không xác định";
                if (errorMsg.length() > 200) errorMsg = errorMsg.substring(0, 200);
                rowResults.add(new CategoryImportRowResult(
                    i + 1, false, errorMsg, null, null
                ));
            }
        }

        result.setTotalRows(totalRows);
        result.setSuccessCount(successCount);
        result.setErrorCount(errorCount);
        result.setRowResults(rowResults);
        return result;
    }

    private CategoryRequest buildCategoryRequest(Row row, Map<String, String> mappings, String[] columnHeaders) {
        CategoryRequest req = new CategoryRequest();

        for (Map.Entry<String, String> entry : mappings.entrySet()) {
            String columnKey = entry.getKey();
            String field = entry.getValue();
            if (field == null || field.isEmpty()) continue;

            int colIndex = resolveColumnIndex(columnKey, columnHeaders);
            if (colIndex < 0) continue;

            String rawValue = getCellValueAsString(row.getCell(colIndex));
            if (rawValue == null || rawValue.isEmpty()) continue;

            setField(req, field, rawValue.trim());
        }

        if (req.getName() == null || req.getName().isBlank()) {
            throw new IllegalArgumentException("Thiếu tên danh mục (name)");
        }

        return req;
    }

    private int resolveColumnIndex(String columnKey, String[] columnHeaders) {
        if (columnHeaders != null) {
            for (int i = 0; i < columnHeaders.length; i++) {
                if (columnHeaders[i] != null && columnHeaders[i].replace("*", "").trim().equalsIgnoreCase(columnKey)) {
                    return i;
                }
            }
            for (int i = 0; i < columnHeaders.length; i++) {
                if (columnHeaders[i] != null && columnHeaders[i].replace("*", "").trim().toLowerCase()
                        .contains(columnKey.toLowerCase())) {
                    return i;
                }
            }
        }
        if (columnKey.startsWith("col_")) {
            try {
                return Integer.parseInt(columnKey.substring(4));
            } catch (NumberFormatException e) {
                return -1;
            }
        }
        return -1;
    }

    private void setField(CategoryRequest req, String field, String value) {
        try {
            switch (field) {
                case "id":
                    req.setId(parseLong(value));
                    break;
                case "name":
                    req.setName(value);
                    break;
                case "parentId":
                    req.setParentId(parseLong(value));
                    break;
                case "parentName":
                    lookupAndSetParent(req, value);
                    break;
                case "imageUrl":
                    req.setImageUrl(value);
                    break;
                case "bravoId":
                    req.setBravoId(parseLong(value));
                    break;
                case "status":
                    req.setStatus(parseInt(value));
                    break;
                case "priority":
                    req.setPriority(parseInt(value));
                    break;
                case "bravoSortValue":
                    req.setBravoSortValue(value);
                    break;
                case "isBranch":
                    req.setIsBranch(parseInt(value));
                    break;
                case "showOnLeftMenu":
                    req.setShowOnLeftMenu(parseInt(value));
                    break;
                case "displayStatus":
                    req.setDisplayStatus(parseInt(value));
                    break;
                case "backgroundColor":
                    req.setBackgroundColor(value);
                    break;
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Giá trị '" + value + "' không hợp lệ cho trường " + field, e);
        }
    }

    private void lookupAndSetParent(CategoryRequest req, String parentName) {
        Optional<Category> parent = categoryRepository.findFirstByName(parentName);
        if (parent.isPresent()) {
            req.setParentId(parent.get().getId());
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val) && !Double.isInfinite(val)) {
                    yield String.valueOf((long) val);
                }
                yield String.valueOf(val);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield String.valueOf((int) cell.getNumericCellValue());
                } catch (Exception e) {
                    try {
                        yield cell.getStringCellValue();
                    } catch (Exception e2) {
                        yield "";
                    }
                }
            }
            default -> "";
        };
    }

    private long parseLong(String value) {
        return Long.parseLong(value.replace(",", "").replace(" ", ""));
    }

    private int parseInt(String value) {
        return Integer.parseInt(value.replace(",", "").replace(" ", ""));
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }
}
