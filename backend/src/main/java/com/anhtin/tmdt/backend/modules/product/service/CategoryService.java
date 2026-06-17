package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.CategoryRequest;
import com.anhtin.tmdt.backend.modules.common.dto.CategoryDTO;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private com.anhtin.tmdt.backend.modules.common.service.SystemConfigService systemConfigService;

    @Autowired
    private com.anhtin.tmdt.backend.modules.common.repository.SystemConfigRepository configRepository;

    public List<CategoryDTO> getAllCategories() {
        Map<Integer, String> levelNames = getLevelNames();
        return categoryRepository.findAll().stream()
                .map(c -> new CategoryDTO(c, levelNames))
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(@NonNull Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        return new CategoryDTO(category, getLevelNames());
    }

    public List<CategoryDTO> getCategoriesByLevel(Integer level) {
        Map<Integer, String> levelNames = getLevelNames();
        return categoryRepository.findByLevel(level).stream()
                .map(c -> new CategoryDTO(c, levelNames))
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> getChildCategories(Long parentId) {
        Map<Integer, String> levelNames = getLevelNames();
        return categoryRepository.findByParentId(parentId).stream()
                .map(c -> new CategoryDTO(c, levelNames))
                .collect(Collectors.toList());
    }

    /**
     * Trả về danh sách tên hiển thị cho từng level danh mục.
     */
    public Map<Integer, String> getLevelNames() {
        Map<Integer, String> levelNames = new java.util.HashMap<>();
        
        // 1. Gán mặc định cho các cấp cơ bản
        for (int i = 0; i <= 3; i++) {
            levelNames.put(i, Category.DEFAULT_LEVEL_NAMES.get(i));
        }

        // 2. Tải các cấu hình cấp từ DB
        List<com.anhtin.tmdt.backend.modules.common.entity.SystemConfig> configs = 
                configRepository.findByKeyStartingWith("category.level.");
                
        for (com.anhtin.tmdt.backend.modules.common.entity.SystemConfig config : configs) {
            String key = config.getKey();
            try {
                int level = Integer.parseInt(key.substring("category.level.".length()));
                if (config.getValue() != null && !config.getValue().trim().isEmpty()) {
                    levelNames.put(level, config.getValue());
                }
            } catch (NumberFormatException e) {
                // Bỏ qua nếu lỗi parse
            }
        }
        return levelNames;
    }

    /**
     * Cập nhật danh sách tên hiển thị cho từng level danh mục.
     */
    @org.springframework.transaction.annotation.Transactional
    public void updateLevelNames(Map<Integer, String> levelNames) {
        if (levelNames == null) return;
        Long adminUserId = null;
        
        // 1. Lưu các cấu hình được truyền lên
        for (Map.Entry<Integer, String> entry : levelNames.entrySet()) {
            if (entry.getKey() != null && entry.getValue() != null) {
                systemConfigService.setConfigValue("category.level." + entry.getKey(), entry.getValue(), adminUserId);
            }
        }
        
        // 2. Xóa các cấu hình cũ không còn tồn tại trong danh sách truyền lên
        List<com.anhtin.tmdt.backend.modules.common.entity.SystemConfig> configs = 
                configRepository.findByKeyStartingWith("category.level.");
                
        for (com.anhtin.tmdt.backend.modules.common.entity.SystemConfig config : configs) {
            String key = config.getKey();
            try {
                int level = Integer.parseInt(key.substring("category.level.".length()));
                if (!levelNames.containsKey(level)) {
                    configRepository.delete(config);
                }
            } catch (NumberFormatException e) {
                // Bỏ qua
            }
        }
    }

    public CategoryDTO createCategory(CategoryRequest request) {
        Category category = new Category();
        category.setName(request.getName());
        category.setImageUrl(request.getImageUrl());
        category.setBravoId(request.getBravoId());
        category.setStatus(request.getStatus());
        category.setPriority(request.getPriority());
        category.setBravoSortValue(request.getBravoSortValue());
        category.setIsBranch(request.getIsBranch());
        category.setShowOnLeftMenu(request.getShowOnLeftMenu());
        category.setDisplayStatus(request.getDisplayStatus());
        category.setBackgroundColor(request.getBackgroundColor());

        Long parentId = request.getParentId();
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent category not found with id " + parentId));
            category.setParent(parent);
        }

        Category saved = categoryRepository.save(category);
        return new CategoryDTO(saved, getLevelNames());
    }

    public CategoryDTO updateCategory(@NonNull Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        
        category.setName(request.getName());
        category.setImageUrl(request.getImageUrl());
        category.setBravoId(request.getBravoId());
        category.setStatus(request.getStatus());
        category.setPriority(request.getPriority());
        category.setBravoSortValue(request.getBravoSortValue());
        category.setIsBranch(request.getIsBranch());
        category.setShowOnLeftMenu(request.getShowOnLeftMenu());
        category.setDisplayStatus(request.getDisplayStatus());
        category.setBackgroundColor(request.getBackgroundColor());

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
        return new CategoryDTO(updated, getLevelNames());
    }

    public void deleteCategory(@NonNull Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        if (category != null) {
            categoryRepository.delete(category);
        }
    }
}

