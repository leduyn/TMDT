package com.anhtin.tmdt.backend.modules.credit.repository;

import com.anhtin.tmdt.backend.modules.credit.entity.OverdueDebt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OverdueDebtRepository extends JpaRepository<OverdueDebt, Long> {
    List<OverdueDebt> findByAgencyIdAndStatus(Long agencyId, OverdueDebt.OverdueStatus status);
    List<OverdueDebt> findByStatus(OverdueDebt.OverdueStatus status);
    List<OverdueDebt> findByOrderId(Long orderId);
}
