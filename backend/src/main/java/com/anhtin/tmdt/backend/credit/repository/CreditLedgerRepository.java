package com.anhtin.tmdt.backend.credit.repository;

import com.anhtin.tmdt.backend.credit.entity.CreditLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CreditLedgerRepository extends JpaRepository<CreditLedger, Long> {
    List<CreditLedger> findByAgencyId(Long agencyId);
    List<CreditLedger> findTop50ByAgencyIdOrderByCreatedAtDesc(Long agencyId);
}
