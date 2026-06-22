package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.ProductImportRequest;
import com.anhtin.tmdt.backend.modules.product.dto.ProductImportResult;
import com.anhtin.tmdt.backend.modules.product.dto.ProductImportRowResult;
import com.anhtin.tmdt.backend.modules.product.dto.ProductRequest;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.entity.ProductType;
import com.anhtin.tmdt.backend.modules.product.repository.BrandRepository;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductTypeRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductImportService {

    @Autowired
    private ProductService productService;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BrandRepository brandRepository;

    @Autowired
    private ProductTypeRepository productTypeRepository;

    @Autowired
    private ProductRepository productRepository;

    public ByteArrayInputStream exportTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Import Template");

            String[] headers = {
                "Mã sản phẩm*", "Tên sản phẩm*", "Giá cơ bản*", "Số lượng kho*", "Mô tả",
                "Đơn vị tính", "Quy cách trong", "Quy cách ngoài",
                "SL mua tối thiểu", "Bước nhảy SL", "Tags",
                "Thứ tự", "Giá Dropship", "Dropship (true/false)",
                "Hiển thị App (true/false)", "Hiển thị Web (true/false)",
                "Hiển thị giảm giá (true/false)", "Danh mục", "Mã thương hiệu", "Mã loại SP",
                "Bảo hành bán thường", "Bảo hành bán sỉ", "Trạng thái", "Tên khác", "Tên rút gọn",
                "Quy cách", "Đặc điểm 1", "Đặc điểm 2"
            };

            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(createHeaderStyle(workbook));
            }

            Row dataRow = sheet.createRow(1);
            dataRow.createCell(0).setCellValue("SP001");
            dataRow.createCell(1).setCellValue("Máy khoan cầm tay");
            dataRow.createCell(2).setCellValue(150000);
            dataRow.createCell(3).setCellValue(100);
            dataRow.createCell(4).setCellValue("Máy khoan công suất 800W");
            dataRow.createCell(5).setCellValue("Cái");
            dataRow.createCell(6).setCellValue("10 cái/hộp");
            dataRow.createCell(7).setCellValue("50 hộp/thùng");
            dataRow.createCell(8).setCellValue(1);
            dataRow.createCell(9).setCellValue(1);
            dataRow.createCell(10).setCellValue("Mới, Giảm giá");
            dataRow.createCell(11).setCellValue(1);
            dataRow.createCell(12).setCellValue(130000);
            dataRow.createCell(13).setCellValue("false");
            dataRow.createCell(14).setCellValue("true");
            dataRow.createCell(15).setCellValue("true");
            dataRow.createCell(16).setCellValue("false");
            dataRow.createCell(17).setCellValue("Dụng cụ điện");
            dataRow.createCell(18).setCellValue("MAKITA");
            dataRow.createCell(19).setCellValue("MACHINERY");
            dataRow.createCell(20).setCellValue("12 tháng");
            dataRow.createCell(21).setCellValue("24 tháng");
            dataRow.createCell(22).setCellValue("ACTIVE");
            dataRow.createCell(23).setCellValue("Máy khoan MK");
            dataRow.createCell(24).setCellValue("MK-01");
            dataRow.createCell(25).setCellValue("Cơ bản");
            dataRow.createCell(26).setCellValue("Có dây");
            dataRow.createCell(27).setCellValue("Công suất lớn");

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Error exporting template", e);
        }
    }

    public ProductImportResult importProducts(MultipartFile file, ProductImportRequest request) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        try {
            return importProducts(file.getBytes(), request);
        } catch (IOException e) {
            throw new RuntimeException("Error reading file", e);
        }
    }

    public ProductImportResult importProducts(byte[] fileBytes, ProductImportRequest request) {
        ProductImportResult result = new ProductImportResult();
        List<ProductImportRowResult> rowResults = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(new ByteArrayInputStream(fileBytes))) {
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
                    String productCode = extractProductCode(row, mappings, columnHeaders);
                    if (productCode == null || productCode.isEmpty()) {
                        throw new IllegalArgumentException("Mã sản phẩm không được để trống");
                    }

                    Product existingProduct = productRepository.findByProductCode(productCode);
                    if (existingProduct != null) {
                        updateProductFromRow(existingProduct, row, mappings, columnHeaders);
                        productRepository.save(existingProduct);
                        successCount++;
                        rowResults.add(new ProductImportRowResult(
                            i + 1, true, "Đã cập nhật", existingProduct.getId(), existingProduct.getName(), "UPDATE"
                        ));
                    } else {
                        ProductRequest productRequest = buildProductRequest(row, mappings, columnHeaders);
                        validateRequiredFields(productRequest);
                        var dto = productService.addProduct(productRequest);
                        successCount++;
                        rowResults.add(new ProductImportRowResult(
                            i + 1, true, "Đã tạo mới", dto.getId(), dto.getName(), "CREATE"
                        ));
                    }
                } catch (Exception e) {
                    errorCount++;
                    String errorMsg = e.getMessage() != null ? e.getMessage() : "Lỗi không xác định";
                    if (errorMsg.length() > 200) errorMsg = errorMsg.substring(0, 200);
                    rowResults.add(new ProductImportRowResult(
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

    private String extractProductCode(Row row, Map<String, String> mappings, String[] columnHeaders) {
        for (Map.Entry<String, String> entry : mappings.entrySet()) {
            if ("productCode".equals(entry.getValue())) {
                int colIndex = resolveColumnIndex(entry.getKey(), columnHeaders);
                if (colIndex >= 0) {
                    return getCellValueAsString(row.getCell(colIndex));
                }
            }
        }
        return null;
    }

    private void validateRequiredFields(ProductRequest req) {
        if (req.getProductCode() == null || req.getProductCode().isBlank()) {
            throw new IllegalArgumentException("Mã sản phẩm không được để trống");
        }
        if (req.getName() == null || req.getName().isBlank()) {
            throw new IllegalArgumentException("Tên sản phẩm không được để trống");
        }
        if (req.getCategoryId() == null) {
            throw new IllegalArgumentException("Danh mục không được để trống");
        }
        if (req.getBasePrice() == null) {
            throw new IllegalArgumentException("Giá cơ bản không được để trống");
        }
        if (req.getStockQuantity() == null) {
            throw new IllegalArgumentException("Số lượng kho không được để trống");
        }
    }

    private void updateProductFromRow(Product product, Row row, Map<String, String> mappings, String[] columnHeaders) {
        for (Map.Entry<String, String> entry : mappings.entrySet()) {
            String columnKey = entry.getKey();
            String field = entry.getValue();
            if (field == null || field.isEmpty()) continue;

            int colIndex = resolveColumnIndex(columnKey, columnHeaders);
            if (colIndex < 0) continue;

            String rawValue = getCellValueAsString(row.getCell(colIndex));
            if (rawValue == null || rawValue.isEmpty()) continue;

            setEntityField(product, field, rawValue.trim());
        }
    }

    private ProductRequest buildProductRequest(Row row, Map<String, String> mappings, String[] columnHeaders) {
        ProductRequest req = new ProductRequest();

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

        if (req.getCategoryId() == null) {
            throw new IllegalArgumentException("Thiếu danh mục (categoryName)");
        }

        return req;
    }

    private int resolveColumnIndex(String columnKey, String[] columnHeaders) {
        if (columnHeaders != null) {
            String cleanKey = columnKey.replace("*", "").trim();
            for (int i = 0; i < columnHeaders.length; i++) {
                if (columnHeaders[i] != null && columnHeaders[i].replace("*", "").trim().equalsIgnoreCase(cleanKey)) {
                    return i;
                }
            }
            for (int i = 0; i < columnHeaders.length; i++) {
                if (columnHeaders[i] != null && columnHeaders[i].replace("*", "").trim().toLowerCase()
                        .contains(cleanKey.toLowerCase())) {
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

    private void setEntityField(Product product, String field, String value) {
        try {
            switch (field) {
                case "name":
                    product.setName(value);
                    break;
                case "description":
                    product.setDescription(value);
                    break;
                case "basePrice":
                    product.setBasePrice(parseDouble(value));
                    break;
                case "dropshipPrice":
                    product.setDropshipPrice(parseDouble(value));
                    break;
                case "stockQuantity":
                    product.setStockQuantity(parseInt(value));
                    break;
                case "unit":
                    product.setUnit(value);
                    break;
                case "innerPackaging":
                    product.setInnerPackaging(value);
                    break;
                case "outerPackaging":
                    product.setOuterPackaging(value);
                    break;
                case "minPurchaseQuantity":
                    product.setMinPurchaseQuantity(parseInt(value));
                    break;
                case "quantityStep":
                    product.setQuantityStep(parseInt(value));
                    break;
                case "tags":
                    product.setTags(value);
                    break;
                case "bravoOrder":
                    product.setBravoOrder(parseInt(value));
                    break;
                case "isDropship":
                    product.setDropship(parseBoolean(value));
                    break;
                case "isAppVisible":
                    product.setIsAppVisible(parseBoolean(value));
                    break;
                case "isWebVisible":
                    product.setIsWebVisible(parseBoolean(value));
                    break;
                case "showDiscount":
                    product.setShowDiscount(parseBoolean(value));
                    break;
                case "productCode":
                    product.setProductCode(value);
                    break;
                case "retailWarrantyPeriod":
                    product.setRetailWarrantyPeriod(value);
                    break;
                case "wholesaleWarrantyPeriod":
                    product.setWholesaleWarrantyPeriod(value);
                    break;
                case "status":
                    product.setStatus(value);
                    break;
                case "otherName":
                    product.setOtherName(value);
                    break;
                case "shortName":
                    product.setShortName(value);
                    break;
                case "specification":
                    product.setSpecification(value);
                    break;
                case "feature1":
                    product.setFeature1(value);
                    break;
                case "feature2":
                    product.setFeature2(value);
                    break;
                case "categoryName":
                    lookupAndSetCategoryOnEntity(product, value);
                    break;
                case "brandName":
                    lookupAndSetBrandOnEntity(product, value);
                    break;
                case "productTypeName":
                    lookupAndSetProductTypeOnEntity(product, value);
                    break;
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Giá trị '" + value + "' không hợp lệ cho trường " + field, e);
        }
    }

    private void setField(ProductRequest req, String field, String value) {
        try {
            switch (field) {
                case "name":
                    req.setName(value);
                    break;
                case "description":
                    req.setDescription(value);
                    break;
                case "basePrice":
                    req.setBasePrice(parseDouble(value));
                    break;
                case "dropshipPrice":
                    req.setDropshipPrice(parseDouble(value));
                    break;
                case "stockQuantity":
                    req.setStockQuantity(parseInt(value));
                    break;
                case "unit":
                    req.setUnit(value);
                    break;
                case "innerPackaging":
                    req.setInnerPackaging(value);
                    break;
                case "outerPackaging":
                    req.setOuterPackaging(value);
                    break;
                case "minPurchaseQuantity":
                    req.setMinPurchaseQuantity(parseInt(value));
                    break;
                case "quantityStep":
                    req.setQuantityStep(parseInt(value));
                    break;
                case "tags":
                    req.setTags(value);
                    break;
                case "bravoOrder":
                    req.setBravoOrder(parseInt(value));
                    break;
                case "isDropship":
                    req.setDropship(parseBoolean(value));
                    break;
                case "isAppVisible":
                    req.setIsAppVisible(parseBoolean(value));
                    break;
                case "isWebVisible":
                    req.setIsWebVisible(parseBoolean(value));
                    break;
                case "showDiscount":
                    req.setShowDiscount(parseBoolean(value));
                    break;
                case "categoryName":
                    lookupAndSetCategory(req, value);
                    break;
                case "brandName":
                    lookupAndSetBrandByName(req, value);
                    break;
                case "productTypeName":
                    lookupAndSetProductTypeByName(req, value);
                    break;
                case "productCode":
                    req.setProductCode(value);
                    break;
                case "retailWarrantyPeriod":
                    req.setRetailWarrantyPeriod(value);
                    break;
                case "wholesaleWarrantyPeriod":
                    req.setWholesaleWarrantyPeriod(value);
                    break;
                case "status":
                    req.setStatus(value);
                    break;
                case "otherName":
                    req.setOtherName(value);
                    break;
                case "shortName":
                    req.setShortName(value);
                    break;
                case "specification":
                    req.setSpecification(value);
                    break;
                case "feature1":
                    req.setFeature1(value);
                    break;
                case "feature2":
                    req.setFeature2(value);
                    break;
            }
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException("Giá trị '" + value + "' không hợp lệ cho trường " + field, e);
        }
    }

    private void lookupAndSetCategory(ProductRequest req, String name) {
        Optional<Category> cat = categoryRepository.findByName(name);
        if (cat.isPresent()) {
            if (cat.get().getLevel() == null || cat.get().getLevel() != 4) {
                throw new IllegalArgumentException("Danh mục '" + name + "' không phải cấp 4 (Dòng sản phẩm)");
            }
            req.setCategoryId(cat.get().getId());
        } else {
            throw new IllegalArgumentException("Không tìm thấy danh mục '" + name + "'. Vui lòng nhập đúng tên danh mục cấp 4 (Dòng sản phẩm)");
        }
    }

    private void lookupAndSetBrandByName(ProductRequest req, String name) {
        Optional<Brand> brand = brandRepository.findByName(name);
        if (brand.isPresent()) {
            req.setBrandId(brand.get().getId());
        } else {
            brand = brandRepository.findByCode(name);
            if (brand.isPresent()) {
                req.setBrandId(brand.get().getId());
            } else {
                Brand newBrand = new Brand();
                newBrand.setName(name);
                newBrand.setCode(name);
                Brand saved = brandRepository.save(newBrand);
                req.setBrandId(saved.getId());
            }
        }
    }

    private void lookupAndSetProductTypeByName(ProductRequest req, String name) {
        Optional<ProductType> pt = productTypeRepository.findByName(name);
        if (pt.isPresent()) {
            req.setProductTypeId(pt.get().getId());
        } else {
            pt = productTypeRepository.findByCode(name);
            if (pt.isPresent()) {
                req.setProductTypeId(pt.get().getId());
            } else {
                ProductType newPt = new ProductType();
                newPt.setName(name);
                newPt.setCode(name);
                ProductType saved = productTypeRepository.save(newPt);
                req.setProductTypeId(saved.getId());
            }
        }
    }

    private void lookupAndSetCategoryOnEntity(Product product, String name) {
        Optional<Category> cat = categoryRepository.findByName(name);
        if (cat.isPresent()) {
            if (cat.get().getLevel() == null || cat.get().getLevel() != 4) {
                throw new IllegalArgumentException("Danh mục '" + name + "' không phải cấp 4 (Dòng sản phẩm)");
            }
            product.setCategory(cat.get());
        } else {
            throw new IllegalArgumentException("Không tìm thấy danh mục '" + name + "'. Vui lòng nhập đúng tên danh mục cấp 4 (Dòng sản phẩm)");
        }
    }

    private void lookupAndSetBrandOnEntity(Product product, String name) {
        Optional<Brand> brand = brandRepository.findByName(name);
        if (brand.isPresent()) {
            product.setBrand(brand.get());
        } else {
            brand = brandRepository.findByCode(name);
            if (brand.isPresent()) {
                product.setBrand(brand.get());
            } else {
                Brand newBrand = new Brand();
                newBrand.setName(name);
                newBrand.setCode(name);
                Brand saved = brandRepository.save(newBrand);
                product.setBrand(saved);
            }
        }
    }

    private void lookupAndSetProductTypeOnEntity(Product product, String name) {
        Optional<ProductType> pt = productTypeRepository.findByName(name);
        if (pt.isPresent()) {
            product.setProductType(pt.get());
        } else {
            pt = productTypeRepository.findByCode(name);
            if (pt.isPresent()) {
                product.setProductType(pt.get());
            } else {
                ProductType newPt = new ProductType();
                newPt.setName(name);
                newPt.setCode(name);
                ProductType saved = productTypeRepository.save(newPt);
                product.setProductType(saved);
            }
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

    private double parseDouble(String value) {
        return Double.parseDouble(value.replace(",", "").replace(" ", ""));
    }

    private int parseInt(String value) {
        return Integer.parseInt(value.replace(",", "").replace(" ", ""));
    }

    private boolean parseBoolean(String value) {
        return "true".equalsIgnoreCase(value) || "yes".equalsIgnoreCase(value)
            || "1".equals(value) || "có".equalsIgnoreCase(value);
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
