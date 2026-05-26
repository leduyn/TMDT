package com.anhtin.tmdt.backend.modules.price.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.price.repository.CommissionConfigRepository;
import com.anhtin.tmdt.backend.modules.order.entity.OrderType;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.order.entity.PaymentStatus;
import com.anhtin.tmdt.backend.modules.order.repository.TransactionRepository;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

/**
 * Engine tÃ­nh toÃ¡n chiáº¿t kháº¥u/phÃ­ linh hoáº¡t.
 * Há»— trá»£ cáº¥u hÃ¬nh riÃªng cho tá»«ng Äáº¡i lÃ½ (theo category hoáº·c chung).
 */
@Service
public class CommissionService {

    @Autowired
    private CommissionConfigRepository commissionConfigRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    /**
     * Láº¥y tá»· lá»‡ phÃ­ sÃ n (Marketplace) cho má»™t Äáº¡i lÃ½.
     * Æ¯u tiÃªn: cáº¥u hÃ¬nh theo category > cáº¥u hÃ¬nh chung > default cá»§a Agency.
     */
    public double getPlatformFeeRate(Long agencyId, Long categoryId) {
        // 1. TÃ¬m cáº¥u hÃ¬nh theo Agency + Category
        if (categoryId != null) {
            var config = commissionConfigRepository
                    .findFirstByAgencyIdAndCategoryIdAndActiveTrueOrderByCreatedAtDesc(agencyId, categoryId);
            if (config.isPresent()) {
                return config.get().getPlatformFeeRate();
            }
        }

        // 2. Fallback: cáº¥u hÃ¬nh chung cá»§a Agency
        var generalConfig = commissionConfigRepository
                .findFirstByAgencyIdAndCategoryIsNullAndActiveTrueOrderByCreatedAtDesc(agencyId);
        if (generalConfig.isPresent()) {
            return generalConfig.get().getPlatformFeeRate();
        }

        // 3. Fallback cuá»‘i: default tá»« entity Agency
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Äáº¡i lÃ½ khÃ´ng tá»“n táº¡i"));
        return agency.getDefaultCommissionRate() != null ? agency.getDefaultCommissionRate() : 5.0; // Default 5%
    }

    /**
     * Láº¥y tá»· lá»‡ chiáº¿t kháº¥u Dropship cho má»™t Äáº¡i lÃ½.
     */
    public double getDropshipCommissionRate(Long agencyId, Long categoryId) {
        if (categoryId != null) {
            var config = commissionConfigRepository
                    .findFirstByAgencyIdAndCategoryIdAndActiveTrueOrderByCreatedAtDesc(agencyId, categoryId);
            if (config.isPresent()) {
                return config.get().getDropshipCommissionRate();
            }
        }

        var generalConfig = commissionConfigRepository
                .findFirstByAgencyIdAndCategoryIsNullAndActiveTrueOrderByCreatedAtDesc(agencyId);
        if (generalConfig.isPresent()) {
            return generalConfig.get().getDropshipCommissionRate();
        }

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Äáº¡i lÃ½ khÃ´ng tá»“n táº¡i"));
        return agency.getDefaultCommissionRate() != null ? agency.getDefaultCommissionRate() : 10.0; // Default 10%
    }

    /**
     * Táº¡o Transaction Ä‘á»‘i soÃ¡t sau khi Ä‘Æ¡n hÃ ng hoÃ n thÃ nh.
     */
    @Transactional
    public Transaction createTransaction(Order order) {
        Transaction tx = new Transaction();
        tx.setOrder(order);
        tx.setTotalAmount(order.getTotalAmount());
        tx.setOrderType(order.getOrderType());

        if (order.getAgency() != null) {
            tx.setAgency(order.getAgency());
            Long agencyId = order.getAgency().getId();
            if (agencyId == null) throw new RuntimeException("Agency ID not found");

            if (order.getOrderType() == OrderType.DROPSHIP) {
                // Dropship: Äáº¡i lÃ½ hÆ°á»Ÿng hoa há»“ng
                double rate = getDropshipCommissionRate(agencyId, null);
                double commission = order.getTotalAmount() * (rate / 100.0);
                tx.setAgencyCommission(commission);
                tx.setAgencyNetIncome(commission);
                tx.setPlatformFee(0.0);
            } else {
                // Marketplace: CÃ´ng ty thu phÃ­ sÃ n
                double rate = getPlatformFeeRate(agencyId, null);
                double fee = order.getTotalAmount() * (rate / 100.0);
                tx.setPlatformFee(fee);
                tx.setAgencyCommission(0.0);
                tx.setAgencyNetIncome(order.getTotalAmount() - fee);
            }
        }

        tx.setPaymentStatus(PaymentStatus.PENDING);
        return transactionRepository.save(tx);
    }
}
