package com.anhtin.tmdt.backend.modules.promotion.service;

import com.anhtin.tmdt.backend.modules.promotion.dto.PromotionRequest;
import com.anhtin.tmdt.backend.modules.common.dto.PromotionDTO;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.promotion.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.promotion.entity.Promotion;
import com.anhtin.tmdt.backend.modules.promotion.entity.PromotionStatus;
import com.anhtin.tmdt.backend.modules.promotion.entity.DiscountType;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Transactional
    public PromotionDTO createPromotion(PromotionRequest request) {
        // Kiá»ƒm tra mÃ£ Ä‘Ã£ tá»“n táº¡i chÆ°a
        if (promotionRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("MÃ£ khuyáº¿n mÃ£i Ä‘Ã£ tá»“n táº¡i: " + request.getCode());
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
                    .orElseThrow(() -> new RuntimeException("Äáº¡i lÃ½ khÃ´ng tá»“n táº¡i"));
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

    public List<PromotionDTO> getAgencyPromotions(Long agencyId) {
        return promotionRepository.findByAgencyIdAndStatus(agencyId, PromotionStatus.ACTIVE).stream()
                .map(PromotionDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Validate vÃ  tÃ­nh toÃ¡n giÃ¡ trá»‹ giáº£m giÃ¡ cho 1 Ä‘Æ¡n hÃ ng.
     * @return Sá»‘ tiá»n Ä‘Æ°á»£c giáº£m
     */
    public double validateAndCalculateDiscount(String code, double orderTotal) {
        Promotion promo = promotionRepository.findByCodeAndStatus(code.toUpperCase(), PromotionStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("MÃ£ giáº£m giÃ¡ khÃ´ng há»£p lá»‡ hoáº·c Ä‘Ã£ háº¿t háº¡n"));

        // Kiá»ƒm tra thá»i háº¡n
        LocalDateTime now = LocalDateTime.now();
        if (promo.getStartDate() != null && now.isBefore(promo.getStartDate())) {
            throw new RuntimeException("MÃ£ giáº£m giÃ¡ chÆ°a cÃ³ hiá»‡u lá»±c");
        }
        if (promo.getEndDate() != null && now.isAfter(promo.getEndDate())) {
            throw new RuntimeException("MÃ£ giáº£m giÃ¡ Ä‘Ã£ háº¿t háº¡n");
        }

        // Kiá»ƒm tra giá»›i háº¡n sá»­ dá»¥ng
        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            throw new RuntimeException("MÃ£ giáº£m giÃ¡ Ä‘Ã£ háº¿t lÆ°á»£t sá»­ dá»¥ng");
        }

        // Kiá»ƒm tra giÃ¡ trá»‹ Ä‘Æ¡n tá»‘i thiá»ƒu
        if (orderTotal < promo.getMinOrderValue()) {
            throw new RuntimeException("ÄÆ¡n hÃ ng chÆ°a Ä‘áº¡t giÃ¡ trá»‹ tá»‘i thiá»ƒu " + promo.getMinOrderValue());
        }

        // TÃ­nh giÃ¡ trá»‹ giáº£m
        double discount;
        if (promo.getDiscountType() == DiscountType.PERCENTAGE) {
            discount = orderTotal * (promo.getDiscountValue() / 100.0);
            if (promo.getMaxDiscount() != null) {
                discount = Math.min(discount, promo.getMaxDiscount());
            }
        } else {
            discount = promo.getDiscountValue();
        }

        return Math.min(discount, orderTotal); // KhÃ´ng giáº£m quÃ¡ tá»•ng Ä‘Æ¡n
    }

    /**
     * TÄƒng sá»‘ láº§n sá»­ dá»¥ng khi Ä‘Æ¡n hÃ ng chá»‘t thÃ nh cÃ´ng.
     */
    @Transactional
    public void incrementUsage(String code) {
        Promotion promo = promotionRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("MÃ£ giáº£m giÃ¡ khÃ´ng tá»“n táº¡i"));
        promo.setUsedCount(promo.getUsedCount() + 1);

        // Auto disable náº¿u Ä‘Ã£ háº¿t lÆ°á»£t
        if (promo.getUsageLimit() != null && promo.getUsedCount() >= promo.getUsageLimit()) {
            promo.setStatus(PromotionStatus.DISABLED);
        }
        promotionRepository.save(promo);
    }

    @Transactional
    public void disablePromotion(Long id) {
        Promotion promo = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MÃ£ giáº£m giÃ¡ khÃ´ng tá»“n táº¡i"));
        promo.setStatus(PromotionStatus.DISABLED);
        promotionRepository.save(promo);
    }
}
