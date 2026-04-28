package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.dto.request.CategoryRequest;
import com.anhtin.tmdt.backend.dto.response.CategoryDTO;
import com.anhtin.tmdt.backend.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY') or hasRole('AGENCY')")
    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY') or hasRole('AGENCY')")
    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable @NonNull Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY') or hasRole('AGENCY')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable @NonNull Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}
