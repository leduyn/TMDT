package com.anhtin.tmdt.backend.modules.price.repository;

import com.anhtin.tmdt.backend.modules.price.entity.PriceAssignmentVoucher;
import com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PriceAssignmentVoucherRepository extends JpaRepository<PriceAssignmentVoucher, Long> {
    List<PriceAssignmentVoucher> findByStatusAndScheduledAtBefore(VoucherStatus status, LocalDateTime now);
    List<PriceAssignmentVoucher> findAllByOrderByCreatedAtDesc();
    Page<PriceAssignmentVoucher> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
