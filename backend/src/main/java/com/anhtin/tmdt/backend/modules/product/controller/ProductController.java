package com.anhtin.tmdt.backend.modules.product.controller;

import com.anhtin.tmdt.backend.modules.product.dto.ProductRequest;
import com.anhtin.tmdt.backend.modules.product.dto.ProductImportRequest;
import com.anhtin.tmdt.backend.modules.product.dto.ProductImportResult;
import com.anhtin.tmdt.backend.modules.common.dto.ProductDTO;
import com.anhtin.tmdt.backend.modules.product.service.ProductService;
import com.anhtin.tmdt.backend.modules.product.service.ProductImportService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductImportService productImportService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts(
            @RequestParam(required = false) Long agencyId,
            @RequestParam(required = false) Long customerId) {
        return ResponseEntity.ok(productService.getAllProducts(agencyId, customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(
            @PathVariable @NonNull Long id,
            @RequestParam(required = false) Long agencyId,
            @RequestParam(required = false) Long customerId,
            @RequestParam(defaultValue = "1") Integer quantity) {
        return ResponseEntity.ok(productService.getProductById(id, agencyId, customerId, quantity));
    }
    
    // Yêu cầu quyền admin/company/agency để thêm sản phẩm
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    @PostMapping
    public ResponseEntity<ProductDTO> addProduct(@Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.addProduct(request));
    }
    
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable @NonNull Long id, @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.ok(productService.updateProduct(id, request));
    }
    
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable @NonNull Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok("Product deleted successfully");
    }

    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    @PostMapping("/import")
    public ResponseEntity<ProductImportResult> importProducts(
            @RequestParam("file") MultipartFile file,
            @RequestParam("mapping") String mappingJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            ProductImportRequest request = mapper.readValue(mappingJson, ProductImportRequest.class);
            ProductImportResult result = productImportService.importProducts(file, request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing import config: " + e.getMessage(), e);
        }
    }

    @GetMapping("/import/template")
    public ResponseEntity<InputStreamResource> downloadTemplate() {
        ByteArrayInputStream in = productImportService.exportTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=product_import_template.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}
