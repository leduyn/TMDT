package com.anhtin.tmdt.backend.modules.loyalty.service;

import com.anhtin.tmdt.backend.modules.common.dto.LoyaltyPointDTO;
import com.anhtin.tmdt.backend.modules.loyalty.repository.LoyaltyPointRepository;
import com.anhtin.tmdt.backend.modules.loyalty.repository.PointTransactionRepository;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.anhtin.tmdt.backend.modules.loyalty.entity.LoyaltyPoint;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.loyalty.entity.PointTransaction;
import com.anhtin.tmdt.backend.modules.loyalty.entity.PointTransactionType;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

@Service
public class LoyaltyService {

    @Autowired
    private LoyaltyPointRepository loyaltyPointRepository;

    @Autowired
    private PointTransactionRepository pointTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    // Tá»· lá»‡ quy Ä‘á»•i: 1000Ä‘ = 1 Ä‘iá»ƒm (cÃ³ thá»ƒ cáº¥u hÃ¬nh)
    private static final double POINTS_PER_UNIT = 0.001;
    // 1 Ä‘iá»ƒm = bao nhiÃªu tiá»n khi Ä‘á»‘i trá»«
    private static final double POINT_VALUE = 1000.0;

    public LoyaltyPointDTO getBalance(Long customerId) {
        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);
        return new LoyaltyPointDTO(customerId, lp.getPointsBalance(), lp.getTotalEarned());
    }

    public Page<PointTransaction> getHistory(Long customerId, Pageable pageable) {
        return pointTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable);
    }

    /**
     * TÃ­ch Ä‘iá»ƒm sau khi Ä‘Æ¡n hÃ ng hoÃ n thÃ nh.
     */
    @Transactional
    public void earnPoints(Long customerId, Order order) {
        int pointsEarned = (int) (order.getTotalAmount() * POINTS_PER_UNIT);
        if (pointsEarned <= 0) return;

        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);
        lp.setPointsBalance(lp.getPointsBalance() + pointsEarned);
        lp.setTotalEarned(lp.getTotalEarned() + pointsEarned);
        loyaltyPointRepository.save(lp);

        // Ghi log giao dá»‹ch
        PointTransaction pt = new PointTransaction();
        pt.setCustomer(order.getCustomer());
        pt.setPoints(pointsEarned);
        pt.setTransactionType(PointTransactionType.EARN);
        pt.setOrder(order);
        pt.setDescription("TÃ­ch Ä‘iá»ƒm Ä‘Æ¡n hÃ ng #" + order.getId());
        pointTransactionRepository.save(pt);
    }

    /**
     * Äá»‘i trá»« Ä‘iá»ƒm khi Ä‘áº·t hÃ ng.
     * @return Sá»‘ tiá»n Ä‘Æ°á»£c giáº£m tá»« Ä‘iá»ƒm
     */
    @Transactional
    public double redeemPoints(Long customerId, int pointsToRedeem, Order order) {
        LoyaltyPoint lp = getOrCreateLoyaltyPoint(customerId);

        if (lp.getPointsBalance() < pointsToRedeem) {
            throw new RuntimeException("KhÃ´ng Ä‘á»§ Ä‘iá»ƒm. Sá»‘ dÆ°: " + lp.getPointsBalance());
        }

        lp.setPointsBalance(lp.getPointsBalance() - pointsToRedeem);
        loyaltyPointRepository.save(lp);

        // Ghi log giao dá»‹ch
        PointTransaction pt = new PointTransaction();
        pt.setCustomer(order.getCustomer());
        pt.setPoints(-pointsToRedeem);
        pt.setTransactionType(PointTransactionType.REDEEM);
        pt.setOrder(order);
        pt.setDescription("Äá»‘i trá»« Ä‘iá»ƒm Ä‘Æ¡n hÃ ng #" + order.getId());
        pointTransactionRepository.save(pt);

        return pointsToRedeem * POINT_VALUE;
    }

    private LoyaltyPoint getOrCreateLoyaltyPoint(Long customerId) {
        return loyaltyPointRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    if (customerId == null) throw new RuntimeException("Customer ID is required");
                    User customer = userRepository.findById(customerId)
                            .orElseThrow(() -> new RuntimeException("KhÃ¡ch hÃ ng khÃ´ng tá»“n táº¡i"));
                    LoyaltyPoint lp = new LoyaltyPoint();
                    lp.setCustomer(customer);
                    return loyaltyPointRepository.save(lp);
                });
    }
}
