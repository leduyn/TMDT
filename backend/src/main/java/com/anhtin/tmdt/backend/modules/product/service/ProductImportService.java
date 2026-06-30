package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.ProductImportAttributeConfig;
import com.anhtin.tmdt.backend.modules.product.dto.ProductImportRequest;
import com.anhtin.tmdt.backend.modules.product.dto.ProductImportResult;
import com.anhtin.tmdt.backend.modules.product.dto.ProductImportRowResult;
import com.anhtin.tmdt.backend.modules.product.dto.ProductRequest;
import com.anhtin.tmdt.backend.modules.product.entity.Attribute;
import com.anhtin.tmdt.backend.modules.product.entity.AttributeValue;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.entity.ProductAttributeValue;
import com.anhtin.tmdt.backend.modules.product.entity.ProductType;
import com.anhtin.tmdt.backend.modules.product.repository.AttributeRepository;
import com.anhtin.tmdt.backend.modules.product.repository.AttributeValueRepository;
import com.anhtin.tmdt.backend.modules.product.repository.BrandRepository;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductAttributeValueRepository;
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
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
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

    @Autowired
    private AttributeRepository attributeRepository;

    @Autowired
    private AttributeValueRepository attributeValueRepository;

    @Autowired
    private ProductAttributeValueRepository productAttributeValueRepository;

    public ByteArrayInputStream exportTemplate() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Import Template");

            String[] headers = {
                "Mã sản phẩm*", "Tên sản phẩm*", "Giá cơ bản*", "Số lượng kho*", "Mô tả",
                "Đơn vị tính", "Quy cách trong", "Quy cách ngoài",
                "SL mua tối thiểu", "Bước nhảy SL", "Tags",
                "Thứ tự", "Giá Dropship", "Dropship (true/false)",
                "Hiển thị App (true/false)", "Hiển thị Web (true/false)",
                "Hiển thị giảm giá (true/false)", "Mã danh mục", "Danh mục", "Mã thương hiệu", "Mã loại SP",
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
            dataRow.createCell(17).setCellValue("");  // Mã danh mục (có thể để trống nếu dùng tên danh mục)
            dataRow.createCell(18).setCellValue("Dụng cụ điện");
            dataRow.createCell(19).setCellValue("MAKITA");
            dataRow.createCell(20).setCellValue("MACHINERY");
            dataRow.createCell(21).setCellValue("12 tháng");
            dataRow.createCell(22).setCellValue("24 tháng");
            dataRow.createCell(23).setCellValue("ACTIVE");
            dataRow.createCell(24).setCellValue("Máy khoan MK");
            dataRow.createCell(25).setCellValue("MK-01");
            dataRow.createCell(26).setCellValue("Cơ bản");
            dataRow.createCell(27).setCellValue("Có dây");
            dataRow.createCell(28).setCellValue("Công suất lớn");

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
                        if (request.getAttributeConfig() != null) {
                            importAttributes(existingProduct.getId(), row, columnHeaders, request.getAttributeConfig());
                        }
                        successCount++;
                        rowResults.add(new ProductImportRowResult(
                            i + 1, true, "Đã cập nhật", existingProduct.getId(), existingProduct.getName(), "UPDATE"
                        ));
                    } else {
                        ProductRequest productRequest = buildProductRequest(row, mappings, columnHeaders);
                        validateRequiredFields(productRequest);
                        var dto = productService.addProduct(productRequest);
                        if (request.getAttributeConfig() != null) {
                            importAttributes(dto.getId(), row, columnHeaders, request.getAttributeConfig());
                        }
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
            throw new IllegalArgumentException("Thiếu danh mục (categoryId hoặc categoryName)");
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
                case "categoryId":
                    lookupAndSetCategoryByIdOnEntity(product, value);
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
                case "categoryId":
                    req.setCategoryId(parseLong(value));
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
        Optional<Category> cat = categoryRepository.findFirstByName(name);
        if (cat.isPresent()) {
            req.setCategoryId(cat.get().getId());
        } else {
            throw new IllegalArgumentException("Không tìm thấy danh mục '" + name + "'");
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
        Optional<Category> cat = categoryRepository.findFirstByName(name);
        if (cat.isPresent()) {
            product.setCategory(cat.get());
        } else {
            throw new IllegalArgumentException("Không tìm thấy danh mục '" + name + "'");
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

    private void lookupAndSetCategoryByIdOnEntity(Product product, String value) {
        Long id = parseLong(value);
        Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy danh mục với ID '" + id + "'"));
        product.setCategory(cat);
    }

    private double parseDouble(String value) {
        return Double.parseDouble(value.replace(",", "").replace(" ", ""));
    }

    private int parseInt(String value) {
        return Integer.parseInt(value.replace(",", "").replace(" ", ""));
    }

    private long parseLong(String value) {
        return Long.parseLong(value.replace(",", "").replace(" ", ""));
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

    // ─── Attribute Import ───────────────────────────────────────────────────────

    private void importAttributes(Long productId, Row row, String[] columnHeaders, ProductImportAttributeConfig config) {
        List<Long> valueIds = new ArrayList<>();

        // 1. Handle variant columns (Quy cách, Đặc điểm 1, Đặc điểm 2)
        if (config.getVariantColumns() != null) {
            for (String columnName : config.getVariantColumns()) {
                String value = getCellValueByColumnName(row, columnName, columnHeaders);
                if (value != null && !value.trim().isEmpty()) {
                    Attribute attr = findOrCreateAttribute(
                        generateAttributeName(columnName), columnName, true);
                    AttributeValue av = findOrCreateAttributeValue(attr, value.trim());
                    valueIds.add(av.getId());
                }
            }
        }

        // 2. Handle spec text column (Thông số kỹ thuật)
        if (config.getSpecColumn() != null && !config.getSpecColumn().isEmpty()) {
            String specText = getCellValueByColumnName(row, config.getSpecColumn(), columnHeaders);
            if (specText != null && !specText.trim().isEmpty()) {
                Map<String, String> parsed = parseSpecText(specText.trim(), config.getSpecDelimiter(), config.getVariantColumns());
                for (Map.Entry<String, String> entry : parsed.entrySet()) {
                    String attrName = generateAttributeName(entry.getKey());
                    Attribute attr = findOrCreateAttribute(attrName, entry.getKey(), false);
                    AttributeValue av = findOrCreateAttributeValue(attr, entry.getValue());
                    valueIds.add(av.getId());
                }
            }
        }

        // 3. Assign all values to product (delete old + add new)
        if (!valueIds.isEmpty()) {
            productAttributeValueRepository.deleteByProductId(productId);
            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
            for (Long avId : valueIds) {
                AttributeValue av = attributeValueRepository.findById(avId)
                    .orElseThrow(() -> new RuntimeException("AttributeValue not found: " + avId));
                ProductAttributeValue pav = new ProductAttributeValue();
                pav.setProduct(product);
                pav.setAttributeValue(av);
                productAttributeValueRepository.save(pav);
            }
        }
    }

    private Map<String, String> parseSpecText(String specText, String delimiter, List<String> variantColumns) {
        Map<String, String> result = new LinkedHashMap<>();
        if (specText == null || specText.isEmpty()) return result;

        String text = specText.trim();

        if (text.startsWith("- ")) {
            text = text.substring(2).trim();
        } else if (delimiter != null && !delimiter.isEmpty() && text.startsWith(delimiter)) {
            text = text.substring(delimiter.length()).trim();
        }

        if (delimiter == null || delimiter.isEmpty()) {
            delimiter = " - ";
        }

        String pendingLabel = null;
        String lastCompletedLabel = null;
        boolean skipNextValue = false;

        String[] lines = text.split("\\n");
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            if (!line.contains(delimiter)) {
                // ── Single segment line ────────────────────────────────────────
                if (line.contains(":")) {
                    parseSpecItem(line, result);
                    lastCompletedLabel = getLastKey(result);
                    pendingLabel = null;
                } else {
                    if (skipNextValue) {
                        skipNextValue = false;
                        continue;
                    }
                    if (pendingLabel != null) {
                        if (variantColumns == null || !variantColumns.contains(pendingLabel)) {
                            result.put(pendingLabel, line);
                            lastCompletedLabel = pendingLabel;
                        }
                        pendingLabel = null;
                    } else {
                        if (variantColumns != null && variantColumns.contains(line)) {
                            skipNextValue = true;
                        } else {
                            pendingLabel = line;
                        }
                    }
                }
            } else {
                // ── Multi-segment line ─────────────────────────────────────────
                String[] parts = line.split(delimiter);

                // Process first segment
                String first = parts[0].trim();
                if (first.contains(":")) {
                    parseSpecItem(first, result);
                    lastCompletedLabel = getLastKey(result);
                    pendingLabel = null;
                } else {
                    if (skipNextValue) {
                        skipNextValue = false;
                    } else if (pendingLabel != null) {
                        if (variantColumns == null || !variantColumns.contains(pendingLabel)) {
                            result.put(pendingLabel, first);
                            lastCompletedLabel = pendingLabel;
                        }
                        pendingLabel = null;
                    } else if (lastCompletedLabel != null) {
                        String currentVal = result.get(lastCompletedLabel);
                        if (currentVal != null) {
                            result.put(lastCompletedLabel, currentVal + delimiter + first);
                        }
                    }
                }

                // Process remaining segments
                for (int i = 1; i < parts.length; i++) {
                    String part = parts[i].trim();
                    if (part.isEmpty()) continue;

                    if (part.contains(":")) {
                        parseSpecItem(part, result);
                        lastCompletedLabel = getLastKey(result);
                        pendingLabel = null;
                    } else {
                        if (skipNextValue) {
                            skipNextValue = false;
                        } else if (i == parts.length - 1) {
                            if (variantColumns == null || !variantColumns.contains(part)) {
                                pendingLabel = part;
                            } else {
                                skipNextValue = true;
                            }
                        }
                    }
                }
            }
        }

        return result;
    }

    private String getLastKey(Map<String, String> map) {
        String last = null;
        for (String key : map.keySet()) {
            last = key;
        }
        return last;
    }

    private void parseSpecItem(String part, Map<String, String> result) {
        if (part == null || part.isEmpty()) return;
        // Remove leading dash+space if still present (e.g., from partial cleanup)
        if (part.startsWith("- ")) {
            part = part.substring(2).trim();
        }
        if (part.isEmpty()) return;
        int colonIndex = part.indexOf(':');
        if (colonIndex > 0) {
            String label = part.substring(0, colonIndex).trim();
            String value = part.substring(colonIndex + 1).trim();
            if (!label.isEmpty()) {
                result.put(label, value);
            }
        }
    }

    private Attribute findOrCreateAttribute(String name, String displayName, boolean isVariant) {
        return attributeRepository.findByName(name)
            .orElseGet(() -> {
                Attribute attr = new Attribute();
                attr.setName(name);
                attr.setDisplayName(displayName);
                attr.setIsVariant(isVariant);
                attr.setValues(new ArrayList<>());
                return attributeRepository.save(attr);
            });
    }

    private AttributeValue findOrCreateAttributeValue(Attribute attribute, String value) {
        List<AttributeValue> existingValues = attributeValueRepository.findByAttributeId(attribute.getId());
        for (AttributeValue av : existingValues) {
            if (av.getValue().equals(value)) {
                return av;
            }
        }
        AttributeValue av = new AttributeValue();
        av.setAttribute(attribute);
        av.setValue(value);
        return attributeValueRepository.save(av);
    }

    private String generateAttributeName(String displayName) {
        if (displayName == null || displayName.isEmpty()) return "unknown";

        String name = displayName.toLowerCase().trim();

        // Replace Vietnamese characters that don't decompose in NFD
        name = name.replace('đ', 'd');
        name = name.replace('ư', 'u');
        name = name.replace('ơ', 'o');

        // Decompose remaining Vietnamese characters and remove diacritics
        name = Normalizer.normalize(name, Normalizer.Form.NFD);
        name = name.replaceAll("\\p{M}", "");

        // Replace non-alphanumeric (except spaces) with underscore
        name = name.replaceAll("[^a-z0-9\\s]", "_");
        // Replace spaces with underscore
        name = name.replaceAll("\\s+", "_");

        // Clean up consecutive underscores and trim
        name = name.replaceAll("_+", "_").replaceAll("^_|_$", "");

        return name.isEmpty() ? "unknown" : name;
    }

    private String getCellValueByColumnName(Row row, String columnName, String[] columnHeaders) {
        int colIndex = resolveColumnIndex(columnName, columnHeaders);
        if (colIndex < 0) return null;
        return getCellValueAsString(row.getCell(colIndex));
    }
}
