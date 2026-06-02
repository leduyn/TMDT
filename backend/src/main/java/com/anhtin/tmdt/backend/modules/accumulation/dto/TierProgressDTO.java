package com.anhtin.tmdt.backend.modules.accumulation.dto;

public class TierProgressDTO {
    private Integer tierIndex;
    private Double thresholdValue;
    private Double previousThreshold;
    private Double rebateRate;
    private Double valueInTier;
    private Double commissionFromTier;
    private Double progress;
    private Boolean isReached;
    private Boolean isCurrentTier;

    public TierProgressDTO() {}

    public Integer getTierIndex() { return tierIndex; }
    public void setTierIndex(Integer tierIndex) { this.tierIndex = tierIndex; }
    public Double getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(Double thresholdValue) { this.thresholdValue = thresholdValue; }
    public Double getPreviousThreshold() { return previousThreshold; }
    public void setPreviousThreshold(Double previousThreshold) { this.previousThreshold = previousThreshold; }
    public Double getRebateRate() { return rebateRate; }
    public void setRebateRate(Double rebateRate) { this.rebateRate = rebateRate; }
    public Double getValueInTier() { return valueInTier; }
    public void setValueInTier(Double valueInTier) { this.valueInTier = valueInTier; }
    public Double getCommissionFromTier() { return commissionFromTier; }
    public void setCommissionFromTier(Double commissionFromTier) { this.commissionFromTier = commissionFromTier; }
    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }
    public Boolean getIsReached() { return isReached; }
    public void setIsReached(Boolean isReached) { this.isReached = isReached; }
    public Boolean getIsCurrentTier() { return isCurrentTier; }
    public void setIsCurrentTier(Boolean isCurrentTier) { this.isCurrentTier = isCurrentTier; }
}
