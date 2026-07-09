package com.anhtin.tmdt.backend.modules.agency.repository;

import com.anhtin.tmdt.backend.modules.agency.entity.AgencyTypeChangeHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgencyTypeChangeHistoryRepository extends JpaRepository<AgencyTypeChangeHistory, Long> {
    List<AgencyTypeChangeHistory> findByAgencyIdOrderByCreatedAtDesc(Long agencyId);
}