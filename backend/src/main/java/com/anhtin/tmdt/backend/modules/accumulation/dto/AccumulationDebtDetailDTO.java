package com.anhtin.tmdt.backend.modules.accumulation.dto;

import java.time.LocalDateTime;

/**
 * DTO chi tiết đơn hàng công nợ tích lũy trong 1 chương trình.
 */
public class AccumulationDebtDetailDTO {
    private Long debtId;
    private String debtCode;
    private Long orderId;
    private Long agencyId;
    private String agencyName;
    private String customerName;
    private String debtType;
    private Double value;
    private Double paidValue;
    private Double remainingToCollect;
    private Integer debtTermDays;
    private LocalDateTime recordingDate;
    private LocalDateTime dueDate;
    private LocalDateTime paymentDate;

    public AccumulationDebtDetailDTO() {}

    public AccumulationDebtDetailDTO(Long debtId, String debtCode, Long orderId, Long agencyId,
                                     String agencyName, String customerName, String debtType,
                                     Double value, Double paidValue, Double remainingToCollect,
                                     Integer debtTermDays, LocalDateTime recordingDate,
                                     LocalDateTime dueDate, LocalDateTime paymentDate) {
        this.debtId = debtId;
        this.debtCode = debtCode;
        this.orderId = orderId;
        this.agencyId = agencyId;
        this.agencyName = agencyName;
        this.customerName = customerName;
        this.debtType = debtType;
        this.value = value;
        this.paidValue = paidValue;
        this.remainingToCollect = remainingToCollect;
        this.debtTermDays = debtTermDays;
        this.recordingDate = recordingDate;
        this.dueDate = dueDate;
        this.paymentDate = paymentDate;
    }

    public Long getDebtId() { return debtId; }
    public void setDebtId(Long debtId) { this.debtId = debtId; }
    public String getDebtCode() { return debtCode; }
    public void setDebtCode(String debtCode) { this.debtCode = debtCode; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public String getDebtType() { return debtType; }
    public void setDebtType(String debtType) { this.debtType = debtType; }
    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }
    public Double getPaidValue() { return paidValue; }
    public void setPaidValue(Double paidValue) { this.paidValue = paidValue; }
    public Double getRemainingToCollect() { return remainingToCollect; }
    public void setRemainingToCollect(Double remainingToCollect) { this.remainingToCollect = remainingToCollect; }
    public Integer getDebtTermDays() { return debtTermDays; }
    public void setDebtTermDays(Integer debtTermDays) { this.debtTermDays = debtTermDays; }
    public LocalDateTime getRecordingDate() { return recordingDate; }
    public void setRecordingDate(LocalDateTime recordingDate) { this.recordingDate = recordingDate; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDateTime paymentDate) { this.paymentDate = paymentDate; }
}
