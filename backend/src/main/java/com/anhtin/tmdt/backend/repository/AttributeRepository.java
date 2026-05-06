package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttributeRepository extends JpaRepository<Attribute, Long> {
    List<Attribute> findByCategoryId(Long categoryId);
    List<Attribute> findByCategoryIsNull();
    java.util.Optional<Attribute> findByName(String name);
}
