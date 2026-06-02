package com.anhtin.tmdt.backend.scheduler;

import com.anhtin.tmdt.backend.modules.order.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class PendingPaymentScheduler {

    private static final Logger log = LoggerFactory.getLogger(PendingPaymentScheduler.class);

    @Autowired
    private OrderService orderService;

    @Scheduled(fixedRate = 300000)
    public void autoCancelExpiredPendingPayments() {
        try {
            orderService.autoCancelExpiredPendingPayments();
        } catch (Exception e) {
            log.error("Error auto-cancelling expired PENDING_PAYMENT orders: {}", e.getMessage());
        }
    }
}
