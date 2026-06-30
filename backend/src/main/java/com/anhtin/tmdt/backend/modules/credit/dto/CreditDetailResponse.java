package com.anhtin.tmdt.backend.modules.credit.dto;

import com.anhtin.tmdt.backend.modules.credit.entity.AgentCredit;
import com.anhtin.tmdt.backend.modules.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.modules.credit.entity.OverdueDebt;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

public class CreditDetailResponse {

    private Long agencyId;
    private double creditLimit;
    private double totalDebt;
    private double guaranteeDebt;
    private double vtcAvailable;
    private double vtcHold;
    private double hmkd;           // Hạn mức khả dụng = creditLimit - (totalDebt + guaranteeDebt) + vtcAvailable
    private int debtTermDays;
    private LocalDateTime updatedAt;

    private List<OverdueDebtInfo> overdueDebts;
    private List<LedgerEntry>     ledgerHistory;
    private List<CustomerDebtInfo> customerDebts;
    private DepositContractInfo   depositContract;

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
    public int getDebtTermDays() { return debtTermDays; }
    public void setDebtTermDays(int debtTermDays) { this.debtTermDays = debtTermDays; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public List<OverdueDebtInfo> getOverdueDebts() { return overdueDebts; }
    public void setOverdueDebts(List<OverdueDebtInfo> overdueDebts) { this.overdueDebts = overdueDebts; }
    public List<LedgerEntry> getLedgerHistory() { return ledgerHistory; }
    public void setLedgerHistory(List<LedgerEntry> ledgerHistory) { this.ledgerHistory = ledgerHistory; }
    public List<CustomerDebtInfo> getCustomerDebts() { return customerDebts; }
    public void setCustomerDebts(List<CustomerDebtInfo> customerDebts) { this.customerDebts = customerDebts; }
    public DepositContractInfo getDepositContract() { return depositContract; }
    public void setDepositContract(DepositContractInfo depositContract) { this.depositContract = depositContract; }

    public static class DepositContractInfo {
        private Long   id;
        private String contractNumber;
        private double depositAmount;
        private double paidAmount;
        private double remainingAmount;
        private String status;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getContractNumber() { return contractNumber; }
        public void setContractNumber(String contractNumber) { this.contractNumber = contractNumber; }
        public double getDepositAmount() { return depositAmount; }
        public void setDepositAmount(double depositAmount) { this.depositAmount = depositAmount; }
        public double getPaidAmount() { return paidAmount; }
        public void setPaidAmount(double paidAmount) { this.paidAmount = paidAmount; }
        public double getRemainingAmount() { return remainingAmount; }
        public void setRemainingAmount(double remainingAmount) { this.remainingAmount = remainingAmount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public static DepositContractInfo from(com.anhtin.tmdt.backend.modules.credit.entity.DepositContract c) {
            DepositContractInfo info = new DepositContractInfo();
            info.setId(c.getId());
            info.setContractNumber(c.getContractNumber());
            info.setDepositAmount(c.getDepositAmount());
            info.setPaidAmount(c.getPaidAmount());
            info.setRemainingAmount(Math.max(0, c.getDepositAmount() - c.getPaidAmount()));
            info.setStatus(c.getStatus().name());
            return info;
        }
    }

    public static class CustomerDebtInfo {
        private Long   customerId;
        private String customerName;
        private double totalDebt;

        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public double getTotalDebt() { return totalDebt; }
        public void setTotalDebt(double totalDebt) { this.totalDebt = totalDebt; }

        public static CustomerDebtInfo from(com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment a) {
            CustomerDebtInfo info = new CustomerDebtInfo();
            info.setCustomerId(a.getCustomer().getId());
            com.anhtin.tmdt.backend.modules.customer.entity.Customer c = a.getCustomer();
            info.setCustomerName(c.getOrganizationName() != null ? 
                c.getOrganizationName() : "");
            info.setTotalDebt(a.getTotalDebt());
            return info;
        }
    }

    public static class OverdueDebtInfo {
        private Long   id;
        private Long   orderId;
        private Long   customerId;
        private String customerName;
        private double principalAmount;
        private double interestAccrued;
        private String status;
        private LocalDateTime startDate;
        private LocalDateTime lastCalculatedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getOrderId() { return orderId; }
        public void setOrderId(Long orderId) { this.orderId = orderId; }
        public Long getCustomerId() { return customerId; }
        public void setCustomerId(Long customerId) { this.customerId = customerId; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
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
            if (d.getOrder().getCustomer() != null) {
                com.anhtin.tmdt.backend.modules.customer.entity.Customer c = d.getOrder().getCustomer();
                info.setCustomerId(c.getId());
                info.setCustomerName(c.getOrganizationName() != null ? 
                    c.getOrganizationName() : "");
            }
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
        private String receiverType; // AGENCY or CUSTOMER
        private LocalDateTime createdAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public double getAmount() { return amount; }
        public void setAmount(double amount) { this.amount = amount; }
        public String getReferenceId() { return referenceId; }
        public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
        public String getReceiverType() { return receiverType; }
        public void setReceiverType(String receiverType) { this.receiverType = receiverType; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public static LedgerEntry from(CreditLedger l, String receiverType) {
            LedgerEntry e = new LedgerEntry();
            e.setId(l.getId());
            e.setType(l.getType().name());
            e.setAmount(l.getAmount());
            e.setReferenceId(l.getReferenceId());
            e.setReceiverType(receiverType);
            e.setCreatedAt(l.getCreatedAt());
            return e;
        }
    }

    public static CreditDetailResponse from(AgentCredit credit,
                                            List<OverdueDebt> debts,
                                            List<CreditLedger> ledger,
                                            Map<Long, String> orderReceiverTypes,
                                            List<com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment> assignments,
                                            com.anhtin.tmdt.backend.modules.credit.entity.DepositContract depositContract) {
        CreditDetailResponse r = new CreditDetailResponse();
        r.setAgencyId(credit.getAgency().getId());
        r.setCreditLimit(credit.getCreditLimit());

        // Floor debts at 0, shift negative customer debt into vtcAvailable
        double totalDebt = Math.max(0, credit.getTotalDebt());
        double guaranteeDebt = Math.max(0, credit.getGuaranteeDebt());
        double vtcAvailable = credit.getVtcAvailable();

        // Customer debts: floor at 0, accumulate negative amounts to add to vtcAvailable
        double excessFromCustomers = 0;
        List<CustomerDebtInfo> customerDebtList = new java.util.ArrayList<>();
        for (var a : assignments) {
            CustomerDebtInfo cd = CustomerDebtInfo.from(a);
            if (cd.getTotalDebt() < 0) {
                excessFromCustomers += Math.abs(cd.getTotalDebt());
                cd.setTotalDebt(0);
            }
            customerDebtList.add(cd);
        }

        r.setTotalDebt(totalDebt);
        r.setGuaranteeDebt(guaranteeDebt);
        r.setVtcAvailable(vtcAvailable + excessFromCustomers);
        r.setVtcHold(credit.getVtcHold());
        r.setHmkd(credit.getCreditLimit() - (totalDebt + guaranteeDebt) + vtcAvailable + excessFromCustomers);
        r.setDebtTermDays(credit.getDebtTermDays() != null ? credit.getDebtTermDays() : 30);
        r.setUpdatedAt(credit.getUpdatedAt());
        r.setOverdueDebts(debts.stream().map(OverdueDebtInfo::from).toList());
        r.setCustomerDebts(customerDebtList);
        r.setDepositContract(depositContract != null ? DepositContractInfo.from(depositContract) : null);
        
        r.setLedgerHistory(ledger.stream().map(l -> {
            String ref = l.getReferenceId();
            String receiverType = "AGENCY";
            if (ref != null && ref.matches("\\d+")) {
                receiverType = orderReceiverTypes.getOrDefault(Long.parseLong(ref), "AGENCY");
            }
            return LedgerEntry.from(l, receiverType);
        }).toList());
        
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
        r.setDebtTermDays(30);
        r.setOverdueDebts(List.of());
        r.setLedgerHistory(List.of());
        r.setCustomerDebts(List.of());
        r.setDepositContract(null);
        return r;
    }
}
