package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {
}
