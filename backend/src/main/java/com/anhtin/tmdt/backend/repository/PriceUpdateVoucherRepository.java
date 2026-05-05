package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.PriceUpdateVoucher;
import com.anhtin.tmdt.backend.entity.VoucherStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PriceUpdateVoucherRepository extends JpaRepository<PriceUpdateVoucher, Long> {
    List<PriceUpdateVoucher> findByStatus(VoucherStatus status);
    List<PriceUpdateVoucher> findByStatusAndScheduledAtBefore(VoucherStatus status, LocalDateTime now);
}
