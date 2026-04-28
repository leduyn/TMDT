package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.entity.*;
import com.anhtin.tmdt.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Engine tính toán chiết khấu/phí linh hoạt.
 * Hỗ trợ cấu hình riêng cho từng Đại lý (theo category hoặc chung).
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
     * Lấy tỷ lệ phí sàn (Marketplace) cho một Đại lý.
     * Ưu tiên: cấu hình theo category > cấu hình chung > default của Agency.
     */
    public double getPlatformFeeRate(@NonNull Long agencyId, Long categoryId) {
        // 1. Tìm cấu hình theo Agency + Category
        if (categoryId != null) {
            var config = commissionConfigRepository
                    .findFirstByAgencyIdAndCategoryIdAndActiveTrueOrderByCreatedAtDesc(agencyId, categoryId);
            if (config.isPresent()) {
                return config.get().getPlatformFeeRate();
            }
        }

        // 2. Fallback: cấu hình chung của Agency
        var generalConfig = commissionConfigRepository
                .findFirstByAgencyIdAndCategoryIsNullAndActiveTrueOrderByCreatedAtDesc(agencyId);
        if (generalConfig.isPresent()) {
            return generalConfig.get().getPlatformFeeRate();
        }

        // 3. Fallback cuối: default từ entity Agency
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Đại lý không tồn tại"));
        return agency.getDefaultCommissionRate() != null ? agency.getDefaultCommissionRate() : 5.0; // Default 5%
    }

    /**
     * Lấy tỷ lệ chiết khấu Dropship cho một Đại lý.
     */
    public double getDropshipCommissionRate(@NonNull Long agencyId, Long categoryId) {
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
                .orElseThrow(() -> new RuntimeException("Đại lý không tồn tại"));
        return agency.getDefaultCommissionRate() != null ? agency.getDefaultCommissionRate() : 10.0; // Default 10%
    }

    /**
     * Tạo Transaction đối soát sau khi đơn hàng hoàn thành.
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
                // Dropship: Đại lý hưởng hoa hồng
                double rate = getDropshipCommissionRate(agencyId, null);
                double commission = order.getTotalAmount() * (rate / 100.0);
                tx.setAgencyCommission(commission);
                tx.setAgencyNetIncome(commission);
                tx.setPlatformFee(0.0);
            } else {
                // Marketplace: Công ty thu phí sàn
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
