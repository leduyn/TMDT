package com.anhtin.tmdt.backend.modules.credit.service;

import com.anhtin.tmdt.backend.modules.credit.entity.AgentCredit;
import com.anhtin.tmdt.backend.modules.credit.entity.AgencyDebt;
import com.anhtin.tmdt.backend.modules.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.modules.credit.entity.OverdueDebt;
import com.anhtin.tmdt.backend.modules.credit.entity.DepositContract;
import com.anhtin.tmdt.backend.modules.credit.entity.DepositPayment;
import com.anhtin.tmdt.backend.modules.credit.repository.AgentCreditRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.AgencyDebtRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.CreditLedgerRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.OverdueDebtRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.DepositContractRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.DepositPaymentRepository;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.order.repository.OrderRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyCustomerAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class CreditService {

    @Autowired
    private AgentCreditRepository agentCreditRepository;
    @Autowired
    private OverdueDebtRepository overdueDebtRepository;
    @Autowired
    private CreditLedgerRepository creditLedgerRepository;
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private AgencyCustomerAssignmentRepository agencyCustomerAssignmentRepository;
    @Autowired
    private com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository agencyRepository;
    @Autowired
    private AgencyDebtService agencyDebtService;

    @Value("${app.credit.overdue-interest-rate:0.0004}")
    private double dailyInterestRate;

    public List<com.anhtin.tmdt.backend.modules.credit.dto.AgencyCreditSummaryDTO> getAllAgencyCreditSummaries() {
        List<com.anhtin.tmdt.backend.modules.agency.entity.Agency> agencies = agencyRepository.findAll();
        return agencies.stream().map(agency -> {
            AgentCredit credit = agentCreditRepository.findByAgencyId(agency.getId()).orElse(null);
            if (credit != null) {
                int overdueCount = overdueDebtRepository.findByAgencyIdAndStatus(agency.getId(), OverdueDebt.OverdueStatus.ACTIVE).size();
                return com.anhtin.tmdt.backend.modules.credit.dto.AgencyCreditSummaryDTO.from(credit, overdueCount);
            } else {
                    return com.anhtin.tmdt.backend.modules.credit.dto.AgencyCreditSummaryDTO.uninitialized(
                            agency.getId(), agency.getName(), agency.getPhone(), agency.getBillingAddress() != null ? agency.getBillingAddress() : "");
            }
        }).toList();
    }

    @Transactional
    public void updateCreditTerms(Long agencyId, com.anhtin.tmdt.backend.modules.credit.dto.CreditTermsRequest request) {
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId).orElseGet(() -> {
            com.anhtin.tmdt.backend.modules.agency.entity.Agency agency = agencyRepository.findById(agencyId)
                    .orElseThrow(() -> new RuntimeException("Agency not found"));
            AgentCredit newCredit = new AgentCredit();
            newCredit.setAgency(agency);
            newCredit.setTotalDebt(0.0);
            newCredit.setVtcAvailable(request.getInitialVtc() != null ? request.getInitialVtc() : 0.0);
            newCredit.setVtcHold(0.0);
            newCredit.setGuaranteeDebt(0.0);
            return newCredit;
        });

        if (request.getCreditLimit() != null) {
            credit.setCreditLimit(request.getCreditLimit());
        }
        if (request.getDebtTermDays() != null) {
            credit.setDebtTermDays(request.getDebtTermDays());
        }
        
        agentCreditRepository.save(credit);
        saveLedger(agencyId, CreditLedger.LedgerType.PAYMENT, 0.0, "TERMS_UPDATE: Limit=" + request.getCreditLimit() + ", Term=" + request.getDebtTermDays());
    }

    @Transactional
    public void initializeCredit(com.anhtin.tmdt.backend.modules.agency.entity.Agency agency) {
        if (agentCreditRepository.findByAgencyId(agency.getId()).isPresent()) return;
        
        AgentCredit credit = new AgentCredit();
        credit.setAgency(agency);
        credit.setCreditLimit(50000000.0); // Mặc định 50tr cho đại lý mới
        credit.setVtcAvailable(0.0);
        credit.setTotalDebt(0.0);
        credit.setVtcHold(0.0);
        credit.setGuaranteeDebt(0.0);
        agentCreditRepository.save(credit);
    }

    public double calculateHMKD(Long agencyId) {
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));
        return credit.getCreditLimit() - (credit.getTotalDebt() + credit.getGuaranteeDebt()) + credit.getVtcAvailable();
    }

    public boolean tryConsumeCredit(Long agencyId, Long orderId, Double amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        int updated;
        if ("CUSTOMER".equals(order.getReceiverType())) {
            updated = agentCreditRepository.consumeGuaranteeCredit(agencyId, amount);
        } else {
            updated = agentCreditRepository.consumeAgencyCredit(agencyId, amount);
        }

        if (updated == 0) {
            return false;
        }

        order.setStatus("NEW");
        orderRepository.save(order);

        saveLedger(agencyId, CreditLedger.LedgerType.DEBT, amount, orderId.toString());
        return true;
    }

    @Autowired
    private AgencyDebtRepository agencyDebtRepository;

    @Autowired
    private DepositContractRepository depositContractRepository;

    @Autowired
    private DepositPaymentRepository depositPaymentRepository;

    @Transactional
    public void processOverdue(Long orderId, Double amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("OVERDUE");
        orderRepository.save(order);

        AgentCredit credit = agentCreditRepository.findByAgencyId(order.getAgency().getId())
                .orElseThrow(() -> new RuntimeException("Credit account not found"));

        double overdueAmount = amount != null ? amount : order.getTotalAmount();
        LocalDateTime now = LocalDateTime.now();
        boolean isCustomerDebt = "CUSTOMER".equals(order.getReceiverType());

        // 1. Tự động thanh toán từ ví ký quỹ khả dụng (vtcAvailable)
        double payFromVtc = Math.min(credit.getVtcAvailable(), overdueAmount);
        if (payFromVtc > 0) {
            credit.setVtcAvailable(credit.getVtcAvailable() - payFromVtc);

            // Cập nhật remainingToCollect trên các AgencyDebt của đơn hàng này
            List<AgencyDebt> orderDebts = agencyDebtRepository.findByOrderId(orderId);
            double remainingToApply = payFromVtc;
            for (AgencyDebt d : orderDebts) {
                if (remainingToApply <= 0) break;
                double toPay = Math.min(remainingToApply, d.getRemainingToCollect());
                d.setPaidValue(d.getPaidValue() + toPay);
                if (toPay > 0) d.setPaymentDate(now);
                remainingToApply -= toPay;
            }

            // Giảm guaranteeDebt khi thanh toán từ VTC cho nợ khách hàng
            if (isCustomerDebt) {
                credit.setGuaranteeDebt(Math.max(0, credit.getGuaranteeDebt() - payFromVtc));
            }

            saveLedger(credit.getAgency().getId(), CreditLedger.LedgerType.PAYMENT, payFromVtc, orderId.toString());
        }

        double remainingOverdue = Math.max(0, overdueAmount - payFromVtc);

        if (remainingOverdue > 0) {
            if (isCustomerDebt) {
                // Nợ khách hàng quá hạn: không tạo OverdueDebt/HOLD
                // recalculateDebts sẽ tự động chuyển phần còn lại từ guaranteeDebt sang vtcHold
            } else {
                // Nợ đại lý quá hạn: tạo OverdueDebt + HOLD (giữ nguyên logic cũ)
                OverdueDebt debt = new OverdueDebt();
                debt.setOrder(order);
                debt.setAgency(order.getAgency());
                debt.setPrincipalAmount(remainingOverdue);
                debt.setStartDate(now);
                debt.setStatus(OverdueDebt.OverdueStatus.ACTIVE);
                overdueDebtRepository.save(debt);

                agencyDebtService.recordTransaction(order.getAgency(), order,
                    "HOLD-" + order.getId() + "-" + UUID.randomUUID().toString().substring(0, 8),
                    AgencyDebt.DebtType.HOLD,
                    "Nợ quá hạn - Đơn " + order.getId() + " (đã thanh toán " + fmtAmount(payFromVtc) + " từ VTC)",
                    remainingOverdue, 0);
            }
        }

        agentCreditRepository.save(credit);
        agencyDebtService.recalculateDebts(credit.getAgency().getId());
    }

    private String fmtAmount(double d) {
        return String.format("%,.0f", d);
    }

    @Transactional
    public void processPayment(Long agencyId, Double amount, Long targetOrderId) {
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));

        // 1. Tăng ví ký quỹ khả dụng
        credit.setVtcAvailable(credit.getVtcAvailable() + amount);

        saveLedger(agencyId, CreditLedger.LedgerType.PAYMENT, amount,
                targetOrderId != null ? targetOrderId.toString() : "GENERAL");

        com.anhtin.tmdt.backend.modules.agency.entity.Agency agency = agencyRepository.findById(agencyId).orElse(null);
        if (agency != null) {
            Order targetOrder = targetOrderId != null ? orderRepository.findById(targetOrderId).orElse(null) : null;
            agencyDebtService.recordTransaction(agency, targetOrder, "PAY-" + UUID.randomUUID().toString().substring(0, 8),
                    AgencyDebt.DebtType.PAYMENT, "Thanh toán công nợ", -amount, 0);
        }

        // 2. Nếu thanh toán cho đơn hàng cụ thể, giảm dư nợ trên AgencyDebt
        if (targetOrderId != null) {
            List<AgencyDebt> orderDebts = agencyDebtRepository.findByOrderId(targetOrderId);
            double remainingToPay = amount;
            for (AgencyDebt d : orderDebts) {
                if (remainingToPay <= 0) break;
                double toPay = Math.min(remainingToPay, d.getRemainingToCollect());
                if (toPay > 0) {
                    d.setPaidValue(d.getPaidValue() + toPay);
                    d.setPaymentDate(LocalDateTime.now());
                    remainingToPay -= toPay;
                }
            }

            // Đóng OverdueDebt nếu đã thanh toán hết
            overdueDebtRepository.findByOrderId(targetOrderId).stream()
                .filter(od -> od.getStatus() == OverdueDebt.OverdueStatus.ACTIVE)
                .forEach(od -> {
                    double totalPaid = amount; // tổng đã thanh toán cho đơn này
                    od.setPrincipalAmount(Math.max(0, od.getPrincipalAmount() - totalPaid));
                    if (od.getPrincipalAmount() <= 0 && od.getInterestAccrued() <= 0) {
                        od.setStatus(OverdueDebt.OverdueStatus.CLOSED);
                    }
                    overdueDebtRepository.save(od);
                });
        }

        agentCreditRepository.save(credit);
        agencyDebtService.recalculateDebts(agencyId);
    }

    private void saveLedger(Long agencyId, CreditLedger.LedgerType type, Double amount, String refId) {
        CreditLedger ledger = new CreditLedger();
        ledger.setAgencyId(agencyId);
        ledger.setType(type);
        ledger.setAmount(amount);
        ledger.setReferenceId(refId);
        creditLedgerRepository.save(ledger);
    }

    @Transactional
    public void updateCreditLimit(Long agencyId, Double newLimit) {
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));
        credit.setCreditLimit(newLimit);
        agentCreditRepository.save(credit);
        saveLedger(agencyId, CreditLedger.LedgerType.PAYMENT, 0.0, "LIMIT_UPDATE:" + newLimit);
    }

    @Transactional
    public void depositVtc(Long agencyId, Double amount) {
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));
        credit.setVtcAvailable(credit.getVtcAvailable() + amount);
        agentCreditRepository.save(credit);
        saveLedger(agencyId, CreditLedger.LedgerType.REFUND, amount, "VTC_DEPOSIT");

        agencyDebtService.recordTransaction(credit.getAgency(), null, "DEP-" + UUID.randomUUID().toString().substring(0,8), 
            AgencyDebt.DebtType.DEPOSIT, "Nạp tiền vào ví VTC", -amount, 0);
    }

    @Transactional
    public DepositContract recordDepositContractPayment(Long contractId, Double amount, String notes) {
        DepositContract contract = depositContractRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hợp đồng đặt cọc"));
        if (contract.getStatus() != DepositContract.DepositContractStatus.ACTIVE) {
            throw new RuntimeException("Hợp đồng đặt cọc không ở trạng thái hoạt động");
        }

        // Create payment record
        DepositPayment payment = new DepositPayment();
        payment.setDepositContractId(contractId);
        payment.setAmount(amount);
        payment.setPaymentDate(LocalDateTime.now());
        payment.setNotes(notes);
        depositPaymentRepository.save(payment);

        // Update contract paid amount
        contract.setPaidAmount(contract.getPaidAmount() + amount);
        depositContractRepository.save(contract);

        // Increase vtcAvailable
        Long agencyId = contract.getAgencyId();
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));
        credit.setVtcAvailable(credit.getVtcAvailable() + amount);
        agentCreditRepository.save(credit);

        // Ledger entry
        saveLedger(agencyId, CreditLedger.LedgerType.PAYMENT, amount, "DEPOSIT_CONTRACT-" + contractId);

        // Record AgencyDebt transaction
        com.anhtin.tmdt.backend.modules.agency.entity.Agency agency = agencyRepository.findById(agencyId).orElse(null);
        if (agency != null) {
            agencyDebtService.recordTransaction(agency, null,
                "DEP-" + UUID.randomUUID().toString().substring(0, 8),
                AgencyDebt.DebtType.DEPOSIT, "Nạp tiền ký quỹ - HĐ " + contract.getContractNumber(), -amount, 0);
        }

        // Check activation: if cumulative payments >= deposit amount, activate agency
        if (contract.getPaidAmount() >= contract.getDepositAmount() && !agency.isActive()) {
            agency.setActive(true);
            agencyRepository.save(agency);
        }

        agencyDebtService.recalculateDebts(agencyId);
        return contract;
    }
}
