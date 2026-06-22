package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.CategoryRequest;
import com.anhtin.tmdt.backend.modules.common.dto.CategoryDTO;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    private com.anhtin.tmdt.backend.modules.common.service.SystemConfigService systemConfigService;

    @Autowired
    private com.anhtin.tmdt.backend.modules.common.repository.SystemConfigRepository configRepository;

    private Map<Integer, String> levelNamesCache;

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
        if (levelNamesCache != null) return levelNamesCache;

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
        levelNamesCache = levelNames;
        return levelNames;
    }

    public void invalidateLevelNamesCache() {
        levelNamesCache = null;
    }

    /**
     * Cập nhật danh sách tên hiển thị cho từng level danh mục.
     */
    @org.springframework.transaction.annotation.Transactional
    public void updateLevelNames(Map<Integer, String> levelNames) {
        invalidateLevelNamesCache();
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

    private void validateDuplicateName(String name, Long parentId, Long excludeId) {
        if (name == null || name.isBlank()) return;

        int level = 0;
        Long resolvedParentId = resolveParentId(parentId);
        if (resolvedParentId != null) {
            Category parent = categoryRepository.findById(resolvedParentId).orElse(null);
            if (parent != null) {
                level = parent.getLevel() + 1;
            }
        }

        boolean exists = (excludeId != null)
            ? categoryRepository.existsByNameAndLevelAndIdNot(name.trim(), level, excludeId)
            : categoryRepository.existsByNameAndLevel(name.trim(), level);

        if (exists) {
            String levelName = Category.DEFAULT_LEVEL_NAMES.getOrDefault(level, "Cấp " + level);
            throw new IllegalArgumentException("Tên danh mục '" + name.trim() + "' đã tồn tại ở cấp " + levelName);
        }
    }

    @Transactional
    public CategoryDTO createCategory(CategoryRequest request) {
        validateDuplicateName(request.getName(), request.getParentId(), null);

        if (request.getId() != null) {
            Optional<Category> existing = categoryRepository.findById(request.getId());
            if (existing.isPresent()) {
                return updateCategory(request.getId(), request);
            }
            // Insert with specific ID using native query (IDENTITY generator ignores manual ID)
            return insertWithSpecificId(request);
        }

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

        Long parentId = resolveParentId(request.getParentId());
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId).orElse(null);
            if (parent != null) {
                category.setParent(parent);
            } else {
                parentId = null;
            }
        }

        Category saved = categoryRepository.save(category);
        return new CategoryDTO(saved, getLevelNames());
    }

    private CategoryDTO insertWithSpecificId(CategoryRequest request) {
        int level = 0;
        Long parentId = resolveParentId(request.getParentId());
        if (parentId != null) {
            Category parent = categoryRepository.findById(parentId).orElse(null);
            if (parent != null) {
                level = parent.getLevel() + 1;
            } else {
                parentId = null;
            }
        }

        String sql = "INSERT INTO categories (id, name, image_url, parent_id, level, bravo_id, status, priority, " +
                     "bravo_sort_value, is_branch, show_on_left_menu, display_status, background_color, updated_date) " +
                     "VALUES (:id, :name, :imageUrl, :parentId, :level, :bravoId, :status, :priority, " +
                     ":bravoSortValue, :isBranch, :showOnLeftMenu, :displayStatus, :backgroundColor, :updatedDate)";

        Query query = entityManager.createNativeQuery(sql)
                .setParameter("id", request.getId())
                .setParameter("name", request.getName())
                .setParameter("imageUrl", request.getImageUrl())
                .setParameter("parentId", parentId)
                .setParameter("level", level)
                .setParameter("bravoId", request.getBravoId())
                .setParameter("status", request.getStatus())
                .setParameter("priority", request.getPriority())
                .setParameter("bravoSortValue", request.getBravoSortValue())
                .setParameter("isBranch", request.getIsBranch())
                .setParameter("showOnLeftMenu", request.getShowOnLeftMenu())
                .setParameter("displayStatus", request.getDisplayStatus())
                .setParameter("backgroundColor", request.getBackgroundColor())
                .setParameter("updatedDate", LocalDateTime.now());
        query.executeUpdate();

        entityManager.clear();
        Category saved = entityManager.find(Category.class, request.getId());
        return new CategoryDTO(saved, getLevelNames());
    }

    public CategoryDTO updateCategory(@NonNull Long id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
        
        validateDuplicateName(request.getName(), request.getParentId(), id);
        
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

        Long parentId = resolveParentId(request.getParentId());
        if (parentId != null) {
            if (parentId.equals(id)) {
                throw new RuntimeException("A category cannot be its own parent.");
            }
            Category parent = categoryRepository.findById(parentId).orElse(null);
            if (parent != null) {
                category.setParent(parent);
            } else {
                category.setParent(null);
            }
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

    private Long resolveParentId(Long parentId) {
        return (parentId != null && parentId > 0) ? parentId : null;
    }
}

