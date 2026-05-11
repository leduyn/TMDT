package com.anhtin.tmdt.backend.credit.entity;

import com.anhtin.tmdt.backend.entity.Agency;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "agent_credit")
@NoArgsConstructor
@AllArgsConstructor
public class AgentCredit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false, unique = true)
    private Agency agency;

    @Column(name = "credit_limit", nullable = false)
    private Double creditLimit = 0.0;

    @Column(name = "total_debt", nullable = false)
    private Double totalDebt = 0.0;

    @Column(name = "guarantee_debt", nullable = false)
    private Double guaranteeDebt = 0.0;

    @Column(name = "vtc_available", nullable = false)
    private Double vtcAvailable = 0.0;

    @Column(name = "vtc_hold", nullable = false)
    private Double vtcHold = 0.0;

    /** Kỳ hạn nợ (số ngày được phép trả sau khi đơn hàng tạo) */
    @Column(name = "debt_term_days", nullable = false)
    private Integer debtTermDays = 30;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public Double getCreditLimit() { return creditLimit; }
    public void setCreditLimit(Double creditLimit) { this.creditLimit = creditLimit; }
    public Double getTotalDebt() { return totalDebt; }
    public void setTotalDebt(Double totalDebt) { this.totalDebt = totalDebt; }
    public Double getGuaranteeDebt() { return guaranteeDebt; }
    public void setGuaranteeDebt(Double guaranteeDebt) { this.guaranteeDebt = guaranteeDebt; }
    public Double getVtcAvailable() { return vtcAvailable; }
    public void setVtcAvailable(Double vtcAvailable) { this.vtcAvailable = vtcAvailable; }
    public Double getVtcHold() { return vtcHold; }
    public void setVtcHold(Double vtcHold) { this.vtcHold = vtcHold; }
    public Integer getDebtTermDays() { return debtTermDays; }
    public void setDebtTermDays(Integer debtTermDays) { this.debtTermDays = debtTermDays; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
