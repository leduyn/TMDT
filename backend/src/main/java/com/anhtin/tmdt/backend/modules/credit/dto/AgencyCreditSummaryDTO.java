package com.anhtin.tmdt.backend.modules.credit.dto;

import com.anhtin.tmdt.backend.modules.credit.entity.AgentCredit;

import java.time.LocalDateTime;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

/**
 * Summary of one agency's credit terms — used in the credit management list page.
 */
public class AgencyCreditSummaryDTO {
    private Long   agencyId;
    private String agencyName;
    private String agencyPhone;
    private String agencyAddress;

    private double  creditLimit;
    private double  totalDebt;
    private double  guaranteeDebt;
    private double  vtcAvailable;
    private double  vtcHold;
    private double  hmkd;            
    private int     debtTermDays;    
    private int     activeOverdueCount;

    private LocalDateTime updatedAt;
    private boolean creditInitialized;  

    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    public String getAgencyPhone() { return agencyPhone; }
    public void setAgencyPhone(String agencyPhone) { this.agencyPhone = agencyPhone; }
    public String getAgencyAddress() { return agencyAddress; }
    public void setAgencyAddress(String agencyAddress) { this.agencyAddress = agencyAddress; }
    public double getCreditLimit() { return creditLimit; }
    public void setCreditLimit(double creditLimit) { this.creditLimit = creditLimit; }
    public double getTotalDebt() { return totalDebt; }
    public void setTotalDebt(double totalDebt) { this.totalDebt = totalDebt; }
    public double getGuaranteeDebt() { return guaranteeDebt; }
    public void setGuaranteeDebt(double guaranteeDebt) { this.guaranteeDebt = guaranteeDebt; }
    public double getVtcAvailable() { return vtcAvailable; }
    public void setVtcAvailable(double vtcAvailable) { this.vtcAvailable = vtcAvailable; }
    public double getVtcHold() { return vtcHold; }
    public void setVtcHold(double vtcHold) { this.vtcHold = vtcHold; }
    public double getHmkd() { return hmkd; }
    public void setHmkd(double hmkd) { this.hmkd = hmkd; }
    public int getDebtTermDays() { return debtTermDays; }
    public void setDebtTermDays(int debtTermDays) { this.debtTermDays = debtTermDays; }
    public int getActiveOverdueCount() { return activeOverdueCount; }
    public void setActiveOverdueCount(int activeOverdueCount) { this.activeOverdueCount = activeOverdueCount; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public boolean isCreditInitialized() { return creditInitialized; }
    public void setCreditInitialized(boolean creditInitialized) { this.creditInitialized = creditInitialized; }

    // ── Static factories ────────────────────────────────────────────────────

    /** Khi đã có AgentCredit */
    public static AgencyCreditSummaryDTO from(AgentCredit ac, int overdueCount) {
        AgencyCreditSummaryDTO d = new AgencyCreditSummaryDTO();
        d.setAgencyId(ac.getAgency().getId());
        d.setAgencyName(ac.getAgency().getName());
        d.setAgencyPhone(ac.getAgency().getPhone());
        d.setAgencyAddress(ac.getAgency().getBillingAddress() != null ? ac.getAgency().getBillingAddress() : "");
        d.setCreditLimit(ac.getCreditLimit());
        d.setTotalDebt(ac.getTotalDebt());
        d.setGuaranteeDebt(ac.getGuaranteeDebt());
        d.setVtcAvailable(ac.getVtcAvailable());
        d.setVtcHold(ac.getVtcHold());
        d.setHmkd(ac.getCreditLimit() - (ac.getTotalDebt() + ac.getGuaranteeDebt()) + ac.getVtcAvailable());
        d.setDebtTermDays(ac.getDebtTermDays() != null ? ac.getDebtTermDays() : 30);
        d.setActiveOverdueCount(overdueCount);
        d.setUpdatedAt(ac.getUpdatedAt());
        d.setCreditInitialized(true);
        return d;
    }

    /** Khi chưa khởi tạo AgentCredit (đại lý chưa có tài khoản tín dụng) */
    public static AgencyCreditSummaryDTO uninitialized(Long agencyId, String name,
                                                       String phone, String address) {
        AgencyCreditSummaryDTO d = new AgencyCreditSummaryDTO();
        d.setAgencyId(agencyId);
        d.setAgencyName(name);
        d.setAgencyPhone(phone);
        d.setAgencyAddress(address);
        d.setCreditInitialized(false);
        d.setDebtTermDays(30);
        return d;
    }
}
