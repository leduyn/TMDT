package com.anhtin.tmdt.backend.modules.region.repository;

import com.anhtin.tmdt.backend.modules.region.entity.Ward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import java.util.Optional;

@Repository
public interface WardRepository extends JpaRepository<Ward, Long> {
    List<Ward> findByIdIn(List<Long> ids);
    Optional<Ward> findByCode(Long code);
    List<Ward> findByProvinceIdIn(List<Long> provinceIds);
}
