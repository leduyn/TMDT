package com.anhtin.tmdt.backend.modules.accumulation.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AccumulationProgramRequest {
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String rebateCalculationType; // HIGHEST_THRESHOLD | TIERED_PROGRESSIVE
    private boolean active = true;
    private List<TierRequest> tiers;
    private List<Long> agencyIds;

    public static class TierRequest {
        private Integer tierIndex;
        private Double thresholdValue;
        private Double rebateRate;

        public Integer getTierIndex() { return tierIndex; }
        public void setTierIndex(Integer tierIndex) { this.tierIndex = tierIndex; }
        public Double getThresholdValue() { return thresholdValue; }
        public void setThresholdValue(Double thresholdValue) { this.thresholdValue = thresholdValue; }
        public Double getRebateRate() { return rebateRate; }
        public void setRebateRate(Double rebateRate) { this.rebateRate = rebateRate; }
    }

    // --- Getters & Setters ---
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public String getRebateCalculationType() { return rebateCalculationType; }
    public void setRebateCalculationType(String rebateCalculationType) { this.rebateCalculationType = rebateCalculationType; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public List<TierRequest> getTiers() { return tiers; }
    public void setTiers(List<TierRequest> tiers) { this.tiers = tiers; }
    public List<Long> getAgencyIds() { return agencyIds; }
    public void setAgencyIds(List<Long> agencyIds) { this.agencyIds = agencyIds; }
}
