package com.anhtin.tmdt.backend.modules.accumulation.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "accumulation_payments")
public class AccumulationPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agency_id", nullable = false)
    private Long agencyId;

    @Column(name = "payment_stage", nullable = false)
    private Integer paymentStage; // 1 hoặc 2

    @Column(name = "accumulated_value", nullable = false)
    private Double accumulatedValue = 0.0;

    @Column(name = "collected_value", nullable = false)
    private Double collectedValue = 0.0;

    @Column(name = "rebate_rate", nullable = false)
    private Double rebateRate = 0.0;

    @Column(name = "amount", nullable = false)
    private Double amount = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt = LocalDateTime.now();

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public AccumulationPayment() {}

    // ===== Getters & Setters =====
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

    public PaymentStatus getStatus() { return status; }
    public void setStatus(PaymentStatus status) { this.status = status; }

    public LocalDateTime getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public enum PaymentStatus {
        PENDING,    // Đã tính, chờ Admin duyệt
        APPROVED,   // Đã duyệt
        PAID,       // Đã chi trả
        REJECTED    // Admin từ chối
    }
}
