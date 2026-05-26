package com.anhtin.tmdt.backend.modules.product.repository;

import com.anhtin.tmdt.backend.modules.product.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}
