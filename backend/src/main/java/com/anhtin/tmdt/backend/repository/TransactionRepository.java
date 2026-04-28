package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.Transaction;
import com.anhtin.tmdt.backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByOrderId(Long orderId);
    List<Transaction> findByAgencyId(Long agencyId);
    List<Transaction> findByAgencyIdAndPaymentStatus(Long agencyId, PaymentStatus status);

    @Query("SELECT COALESCE(SUM(t.agencyNetIncome), 0) FROM Transaction t WHERE t.agency.id = :agencyId AND t.paymentStatus = 'COMPLETED'")
    Double sumAgencyNetIncomeByAgencyId(Long agencyId);
}
