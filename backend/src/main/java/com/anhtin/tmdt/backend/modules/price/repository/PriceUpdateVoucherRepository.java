package com.anhtin.tmdt.backend.modules.price.repository;

import com.anhtin.tmdt.backend.modules.price.entity.PriceUpdateVoucher;
import com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PriceUpdateVoucherRepository extends JpaRepository<PriceUpdateVoucher, Long> {
    List<PriceUpdateVoucher> findByStatus(VoucherStatus status);
    List<PriceUpdateVoucher> findByStatusAndScheduledAtBefore(VoucherStatus status, LocalDateTime now);
    Page<PriceUpdateVoucher> findAll(Pageable pageable);
}
