package com.anhtin.tmdt.backend.modules.credit.repository;

import com.anhtin.tmdt.backend.modules.credit.entity.DepositPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepositPaymentRepository extends JpaRepository<DepositPayment, Long> {
    List<DepositPayment> findByDepositContractIdOrderByCreatedAtDesc(Long depositContractId);

    @Query("SELECT COALESCE(SUM(dp.amount), 0) FROM DepositPayment dp WHERE dp.depositContractId = :contractId")
    Double sumAmountByDepositContractId(@Param("contractId") Long contractId);
}
