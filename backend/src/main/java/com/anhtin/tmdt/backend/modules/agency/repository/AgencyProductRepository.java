package com.anhtin.tmdt.backend.modules.agency.repository;

import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

@Repository
public interface AgencyProductRepository extends JpaRepository<AgencyProduct, Long> {
    List<AgencyProduct> findByAgencyId(Long agencyId);
    List<AgencyProduct> findByAgencyIdAndStatus(Long agencyId, String status);
    List<AgencyProduct> findByStatus(String status);
}
