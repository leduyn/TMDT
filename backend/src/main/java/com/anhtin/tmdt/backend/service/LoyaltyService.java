package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.response.LoyaltyPointDTO;
import com.anhtin.tmdt.backend.entity.*;
import com.anhtin.tmdt.backend.repository.LoyaltyPointRepository;
import com.anhtin.tmdt.backend.repository.PointTransactionRepository;
import com.anhtin.tmdt.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoyaltyService {

    @Autowired
    private LoyaltyPointRepository loyaltyPointRepository;

    @Autowired
    private PointTransactionRepository pointTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    // Tỷ lệ quy đổi: 1000đ = 1 điểm (có thể cấu hình)
    private static final double POINTS_PER_UNIT = 0.001;
    // 1 điểm = bao nhiêu tiền khi đối trừ
    private static final double POINT_VALUE = 1000.0;

    public LoyaltyPointDTO getBalance(Long customerId) {
        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);
        return new LoyaltyPointDTO(customerId, lp.getPointsBalance(), lp.getTotalEarned());
    }

    public Page<PointTransaction> getHistory(Long customerId, Pageable pageable) {
        return pointTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);
    }

    /**
     * Tích điểm sau khi đơn hàng hoàn thành.
     */
    @Transactional
    public void earnPoints(Long customerId, Order order) {
        int pointsEarned = (int) (order.getTotalAmount() * POINTS_PER_UNIT);
        if (pointsEarned <= 0) return;

        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);
        lp.setPointsBalance(lp.getPointsBalance() + pointsEarned);
        lp.setTotalEarned(lp.getTotalEarned() + pointsEarned);
        loyaltyPointRepository.save(lp);

        // Ghi log giao dịch
        PointTransaction pt = new PointTransaction();
        pt.setCustomer(order.getCustomer());
        pt.setPoints(pointsEarned);
        pt.setTransactionType(PointTransactionType.EARN);
        pt.setOrder(order);
        pt.setDescription("Tích điểm đơn hàng #" + order.getId());
        pointTransactionRepository.save(pt);
    }

    /**
     * Đối trừ điểm khi đặt hàng.
     * @return Số tiền được giảm từ điểm
     */
    @Transactional
    public double redeemPoints(Long customerId, int pointsToRedeem, Order order) {
        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);

        if (lp.getPointsBalance() < pointsToRedeem) {
            throw new RuntimeException("Không đủ điểm. Số dư: " + lp.getPointsBalance());
        }

        lp.setPointsBalance(lp.getPointsBalance() - pointsToRedeem);
        loyaltyPointRepository.save(lp);

        // Ghi log giao dịch
        PointTransaction pt = new PointTransaction();
        pt.setCustomer(order.getCustomer());
        pt.setPoints(-pointsToRedeem);
        pt.setTransactionType(PointTransactionType.REDEEM);
        pt.setOrder(order);
        pt.setDescription("Đối trừ điểm đơn hàng #" + order.getId());
        pointTransactionRepository.save(pt);

        return pointsToRedeem * POINT_VALUE;
    }

    private LoyaltyPoint getOrCreateLoyaltyPoint(Long customerId) {
        return loyaltyPointRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    if (customerId == null) throw new RuntimeException("Customer ID is required");
                    User customer = userRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));
                    LoyaltyPoint lp = new LoyaltyPoint();
                    lp.setCustomer(customer);
                    return loyaltyPointRepository.save(lp);
                });
    }
}
