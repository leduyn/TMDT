package com.anhtin.tmdt.backend.modules.order.repository;

import com.anhtin.tmdt.backend.modules.order.entity.Transaction;
import com.anhtin.tmdt.backend.modules.order.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    Optional<Transaction> findByOrderId(Long orderId);
    List<Transaction> findByAgencyId(Long agencyId);
    List<Transaction> findByAgencyIdAndPaymentStatus(Long agencyId, PaymentStatus status);

    @Query("SELECT COALESCE(SUM(t.agencyNetIncome), 0) FROM Transaction t WHERE t.agency.id = :agencyId AND t.paymentStatus = 'COMPLETED'")
    Double sumAgencyNetIncomeByAgencyId(Long agencyId);
}
