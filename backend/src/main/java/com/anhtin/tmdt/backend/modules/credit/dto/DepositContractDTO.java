package com.anhtin.tmdt.backend.modules.credit.dto;

import com.anhtin.tmdt.backend.modules.credit.entity.DepositContract;
import java.time.LocalDateTime;

public class DepositContractDTO {
    private Long id;
    private String contractNumber;
    private Long agencyId;
    private Double depositAmount;
    private LocalDateTime contractDate;
    private String terms;
    private String status;
    private String signedBy;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DepositContractDTO() {}

    public DepositContractDTO(DepositContract contract) {
        this.id = contract.getId();
        this.contractNumber = contract.getContractNumber();
        this.agencyId = contract.getAgencyId();
        this.depositAmount = contract.getDepositAmount();
        this.contractDate = contract.getContractDate();
        this.terms = contract.getTerms();
        this.status = contract.getStatus().name();
        this.signedBy = contract.getSignedBy();
        this.notes = contract.getNotes();
        this.createdAt = contract.getCreatedAt();
        this.updatedAt = contract.getUpdatedAt();
    }

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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSignedBy() { return signedBy; }
    public void setSignedBy(String signedBy) { this.signedBy = signedBy; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
