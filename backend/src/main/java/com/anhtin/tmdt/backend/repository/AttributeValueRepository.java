package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.AttributeValue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttributeValueRepository extends JpaRepository<AttributeValue, Long> {
    List<AttributeValue> findByAttributeId(Long attributeId);
    void deleteByAttributeId(Long attributeId);
}
