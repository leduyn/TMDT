package com.anhtin.tmdt.backend.credit.dto;

import com.anhtin.tmdt.backend.credit.entity.AgentCredit;
import com.anhtin.tmdt.backend.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.credit.entity.OverdueDebt;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreditDetailResponse {

    private Long agencyId;
    private double creditLimit;
    private double totalDebt;
    private double vtcAvailable;
    private double vtcHold;
    private double hmkd;           // Hạn mức khả dụng = creditLimit - totalDebt + vtcAvailable
    private LocalDateTime updatedAt;

    private List<OverdueDebtInfo> overdueDebts;
    private List<LedgerEntry>     ledgerHistory;

    @Data
    public static class OverdueDebtInfo {
        private Long   id;
        private Long   orderId;
        private double principalAmount;
        private double interestAccrued;
        private String status;
        private LocalDateTime startDate;
        private LocalDateTime lastCalculatedAt;

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

    @Data
    public static class LedgerEntry {
        private Long   id;
        private String type;
        private double amount;
        private String referenceId;
        private LocalDateTime createdAt;

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
        r.setVtcAvailable(credit.getVtcAvailable());
        r.setVtcHold(credit.getVtcHold());
        r.setHmkd(credit.getCreditLimit() - credit.getTotalDebt() + credit.getVtcAvailable());
        r.setUpdatedAt(credit.getUpdatedAt());
        r.setOverdueDebts(debts.stream().map(OverdueDebtInfo::from).toList());
        r.setLedgerHistory(ledger.stream().map(LedgerEntry::from).toList());
        return r;
    }
}
