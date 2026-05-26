package com.anhtin.tmdt.backend.modules.credit.scheduler;

import com.anhtin.tmdt.backend.modules.credit.entity.AgencyDebt;
import com.anhtin.tmdt.backend.modules.credit.entity.OverdueDebt;
import com.anhtin.tmdt.backend.modules.credit.repository.AgencyDebtRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.OverdueDebtRepository;
import com.anhtin.tmdt.backend.modules.credit.service.CreditService;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

@Component
public class DebtOverdueScheduler {

    private static final Logger log = LoggerFactory.getLogger(DebtOverdueScheduler.class);

    @Autowired
    private AgencyDebtRepository agencyDebtRepository;

    @Autowired
    private OverdueDebtRepository overdueDebtRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CreditService creditService;

    /**
     * Chạy mỗi giờ để kiểm tra và cập nhật các công nợ quá hạn
     * Các đơn hàng có KHN = 0 hoặc có ngày tới hạn <= hiện tại
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkAndProcessOverdueDebts() {
        log.info("Starting overdue debt check...");
        LocalDateTime now = LocalDateTime.now();

        // 1. Tìm các công nợ chưa trả hết và đã đến hoặc quá hạn
        // Hoặc các công nợ có KHN = 0 (phải trả ngay)
        List<AgencyDebt> potentiallyOverdue = agencyDebtRepository.findAll().stream()
                .filter(d -> d.getRemainingToCollect() > 0)
                .filter(d -> d.getDebtTermDays() == 0 || d.getDueDate().isBefore(now) || d.getDueDate().isEqual(now))
                .collect(Collectors.toList());

        int processedCount = 0;
        for (AgencyDebt debt : potentiallyOverdue) {
            Order order = debt.getOrder();
            if (order == null) continue;

            // Kiểm tra xem đã có bản ghi nợ quá hạn ACTIVE chưa
            boolean alreadyOverdue = overdueDebtRepository.findByOrderId(order.getId()).stream()
                    .anyMatch(od -> od.getStatus() == OverdueDebt.OverdueStatus.ACTIVE);

            if (!alreadyOverdue) {
                log.info("Processing overdue for order {}: DueDate={}, KHN={}", 
                        order.getId(), debt.getDueDate(), debt.getDebtTermDays());
                
                // Cập nhật trạng thái đơn hàng sang OVERDUE nếu đang là COMPLETED hoặc trạng thái khác
                if (!"OVERDUE".equals(order.getStatus())) {
                    order.setStatus("OVERDUE");
                    orderRepository.save(order);
                }

                // Lấy tổng dư nợ còn lại của đơn hàng này từ AgencyDebt
                double remaining = agencyDebtRepository.findByOrderId(order.getId()).stream()
                        .mapToDouble(AgencyDebt::getRemainingToCollect)
                        .sum();

                // Gọi CreditService để xử lý nghiệp vụ quá hạn (tạo OverdueDebt, phong tỏa VTC...)
                creditService.processOverdue(order.getId(), remaining);
                processedCount++;
            }
        }

        if (processedCount > 0) {
            log.info("Overdue check completed. Processed {} new overdue orders.", processedCount);
        }
    }
}
