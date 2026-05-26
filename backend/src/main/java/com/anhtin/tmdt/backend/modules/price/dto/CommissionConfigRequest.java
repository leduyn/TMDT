package com.anhtin.tmdt.backend.modules.price.dto;

import jakarta.validation.constraints.NotNull;

public class CommissionConfigRequest {
    @NotNull
    private Long agencyId;

    private Long categoryId;

    @NotNull
    private Double platformFeeRate;

    @NotNull
    private Double dropshipCommissionRate;

    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Double getPlatformFeeRate() { return platformFeeRate; }
    public void setPlatformFeeRate(Double platformFeeRate) { this.platformFeeRate = platformFeeRate; }
    public Double getDropshipCommissionRate() { return dropshipCommissionRate; }
    public void setDropshipCommissionRate(Double dropshipCommissionRate) { this.dropshipCommissionRate = dropshipCommissionRate; }
}
