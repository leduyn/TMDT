package com.anhtin.tmdt.backend.credit.dto;

import com.anhtin.tmdt.backend.credit.entity.AgentCredit;
import com.anhtin.tmdt.backend.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.credit.entity.OverdueDebt;
import java.time.LocalDateTime;
import java.util.List;

public class CreditDetailResponse {

    private Long agencyId;
    private double creditLimit;
    private double totalDebt;
    private double guaranteeDebt;
    private double vtcAvailable;
    private double vtcHold;
    private double hmkd;           // Hạn mức khả dụng = creditLimit - (totalDebt + guaranteeDebt) + vtcAvailable
    private LocalDateTime updatedAt;

    private List<OverdueDebtInfo> overdueDebts;
    private List<LedgerEntry>     ledgerHistory;

    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
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
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<OverdueDebtInfo> getOverdueDebts() { return overdueDebts; }
    public void setOverdueDebts(List<OverdueDebtInfo> overdueDebts) { this.overdueDebts = overdueDebts; }
    public List<LedgerEntry> getLedgerHistory() { return ledgerHistory; }
    public void setLedgerHistory(List<LedgerEntry> ledgerHistory) { this.ledgerHistory = ledgerHistory; }

    public static class OverdueDebtInfo {
        private Long   id;
        private Long   orderId;
        private double principalAmount;
        private double interestAccrued;
        private String status;
        private LocalDateTime startDate;
        private LocalDateTime lastCalculatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public double getPrincipalAmount() { return principalAmount; }
        public void setPrincipalAmount(double principalAmount) { this.principalAmount = principalAmount; }
        public double getInterestAccrued() { return interestAccrued; }
        public void setInterestAccrued(double interestAccrued) { this.interestAccrued = interestAccrued; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
        public LocalDateTime getLastCalculatedAt() { return lastCalculatedAt; }
        public void setLastCalculatedAt(LocalDateTime lastCalculatedAt) { this.lastCalculatedAt = lastCalculatedAt; }

        public static OverdueDebtInfo from(OverdueDebt d) {
            OverdueDebtInfo info = new OverdueDebtInfo();
            info.setId(d.getId());
            info.setOrderId(d.getOrder().getId());
            info.setPrincipalAmount(d.getPrincipalAmount());
            info.setInterestAccrued(d.getInterestAccrued());
            info.setStatus(d.getStatus().name());
            info.setStartDate(d.getStartDate());
            info.setLastCalculatedAt(d.getLastCalculatedAt());
            return info;
        }
    }

    public static class LedgerEntry {
        private Long   id;
        private String type;
        private double amount;
        private String referenceId;
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public String getReferenceId() { return referenceId; }
        public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public static LedgerEntry from(CreditLedger l) {
            LedgerEntry e = new LedgerEntry();
            e.setId(l.getId());
            e.setType(l.getType().name());
            e.setAmount(l.getAmount());
            e.setReferenceId(l.getReferenceId());
            e.setCreatedAt(l.getCreatedAt());
            return e;
        }
    }

    public static CreditDetailResponse from(AgentCredit credit,
                                            List<OverdueDebt> debts,
                                            List<CreditLedger> ledger) {
        CreditDetailResponse r = new CreditDetailResponse();
        r.setAgencyId(credit.getAgency().getId());
        r.setCreditLimit(credit.getCreditLimit());
        r.setTotalDebt(credit.getTotalDebt());
        r.setGuaranteeDebt(credit.getGuaranteeDebt());
        r.setVtcAvailable(credit.getVtcAvailable());
        r.setVtcHold(credit.getVtcHold());
        r.setHmkd(credit.getCreditLimit() - (credit.getTotalDebt() + credit.getGuaranteeDebt()) + credit.getVtcAvailable());
        r.setUpdatedAt(credit.getUpdatedAt());
        r.setOverdueDebts(debts.stream().map(OverdueDebtInfo::from).toList());
        r.setLedgerHistory(ledger.stream().map(LedgerEntry::from).toList());
        return r;
    }

    public static CreditDetailResponse empty(Long agencyId) {
        CreditDetailResponse r = new CreditDetailResponse();
        r.setAgencyId(agencyId);
        r.setCreditLimit(0.0);
        r.setTotalDebt(0.0);
        r.setGuaranteeDebt(0.0);
        r.setVtcAvailable(0.0);
        r.setVtcHold(0.0);
        r.setHmkd(0.0);
        r.setOverdueDebts(List.of());
        r.setLedgerHistory(List.of());
        return r;
    }
}
