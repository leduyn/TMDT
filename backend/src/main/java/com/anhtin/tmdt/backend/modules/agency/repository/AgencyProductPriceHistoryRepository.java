package com.anhtin.tmdt.backend.modules.agency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPriceHistory;

@Repository
public interface AgencyProductPriceHistoryRepository extends JpaRepository<AgencyProductPriceHistory, Long> {
    List<AgencyProductPriceHistory> findByAgencyIdAndProductIdOrderByChangedAtDesc(Long agencyId, Long productId);
    List<AgencyProductPriceHistory> findByAgencyProductPriceIdOrderByChangedAtDesc(Long agencyProductPriceId);
}
