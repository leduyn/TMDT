package com.anhtin.tmdt.backend.dto.response;

import com.anhtin.tmdt.backend.entity.Promotion;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class PromotionDTO {
    private Long id;
    private String code;
    private String description;
    private String discountType;
    private Double discountValue;
    private Double minOrderValue;
    private Double maxDiscount;
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Long agencyId;
    private String status;

    public PromotionDTO(Promotion p) {
        this.id = p.getId();
        this.code = p.getCode();
        this.description = p.getDescription();
        this.discountType = p.getDiscountType().name();
        this.discountValue = p.getDiscountValue();
        this.minOrderValue = p.getMinOrderValue();
        this.maxDiscount = p.getMaxDiscount();
        this.usageLimit = p.getUsageLimit();
        this.usedCount = p.getUsedCount();
        this.startDate = p.getStartDate();
        this.endDate = p.getEndDate();
        this.agencyId = p.getAgency() != null ? p.getAgency().getId() : null;
        this.status = p.getStatus().name();
    }
}
