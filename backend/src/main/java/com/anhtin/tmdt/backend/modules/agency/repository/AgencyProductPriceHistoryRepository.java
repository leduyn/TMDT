package com.anhtin.tmdt.backend.modules.agency.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPriceHistory;

@Repository
public interface AgencyProductPriceHistoryRepository extends JpaRepository<AgencyProductPriceHistory, Long> {
    List<AgencyProductPriceHistory> findByAgencyIdAndProductIdOrderByChangedAtDesc(Long agencyId, Long productId);
    List<AgencyProductPriceHistory> findByAgencyProductPriceIdOrderByChangedAtDesc(Long agencyProductPriceId);
    // Return the most recent price history entry for an agency and product
    AgencyProductPriceHistory findTopByAgencyIdAndProductIdOrderByChangedAtDesc(Long agencyId, Long productId);

    // Find the most recent price history at or before a specific date (to determine what the price was at that time)
    @Query("SELECT h FROM AgencyProductPriceHistory h WHERE h.agency.id = :agencyId AND h.product.id = :productId AND h.changedAt <= :beforeDate ORDER BY h.changedAt DESC LIMIT 1")
    Optional<AgencyProductPriceHistory> findPriceAtDate(@Param("agencyId") Long agencyId, @Param("productId") Long productId, @Param("beforeDate") LocalDateTime beforeDate);
}
