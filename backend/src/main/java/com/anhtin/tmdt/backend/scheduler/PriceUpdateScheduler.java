package com.anhtin.tmdt.backend.scheduler;

import com.anhtin.tmdt.backend.modules.price.service.PriceUpdateVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Scheduler tự động kiểm tra và áp dụng các phiếu cập nhật giá đã đến hạn.
 */
@Component
public class PriceUpdateScheduler {

    @Autowired
    private PriceUpdateVoucherService voucherService;

    /**
     * Chạy mỗi phút (giây thứ 0) để kiểm tra các voucher PENDING đã đến giờ scheduledAt.
     */
    @Scheduled(cron = "0 * * * * *")
    public void processPendingPriceUpdates() {
        System.out.println("⏰ [PriceUpdateScheduler] Checking pending price vouchers at " + LocalDateTime.now());
        voucherService.applyPendingVouchers();
    }
}
