package com.anhtin.tmdt.backend.modules.credit.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "deposit_contracts")
public class DepositContract {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_number", unique = true, nullable = false)
    private String contractNumber;

    @Column(name = "agency_id", nullable = false)
    private Long agencyId;

    @Column(name = "deposit_amount", nullable = false)
    private Double depositAmount;

    @Column(name = "contract_date", nullable = false)
    private LocalDateTime contractDate;

    @Column(columnDefinition = "TEXT")
    private String terms;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DepositContractStatus status = DepositContractStatus.ACTIVE;

    @Column(name = "signed_by")
    private String signedBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "paid_amount", nullable = false)
    private Double paidAmount = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public DepositContract() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContractNumber() { return contractNumber; }
    public void setContractNumber(String contractNumber) { this.contractNumber = contractNumber; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public Double getDepositAmount() { return depositAmount; }
    public void setDepositAmount(Double depositAmount) { this.depositAmount = depositAmount; }
    public LocalDateTime getContractDate() { return contractDate; }
    public void setContractDate(LocalDateTime contractDate) { this.contractDate = contractDate; }
    public String getTerms() { return terms; }
    public void setTerms(String terms) { this.terms = terms; }
    public DepositContractStatus getStatus() { return status; }
    public void setStatus(DepositContractStatus status) { this.status = status; }
    public String getSignedBy() { return signedBy; }
    public void setSignedBy(String signedBy) { this.signedBy = signedBy; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Double getPaidAmount() { return paidAmount; }
    public void setPaidAmount(Double paidAmount) { this.paidAmount = paidAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum DepositContractStatus {
        ACTIVE, EXPIRED, CANCELLED
    }
}
