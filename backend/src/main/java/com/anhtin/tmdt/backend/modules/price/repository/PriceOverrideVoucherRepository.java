package com.anhtin.tmdt.backend.modules.price.repository;

import com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus;
import com.anhtin.tmdt.backend.modules.price.entity.PriceOverrideVoucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PriceOverrideVoucherRepository extends JpaRepository<PriceOverrideVoucher, Long> {
    List<PriceOverrideVoucher> findByStatusAndScheduledAtBefore(VoucherStatus status, LocalDateTime time);
}
