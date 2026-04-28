package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.PointTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PointTransactionRepository extends JpaRepository<PointTransaction, Long> {
    Page<PointTransaction> findByCustomerIdOrderByCreatedAtDesc(Long customerId, Pageable pageable);
}
