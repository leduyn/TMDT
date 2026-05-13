package com.anhtin.tmdt.backend.modules.credit.repository;

import com.anhtin.tmdt.backend.modules.credit.entity.AgencyDebt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgencyDebtRepository extends JpaRepository<AgencyDebt, Long> {
    List<AgencyDebt> findByAgencyIdOrderByRecordingDateDesc(Long agencyId);
    List<AgencyDebt> findByOrderId(Long orderId);
    List<AgencyDebt> findAllByOrderByRecordingDateDesc();
}
