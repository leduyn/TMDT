package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.PriceAssignmentVoucher;
import com.anhtin.tmdt.backend.entity.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PriceAssignmentVoucherRepository extends JpaRepository<PriceAssignmentVoucher, Long> {
    List<PriceAssignmentVoucher> findByStatusAndScheduledAtBefore(VoucherStatus status, LocalDateTime now);
    List<PriceAssignmentVoucher> findAllByOrderByCreatedAtDesc();
}
