package com.anhtin.tmdt.backend.modules.product.controller;

import com.anhtin.tmdt.backend.modules.product.dto.BrandRequest;
import com.anhtin.tmdt.backend.modules.common.dto.BrandDTO;
import com.anhtin.tmdt.backend.modules.product.service.BrandService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.anhtin.tmdt.backend.modules.product.entity.Brand;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandService brandService;

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
}
