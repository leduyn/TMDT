package com.anhtin.tmdt.backend.modules.agency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPrice;

@Repository
public interface AgencyProductPriceRepository extends JpaRepository<AgencyProductPrice, Long> {
    Optional<AgencyProductPrice> findByAgencyIdAndProductId(Long agencyId, Long productId);
    List<AgencyProductPrice> findByAgencyId(Long agencyId);
    void deleteByAgencyId(Long agencyId);
}
