package com.anhtin.tmdt.backend.modules.product.controller;

import com.anhtin.tmdt.backend.modules.product.dto.ProductTypeRequest;
import com.anhtin.tmdt.backend.modules.common.dto.ProductTypeDTO;
import com.anhtin.tmdt.backend.modules.product.service.ProductTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/product-types")
public class ProductTypeController {

    @Autowired
    private ProductTypeService productTypeService;

    @GetMapping
    public ResponseEntity<List<ProductTypeDTO>> getAllProductTypes() {
        return ResponseEntity.ok(productTypeService.getAllProductTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductTypeDTO> getProductTypeById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(productTypeService.getProductTypeById(id));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY')")
    @PostMapping
    public ResponseEntity<ProductTypeDTO> createProductType(@Valid @RequestBody ProductTypeRequest request) {
        return ResponseEntity.ok(productTypeService.createProductType(request));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY')")
    @PutMapping("/{id}")
    public ResponseEntity<ProductTypeDTO> updateProductType(@PathVariable @NonNull Long id, @Valid @RequestBody ProductTypeRequest request) {
        return ResponseEntity.ok(productTypeService.updateProductType(id, request));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProductType(@PathVariable @NonNull Long id) {
        productTypeService.deleteProductType(id);
        return ResponseEntity.ok("ProductType deleted successfully");
    }
}
