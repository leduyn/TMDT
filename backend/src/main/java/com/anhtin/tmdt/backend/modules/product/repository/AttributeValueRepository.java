package com.anhtin.tmdt.backend.modules.product.repository;

import com.anhtin.tmdt.backend.modules.product.entity.AttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@Repository
public interface AttributeValueRepository extends JpaRepository<AttributeValue, Long> {
    List<AttributeValue> findByAttributeId(Long attributeId);
    void deleteByAttributeId(Long attributeId);
}
