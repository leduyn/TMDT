package com.anhtin.tmdt.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommissionConfigRequest {
    @NotNull
    private Long agencyId;

    private Long categoryId; // null = cấu hình chung cho Đại lý

    @NotNull
    private Double platformFeeRate;

    @NotNull
    private Double dropshipCommissionRate;
}
