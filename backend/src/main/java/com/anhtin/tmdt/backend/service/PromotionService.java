package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.PromotionRequest;
import com.anhtin.tmdt.backend.dto.response.PromotionDTO;
import com.anhtin.tmdt.backend.entity.*;
import com.anhtin.tmdt.backend.repository.AgencyRepository;
import com.anhtin.tmdt.backend.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Transactional
    public PromotionDTO createPromotion(PromotionRequest request) {
        // Kiểm tra mã đã tồn tại chưa
        if (promotionRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Mã khuyến mãi đã tồn tại: " + request.getCode());
        }

        Promotion promotion = new Promotion();
        promotion.setCode(request.getCode().toUpperCase());
        promotion.setDescription(request.getDescription());
        promotion.setDiscountType(DiscountType.valueOf(request.getDiscountType()));
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setMinOrderValue(request.getMinOrderValue() != null ? request.getMinOrderValue() : 0.0);
        promotion.setMaxDiscount(request.getMaxDiscount());
        promotion.setUsageLimit(request.getUsageLimit());
        promotion.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDateTime.now());
        promotion.setEndDate(request.getEndDate());

        Long agencyId = request.getAgencyId();
        if (agencyId != null) {
            Agency agency = agencyRepository.findById(agencyId)
                    .orElseThrow(() -> new RuntimeException("Đại lý không tồn tại"));
            promotion.setAgency(agency);
        }

        return new PromotionDTO(promotionRepository.save(promotion));
    }

    public List<PromotionDTO> getActivePromotions() {
        return promotionRepository.findByStatus(PromotionStatus.ACTIVE).stream()
                .map(PromotionDTO::new)
                .collect(Collectors.toList());
    }

    public List<PromotionDTO> getPlatformPromotions() {
        return promotionRepository.findByAgencyIsNullAndStatus(PromotionStatus.ACTIVE).stream()
                .map(PromotionDTO::new)
                .collect(Collectors.toList());
    }

    public List<PromotionDTO> getAgencyPromotions(@NonNull Long agencyId) {
        return promotionRepository.findByAgencyIdAndStatus(agencyId, PromotionStatus.ACTIVE).stream()
                .map(PromotionDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Validate và tính toán giá trị giảm giá cho 1 đơn hàng.
     * @return Số tiền được giảm
     */
    public double validateAndCalculateDiscount(String code, double orderTotal) {
        Promotion promo = promotionRepository.findByCodeAndStatus(code.toUpperCase(), PromotionStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ hoặc đã hết hạn"));

        // Kiểm tra thời hạn
        LocalDateTime now = LocalDateTime.now();
        if (promo.getStartDate() != null && now.isBefore(promo.getStartDate())) {
            throw new RuntimeException("Mã giảm giá chưa có hiệu lực");
        }
        if (promo.getEndDate() != null && now.isAfter(promo.getEndDate())) {
            throw new RuntimeException("Mã giảm giá đã hết hạn");
        }

        // Kiểm tra giới hạn sử dụng
        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw new RuntimeException("Mã giảm giá đã hết lượt sử dụng");
        }

        // Kiểm tra giá trị đơn tối thiểu
        if (orderTotal < promo.getMinOrderValue()) {
            throw new RuntimeException("Đơn hàng chưa đạt giá trị tối thiểu " + promo.getMinOrderValue());
        }

        // Tính giá trị giảm
        double discount;
        if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderTotal * (promo.getDiscountValue() / 100.0);
            if (promo.getMaxDiscount() != null) {
                discount = Math.min(discount, promo.getMaxDiscount());
            }
        } else {
            discount = promo.getDiscountValue();
        }

        return Math.min(discount, orderTotal); // Không giảm quá tổng đơn
    }

    /**
     * Tăng số lần sử dụng khi đơn hàng chốt thành công.
     */
    @Transactional
    public void incrementUsage(String code) {
        Promotion promo = promotionRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));
        promo.setUsedCount(promo.getUsedCount() + 1);

        // Auto disable nếu đã hết lượt
        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            promo.setStatus(PromotionStatus.DISABLED);
        }
        promotionRepository.save(promo);
    }

    @Transactional
    public void disablePromotion(@NonNull Long id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không tồn tại"));
        promo.setStatus(PromotionStatus.DISABLED);
        promotionRepository.save(promo);
    }
}
