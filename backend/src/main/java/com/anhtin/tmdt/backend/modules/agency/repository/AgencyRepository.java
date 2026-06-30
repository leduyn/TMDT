package com.anhtin.tmdt.backend.modules.agency.repository;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgencyRepository extends JpaRepository<Agency, Long> {
    Optional<Agency> findByPhone(String phone);
    Optional<Agency> findByCode(String code);
    Optional<Agency> findByTaxCode(String taxCode);
    boolean existsByCode(String code);
    boolean existsByPhone(String phone);
    boolean existsByTaxCode(String taxCode);
}
