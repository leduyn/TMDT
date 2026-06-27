package com.anhtin.tmdt.backend.modules.product.controller;

import com.anhtin.tmdt.backend.modules.product.dto.BrandImportRequest;
import com.anhtin.tmdt.backend.modules.product.dto.BrandImportResult;
import com.anhtin.tmdt.backend.modules.product.dto.BrandRequest;
import com.anhtin.tmdt.backend.modules.common.dto.BrandDTO;
import com.anhtin.tmdt.backend.modules.product.service.BrandImportService;
import com.anhtin.tmdt.backend.modules.product.service.BrandService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.util.List;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @Autowired
    private BrandImportService brandImportService;

    @GetMapping
    public ResponseEntity<List<BrandDTO>> getAllBrands() {
        return ResponseEntity.ok(brandService.getAllBrands());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDTO> getBrandById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(brandService.getBrandById(id));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY')")
    @PostMapping
    public ResponseEntity<BrandDTO> createBrand(@Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(brandService.createBrand(request));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY')")
    @PutMapping("/{id}")
    public ResponseEntity<BrandDTO> updateBrand(@PathVariable @NonNull Long id, @Valid @RequestBody BrandRequest request) {
        return ResponseEntity.ok(brandService.updateBrand(id, request));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBrand(@PathVariable @NonNull Long id) {
        brandService.deleteBrand(id);
        return ResponseEntity.ok("Brand deleted successfully");
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY')")
    @PostMapping("/import")
    public ResponseEntity<BrandImportResult> importBrands(
            @RequestParam("file") MultipartFile file,
            @RequestParam("mapping") String mappingJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            BrandImportRequest request = mapper.readValue(mappingJson, BrandImportRequest.class);
            BrandImportResult result = brandImportService.importBrands(file, request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing import config: " + e.getMessage(), e);
        }
    }

    @GetMapping("/import/template")
    public ResponseEntity<InputStreamResource> downloadTemplate() {
        ByteArrayInputStream in = brandImportService.exportTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=brand_import_template.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportBrands() {
        ByteArrayInputStream in = brandImportService.exportBrands();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=brands.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}
