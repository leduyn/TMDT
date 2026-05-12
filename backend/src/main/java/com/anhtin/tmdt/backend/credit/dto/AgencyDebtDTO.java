package com.anhtin.tmdt.backend.credit.dto;

import com.anhtin.tmdt.backend.credit.entity.AgencyDebt;

import java.time.LocalDateTime;

public class AgencyDebtDTO {
    private Long id;
    private Long agencyId;
    private Long orderId;
    private String agencyCode;
    private String agencyName;
    private String customerCode;
    private String customerName;
    private String customerLevel;
    private String debtCode;
    private String debtType;
    private String jobCategory;
    private Integer debtTermDays;
    private Double value;
    private Double paidValue;
    private LocalDateTime paymentDate;
    private LocalDateTime recordingDate;
    private LocalDateTime dueDate;
    private Double remainingToCollect;
    private Integer aCoin;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getAgencyCode() { return agencyCode; }
    public void setAgencyCode(String agencyCode) { this.agencyCode = agencyCode; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    public String getCustomerCode() { return customerCode; }
    public void setCustomerCode(String customerCode) { this.customerCode = customerCode; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getCustomerLevel() { return customerLevel; }
    public void setCustomerLevel(String customerLevel) { this.customerLevel = customerLevel; }
    public String getDebtCode() { return debtCode; }
    public void setDebtCode(String debtCode) { this.debtCode = debtCode; }
    public String getDebtType() { return debtType; }
    public void setDebtType(String debtType) { this.debtType = debtType; }
    public String getJobCategory() { return jobCategory; }
    public void setJobCategory(String jobCategory) { this.jobCategory = jobCategory; }
    public Integer getDebtTermDays() { return debtTermDays; }
    public void setDebtTermDays(Integer debtTermDays) { this.debtTermDays = debtTermDays; }
    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
    public Double getPaidValue() { return paidValue; }
    public void setPaidValue(Double paidValue) { this.paidValue = paidValue; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
    public LocalDateTime getRecordingDate() { return recordingDate; }
    public void setRecordingDate(LocalDateTime recordingDate) { this.recordingDate = recordingDate; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public Double getRemainingToCollect() { return remainingToCollect; }
    public void setRemainingToCollect(Double remainingToCollect) { this.remainingToCollect = remainingToCollect; }
    public Integer getaCoin() { return aCoin; }
    public void setaCoin(Integer aCoin) { this.aCoin = aCoin; }

    public static AgencyDebtDTO fromEntity(AgencyDebt entity) {
        AgencyDebtDTO dto = new AgencyDebtDTO();
        dto.setId(entity.getId());
        dto.setAgencyId(entity.getAgency() != null ? entity.getAgency().getId() : null);
        dto.setOrderId(entity.getOrder() != null ? entity.getOrder().getId() : null);
        dto.setAgencyCode(entity.getAgencyCode());
        dto.setAgencyName(entity.getAgencyName());
        dto.setCustomerCode(entity.getCustomerCode());
        dto.setCustomerName(entity.getCustomerName());
        dto.setCustomerLevel(entity.getCustomerLevel());
        dto.setDebtCode(entity.getDebtCode());
        dto.setDebtType(entity.getDebtType() != null ? entity.getDebtType().name() : null);
        dto.setJobCategory(entity.getJobCategory());
        dto.setDebtTermDays(entity.getDebtTermDays());
        dto.setValue(entity.getValue());
        dto.setPaidValue(entity.getPaidValue());
        dto.setPaymentDate(entity.getPaymentDate());
        dto.setRecordingDate(entity.getRecordingDate());
        dto.setDueDate(entity.getDueDate());
        dto.setRemainingToCollect(entity.getRemainingToCollect());
        dto.setaCoin(entity.getaCoin());
        return dto;
    }
}
