package com.anhtin.tmdt.backend.modules.credit.repository;

import com.anhtin.tmdt.backend.modules.credit.entity.DepositContract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepositContractRepository extends JpaRepository<DepositContract, Long> {
    List<DepositContract> findByAgencyId(Long agencyId);
    Optional<DepositContract> findTopByAgencyIdAndStatusOrderByCreatedAtDesc(Long agencyId, DepositContract.DepositContractStatus status);
    Optional<DepositContract> findByContractNumber(String contractNumber);
    boolean existsByContractNumber(String contractNumber);
}
