package com.anhtin.tmdt.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class PromotionRequest {
    @NotBlank
    private String code;

    private String description;

    @NotBlank
    private String discountType; // "PERCENTAGE" hoặc "FIXED_AMOUNT"

    @NotNull
    private Double discountValue;

    private Double minOrderValue;
    private Double maxDiscount;
    private Integer usageLimit;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private Long agencyId; // null = voucher toàn sàn
}
