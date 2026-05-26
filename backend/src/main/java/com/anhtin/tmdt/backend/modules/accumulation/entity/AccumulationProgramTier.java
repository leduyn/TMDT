package com.anhtin.tmdt.backend.modules.accumulation.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "accumulation_program_tiers")
public class AccumulationProgramTier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tier_index", nullable = false)
    private Integer tierIndex = 0;

    @Column(name = "threshold_value", nullable = false)
    private Double thresholdValue;

    @Column(name = "rebate_rate", nullable = false)
    private Double rebateRate;

    public AccumulationProgramTier() {}

    public AccumulationProgramTier(Integer tierIndex, Double thresholdValue, Double rebateRate) {
        this.tierIndex = tierIndex;
        this.thresholdValue = thresholdValue;
        this.rebateRate = rebateRate;
    }

    // ===== Getters & Setters =====
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getTierIndex() { return tierIndex; }
    public void setTierIndex(Integer tierIndex) { this.tierIndex = tierIndex; }

    public Double getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(Double thresholdValue) { this.thresholdValue = thresholdValue; }

    public Double getRebateRate() { return rebateRate; }
    public void setRebateRate(Double rebateRate) { this.rebateRate = rebateRate; }
}
