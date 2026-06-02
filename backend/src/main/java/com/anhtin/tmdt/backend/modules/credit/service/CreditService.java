package com.anhtin.tmdt.backend.modules.credit.service;

import com.anhtin.tmdt.backend.modules.credit.entity.AgentCredit;
import com.anhtin.tmdt.backend.modules.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.modules.credit.entity.OverdueDebt;
import com.anhtin.tmdt.backend.modules.credit.repository.AgentCreditRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.CreditLedgerRepository;
import com.anhtin.tmdt.backend.modules.credit.repository.OverdueDebtRepository;
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
                        agency.getId(), agency.getName(), agency.getPhone(), agency.getAddress());
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

    @Transactional
    public void processOverdue(Long orderId, Double amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setStatus("OVERDUE");
        orderRepository.save(order);

        AgentCredit credit = agentCreditRepository.findByAgencyId(order.getAgency().getId())
                .orElseThrow(() -> new RuntimeException("Credit account not found"));

        double overdueAmount = amount != null ? amount : order.getTotalAmount();
        double holdAmount = Math.min(credit.getVtcAvailable(), overdueAmount);

        if (holdAmount > 0) {
            credit.setVtcAvailable(credit.getVtcAvailable() - holdAmount);
            credit.setVtcHold(credit.getVtcHold() + holdAmount);
            agentCreditRepository.save(credit);
            saveLedger(credit.getAgency().getId(), CreditLedger.LedgerType.HOLD, holdAmount, orderId.toString());
        }

        OverdueDebt debt = new OverdueDebt();
        debt.setOrder(order);
        debt.setAgency(order.getAgency());
        debt.setPrincipalAmount(overdueAmount);
        debt.setStartDate(LocalDateTime.now());
        debt.setStatus(OverdueDebt.OverdueStatus.ACTIVE);
        overdueDebtRepository.save(debt);

        // Record in AgencyDebt
        agencyDebtService.recordTransaction(order.getAgency(), order, "HOLD-" + order.getId() + "-" + UUID.randomUUID().toString().substring(0,8), 
            com.anhtin.tmdt.backend.modules.credit.entity.AgencyDebt.DebtType.HOLD, "Giữ quỹ nợ quá hạn - Đơn " + order.getId(), overdueAmount, 0);
    }

    @Transactional
    public void processPayment(Long agencyId, Double amount, Long targetOrderId) {
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));

        double remainingAmount = amount;
        saveLedger(agencyId, CreditLedger.LedgerType.PAYMENT, amount, targetOrderId != null ? targetOrderId.toString() : "GENERAL");
        
        com.anhtin.tmdt.backend.modules.agency.entity.Agency agency = agencyRepository.findById(agencyId).orElse(null);
        if (agency != null) {
            Order targetOrder = targetOrderId != null ? orderRepository.findById(targetOrderId).orElse(null) : null;
            agencyDebtService.recordTransaction(agency, targetOrder, "PAY-" + UUID.randomUUID().toString().substring(0,8), 
                com.anhtin.tmdt.backend.modules.credit.entity.AgencyDebt.DebtType.PAYMENT, "Thanh toán công nợ", -amount, 0);
        }

        if (targetOrderId != null) {
            // Thanh toán chỉ định cho 1 đơn hàng
            OverdueDebt debt = overdueDebtRepository.findByAgencyIdAndStatus(agencyId, OverdueDebt.OverdueStatus.ACTIVE)
                    .stream()
                    .filter(d -> d.getOrder().getId().equals(targetOrderId))
                    .findFirst()
                    .orElse(null);
            
            if (debt != null) {
                remainingAmount = payDebt(debt, remainingAmount, credit);
            }
        } else {
            // Thanh toán FIFO
            List<OverdueDebt> activeDebts = overdueDebtRepository.findByAgencyIdAndStatus(agencyId, OverdueDebt.OverdueStatus.ACTIVE);
            activeDebts.sort((a, b) -> a.getStartDate().compareTo(b.getStartDate()));

            for (OverdueDebt debt : activeDebts) {
                if (remainingAmount <= 0) break;
                remainingAmount = payDebt(debt, remainingAmount, credit);
            }
        }

        // Nếu còn dư sau khi trả hết nợ quá hạn, ưu tiên giảm Dư nợ (totalDebt)
        if (remainingAmount > 0) {
            agentCreditRepository.decreaseAgencyDebt(agencyId, remainingAmount);
        }
    }

    private double payDebt(OverdueDebt debt, double amount, AgentCredit credit) {
        double remaining = amount;

        // 1. Trả gốc trước
        double principalToPay = Math.min(remaining, debt.getPrincipalAmount());
        debt.setPrincipalAmount(debt.getPrincipalAmount() - principalToPay);
        remaining -= principalToPay;
        
        if ("CUSTOMER".equals(debt.getOrder().getReceiverType())) {
            agentCreditRepository.decreaseGuaranteeDebt(credit.getAgency().getId(), principalToPay);
            if (debt.getOrder().getCustomer() != null && debt.getOrder().getAgency() != null) {
                agencyCustomerAssignmentRepository.findByAgencyIdAndCustomerId(
                        debt.getOrder().getAgency().getId(), debt.getOrder().getCustomer().getId())
                    .ifPresent(assignment -> {
                        assignment.setTotalDebt(Math.max(0, assignment.getTotalDebt() - principalToPay));
                        agencyCustomerAssignmentRepository.save(assignment);
                    });
            }
        } else {
            agentCreditRepository.decreaseAgencyDebt(credit.getAgency().getId(), principalToPay);
        }

        // 2. Trả lãi sau
        double interestToPay = Math.min(remaining, debt.getInterestAccrued());
        debt.setInterestAccrued(debt.getInterestAccrued() - interestToPay);
        remaining -= interestToPay;

        if (debt.getPrincipalAmount() <= 0 && debt.getInterestAccrued() <= 0) {
            debt.setStatus(OverdueDebt.OverdueStatus.CLOSED);
            
            // Refund collateral
            double vtcHoldForThisOrder = Math.min(credit.getVtcHold(), debt.getOrder().getTotalAmount());
            if (vtcHoldForThisOrder > 0) {
                // Refund formula: refund = vtc_hold - interest_paid
                // Ở đây ta đơn giản hóa: hoàn trả phần vtc_hold tương ứng đơn hàng này
                credit.setVtcHold(credit.getVtcHold() - vtcHoldForThisOrder);
                credit.setVtcAvailable(credit.getVtcAvailable() + vtcHoldForThisOrder);
                saveLedger(credit.getAgency().getId(), CreditLedger.LedgerType.REFUND, vtcHoldForThisOrder, debt.getOrder().getId().toString());
            }
        }

        overdueDebtRepository.save(debt);
        agentCreditRepository.save(credit);
        return remaining;
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
            com.anhtin.tmdt.backend.modules.credit.entity.AgencyDebt.DebtType.DEPOSIT, "Nạp tiền vào ví VTC", -amount, 0);
    }
}
