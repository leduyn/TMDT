package com.anhtin.tmdt.backend.modules.credit.entity;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "agency_debts")
@NoArgsConstructor
@AllArgsConstructor
public class AgencyDebt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = true)
    private Order order;

    // Thông tin đại lý
    @Column(name = "agency_code")
    private String agencyCode;
    
    @Column(name = "agency_name")
    private String agencyName;

    // Thông tin khách hàng
    @Column(name = "customer_code")
    private String customerCode;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "customer_level")
    private String customerLevel;

    @Column(name = "debt_code", unique = true, nullable = false)
    private String debtCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "debt_type", nullable = false)
    private DebtType debtType;

    @Column(name = "job_category")
    private String jobCategory;

    @Column(name = "debt_term_days", nullable = false)
    private Integer debtTermDays;

    @Column(name = "value", nullable = false)
    private Double value = 0.0;

    @Column(name = "paid_value", nullable = false)
    private Double paidValue = 0.0;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @Column(name = "recording_date", nullable = false)
    private LocalDateTime recordingDate;

    @Column(name = "due_date", nullable = false)
    private LocalDateTime dueDate;

    @Column(name = "remaining_to_collect")
    private Double remainingToCollect = 0.0;

    @Column(name = "a_coin")
    private Integer aCoin = 0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
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
    public DebtType getDebtType() { return debtType; }
    public void setDebtType(DebtType debtType) { this.debtType = debtType; }
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

    @PrePersist
    @PreUpdate
    public void updateRemaining() {
        if (value != null) {
            double pv = paidValue != null ? paidValue : 0.0;
            remainingToCollect = value - pv;
        }
    }

    public enum DebtType {
        ORDER_VALUE,
        DELIVERY_FEE,
        INCREASE,
        DECREASE,
        PAYMENT,
        DEPOSIT,
        REFUND,
        HOLD,
        INTEREST
    }
}
