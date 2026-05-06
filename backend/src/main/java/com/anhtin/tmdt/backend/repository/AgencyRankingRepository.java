package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.AgencyRanking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgencyRankingRepository extends JpaRepository<AgencyRanking, Long> {
    List<AgencyRanking> findByMonthAndYearOrderByTotalRevenueDesc(Integer month, Integer year);
    Optional<AgencyRanking> findByAgencyIdAndMonthAndYear(Long agencyId, Integer month, Integer year);
    Optional<AgencyRanking> findFirstByAgencyIdOrderByYearDescMonthDesc(Long agencyId);
}
