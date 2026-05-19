package com.anhtin.tmdt.backend.modules.region.repository;

import com.anhtin.tmdt.backend.modules.region.entity.BusinessRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BusinessRegionRepository extends JpaRepository<BusinessRegion, Long> {
    Optional<BusinessRegion> findByCode(String code);
    boolean existsByCode(String code);
}
