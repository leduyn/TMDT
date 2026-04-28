package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.CategoryRequest;
import com.anhtin.tmdt.backend.dto.response.CategoryDTO;
import com.anhtin.tmdt.backend.entity.Category;
import com.anhtin.tmdt.backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(CategoryDTO::new)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(@NonNull Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        return new CategoryDTO(category);
    }

    public CategoryDTO createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setImageUrl(request.getImageUrl());

        Long parentId = request.getParentId();
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent category not found with id " + parentId));
            category.setParent(parent);
        }

        Category saved = categoryRepository.save(category);
        return new CategoryDTO(saved);
    }

    public CategoryDTO updateCategory(@NonNull Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        
        category.setName(request.getName());
        category.setImageUrl(request.getImageUrl());

        Long parentId = request.getParentId();
        if (parentId != null) {
            if (parentId.equals(id)) {
                throw new RuntimeException("A category cannot be its own parent.");
            }
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent category not found with id " + parentId));
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        Category updated = categoryRepository.save(category);
        return new CategoryDTO(updated);
    }

    public void deleteCategory(@NonNull Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        if (category != null) {
            categoryRepository.delete(category);
        }
    }
}
