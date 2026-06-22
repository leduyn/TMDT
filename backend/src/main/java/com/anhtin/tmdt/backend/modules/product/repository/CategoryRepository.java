package com.anhtin.tmdt.backend.modules.product.repository;

import com.anhtin.tmdt.backend.modules.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByLevel(Integer level);
    List<Category> findByParentId(Long parentId);
    Optional<Category> findByName(String name);
    Optional<Category> findFirstByName(String name);
    boolean existsByNameAndLevel(String name, Integer level);
    boolean existsByNameAndLevelAndIdNot(String name, Integer level, Long id);
    Optional<Category> findByBravoId(Long bravoId);
}

