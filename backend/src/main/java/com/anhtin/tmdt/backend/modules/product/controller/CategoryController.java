package com.anhtin.tmdt.backend.modules.product.controller;

import com.anhtin.tmdt.backend.modules.product.dto.CategoryRequest;
import com.anhtin.tmdt.backend.modules.common.dto.CategoryDTO;
import com.anhtin.tmdt.backend.modules.product.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

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

    /**
     * Trả về tên hiển thị cho từng level danh mục.
     * Ví dụ: { 0: "Ngành hàng", 1: "Nhóm hàng", 2: "Loại sản phẩm", 3: "Dòng sản phẩm" }
     */
    @GetMapping("/levels")
    public ResponseEntity<Map<Integer, String>> getLevelNames() {
        return ResponseEntity.ok(categoryService.getLevelNames());
    }

    /**
     * Cập nhật tên hiển thị cho từng level danh mục.
     */
    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY')")
    @PutMapping("/levels")
    public ResponseEntity<Void> updateLevelNames(@RequestBody Map<Integer, String> levelNames) {
        categoryService.updateLevelNames(levelNames);
        return ResponseEntity.ok().build();
    }

    /**
     * Lấy danh mục theo level cụ thể.
     */
    @GetMapping("/level/{level}")
    public ResponseEntity<List<CategoryDTO>> getCategoriesByLevel(@PathVariable Integer level) {
        return ResponseEntity.ok(categoryService.getCategoriesByLevel(level));
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    /**
     * Lấy danh mục con của một danh mục cha.
     */
    @GetMapping("/{id:[0-9]+}/children")
    public ResponseEntity<List<CategoryDTO>> getChildCategories(@PathVariable @NonNull Long id) {
        return ResponseEntity.ok(categoryService.getChildCategories(id));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY') or hasRole('AGENCY')")
    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.createCategory(request));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY') or hasRole('AGENCY')")
    @PutMapping("/{id:[0-9]+}")
    public ResponseEntity<CategoryDTO> updateCategory(@PathVariable @NonNull Long id, @Valid @RequestBody CategoryRequest request) {
        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('COMPANY') or hasRole('AGENCY')")
    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<?> deleteCategory(@PathVariable @NonNull Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok("Category deleted successfully");
    }
}

