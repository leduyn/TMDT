package com.anhtin.tmdt.backend.modules.agency.repository;

import com.anhtin.tmdt.backend.modules.agency.entity.AgencyOpenedCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgencyOpenedCategoryRepository extends JpaRepository<AgencyOpenedCategory, Long> {
    List<AgencyOpenedCategory> findByAgencyId(Long agencyId);
    void deleteByAgencyId(Long agencyId);
}
