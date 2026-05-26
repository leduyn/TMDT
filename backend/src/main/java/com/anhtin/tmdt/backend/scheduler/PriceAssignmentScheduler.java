package com.anhtin.tmdt.backend.scheduler;

import com.anhtin.tmdt.backend.modules.price.service.PriceAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class PriceAssignmentScheduler {

    private final PriceAssignmentService priceAssignmentService;

    /**
     * Chạy mỗi phút để kiểm tra các phiếu hẹn giờ gán bảng giá.
     */
    @Scheduled(cron = "0 * * * * *")
    public void checkPendingAssignments() {
        System.out.println("⏰ [PriceAssignmentScheduler] Checking pending assignments at " + LocalDateTime.now());
        priceAssignmentService.processPendingVouchers();
    }
}
