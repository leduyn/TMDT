package com.anhtin.tmdt.backend.modules.accumulation.dto;

import com.anhtin.tmdt.backend.modules.accumulation.entity.AccumulationPayment;
import com.anhtin.tmdt.backend.modules.accumulation.entity.AccumulationProgram;
import com.anhtin.tmdt.backend.modules.accumulation.entity.AccumulationProgramTier;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class AccumulationProgramDTO {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String rebateCalculationType;
    private String status;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TierDTO> tiers;
    private List<AgencyDTO> agencies;
    private List<PaymentDTO> payments;

    // --- Inner DTOs ---
    public static class TierDTO {
        private Long id;
        private Integer tierIndex;
        private Double thresholdValue;
        private Double rebateRate;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Integer getTierIndex() { return tierIndex; }
        public void setTierIndex(Integer tierIndex) { this.tierIndex = tierIndex; }
        public Double getThresholdValue() { return thresholdValue; }
        public void setThresholdValue(Double thresholdValue) { this.thresholdValue = thresholdValue; }
        public Double getRebateRate() { return rebateRate; }
        public void setRebateRate(Double rebateRate) { this.rebateRate = rebateRate; }

        public static TierDTO fromEntity(AccumulationProgramTier tier) {
            TierDTO dto = new TierDTO();
            dto.setId(tier.getId());
            dto.setTierIndex(tier.getTierIndex());
            dto.setThresholdValue(tier.getThresholdValue());
            dto.setRebateRate(tier.getRebateRate());
            return dto;
        }
    }

    public static class AgencyDTO {
        private Long id;
        private String name;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public static AgencyDTO fromEntity(Agency agency) {
            AgencyDTO dto = new AgencyDTO();
            dto.setId(agency.getId());
            dto.setName(agency.getName());
            return dto;
        }
    }

    public static class PaymentDTO {
        private Long id;
        private Long agencyId;
        private Integer paymentStage;
        private Double accumulatedValue;
        private Double collectedValue;
        private Double rebateRate;
        private Double amount;
        private String status;
        private LocalDateTime calculatedAt;
        private LocalDateTime approvedAt;
        private String approvedBy;
        private String notes;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getAgencyId() { return agencyId; }
        public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
        public Integer getPaymentStage() { return paymentStage; }
        public void setPaymentStage(Integer paymentStage) { this.paymentStage = paymentStage; }
        public Double getAccumulatedValue() { return accumulatedValue; }
        public void setAccumulatedValue(Double accumulatedValue) { this.accumulatedValue = accumulatedValue; }
        public Double getCollectedValue() { return collectedValue; }
        public void setCollectedValue(Double collectedValue) { this.collectedValue = collectedValue; }
        public Double getRebateRate() { return rebateRate; }
        public void setRebateRate(Double rebateRate) { this.rebateRate = rebateRate; }
        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getCalculatedAt() { return calculatedAt; }
        public void setCalculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; }
        public LocalDateTime getApprovedAt() { return approvedAt; }
        public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
        public String getApprovedBy() { return approvedBy; }
        public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public static PaymentDTO fromEntity(AccumulationPayment payment) {
            PaymentDTO dto = new PaymentDTO();
            dto.setId(payment.getId());
            dto.setAgencyId(payment.getAgencyId());
            dto.setPaymentStage(payment.getPaymentStage());
            dto.setAccumulatedValue(payment.getAccumulatedValue());
            dto.setCollectedValue(payment.getCollectedValue());
            dto.setRebateRate(payment.getRebateRate());
            dto.setAmount(payment.getAmount());
            dto.setStatus(payment.getStatus().name());
            dto.setCalculatedAt(payment.getCalculatedAt());
            dto.setApprovedAt(payment.getApprovedAt());
            dto.setApprovedBy(payment.getApprovedBy());
            dto.setNotes(payment.getNotes());
            return dto;
        }
    }

    // --- Factory method ---
    public static AccumulationProgramDTO fromEntity(AccumulationProgram program) {
        AccumulationProgramDTO dto = new AccumulationProgramDTO();
        dto.setId(program.getId());
        dto.setName(program.getName());
        dto.setDescription(program.getDescription());
        dto.setStartDate(program.getStartDate());
        dto.setEndDate(program.getEndDate());
        dto.setRebateCalculationType(program.getRebateCalculationType().name());
        dto.setStatus(program.getStatus().name());
        dto.setActive(program.isActive());
        dto.setCreatedAt(program.getCreatedAt());
        dto.setUpdatedAt(program.getUpdatedAt());

        dto.setTiers(program.getTiers().stream()
                .map(TierDTO::fromEntity)
                .collect(Collectors.toList()));

        dto.setAgencies(program.getAgencies().stream()
                .map(AgencyDTO::fromEntity)
                .collect(Collectors.toList()));

        dto.setPayments(program.getPayments().stream()
                .map(PaymentDTO::fromEntity)
                .collect(Collectors.toList()));

        return dto;
    }

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<TierDTO> getTiers() { return tiers; }
    public void setTiers(List<TierDTO> tiers) { this.tiers = tiers; }
    public List<AgencyDTO> getAgencies() { return agencies; }
    public void setAgencies(List<AgencyDTO> agencies) { this.agencies = agencies; }
    public List<PaymentDTO> getPayments() { return payments; }
    public void setPayments(List<PaymentDTO> payments) { this.payments = payments; }
}
