package com.anhtin.tmdt.backend.modules.region.repository;

import com.anhtin.tmdt.backend.modules.region.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Long> {
    Optional<Province> findByCode(Long code);
}
