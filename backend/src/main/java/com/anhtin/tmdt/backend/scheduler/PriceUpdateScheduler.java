package com.anhtin.tmdt.backend.scheduler;

import com.anhtin.tmdt.backend.modules.price.service.PriceUpdateVoucherService;
import com.anhtin.tmdt.backend.modules.price.service.PriceOverrideVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PriceUpdateScheduler {

    @Autowired
    private PriceUpdateVoucherService voucherService;

    @Autowired
    private PriceOverrideVoucherService overrideVoucherService;

    @Scheduled(cron = "0 * * * * *")
    public void processPendingPriceUpdates() {
        System.out.println("⏰ [PriceUpdateScheduler] Checking pending price vouchers at " + LocalDateTime.now());
        voucherService.applyPendingVouchers();
    }

    @Scheduled(cron = "0 * * * * *")
    public void processPendingOverrideVouchers() {
        System.out.println("⏰ [PriceOverrideScheduler] Checking pending override vouchers at " + LocalDateTime.now());
        overrideVoucherService.applyPendingVouchers();
    }
}
