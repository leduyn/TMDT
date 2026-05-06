package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.dto.request.ProductRequest;
import com.anhtin.tmdt.backend.dto.response.ProductDTO;
import com.anhtin.tmdt.backend.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

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
            @RequestParam(required = false) Long customerId) {
        return ResponseEntity.ok(productService.getProductById(id, agencyId, customerId));
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
}
