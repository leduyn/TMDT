package com.anhtin.tmdt.backend.credit.service;

import com.anhtin.tmdt.backend.credit.entity.AgentCredit;
import com.anhtin.tmdt.backend.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.credit.entity.OverdueDebt;
import com.anhtin.tmdt.backend.credit.repository.AgentCreditRepository;
import com.anhtin.tmdt.backend.credit.repository.CreditLedgerRepository;
import com.anhtin.tmdt.backend.credit.repository.OverdueDebtRepository;
import com.anhtin.tmdt.backend.entity.Order;
import com.anhtin.tmdt.backend.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CreditService {

    private final AgentCreditRepository agentCreditRepository;
    private final OverdueDebtRepository overdueDebtRepository;
    private final CreditLedgerRepository creditLedgerRepository;
    private final OrderRepository orderRepository;

    @Value("${app.credit.overdue-interest-rate:0.0004}")
    private double dailyInterestRate;

    @Transactional
    public void initializeCredit(com.anhtin.tmdt.backend.entity.Agency agency) {
        if (agentCreditRepository.findByAgencyId(agency.getId()).isPresent()) return;
        
        AgentCredit credit = new AgentCredit();
        credit.setAgency(agency);
        credit.setCreditLimit(50000000.0); // Mặc định 50tr cho đại lý mới
        credit.setVtcAvailable(0.0);
        credit.setTotalDebt(0.0);
        credit.setVtcHold(0.0);
        agentCreditRepository.save(credit);
    }

    public double calculateHMKD(Long agencyId) {
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));
        return credit.getCreditLimit() - credit.getTotalDebt() + credit.getVtcAvailable();
    }

    @Transactional
    public void createCreditOrder(Long agencyId, Long orderId, Double amount) {
        int updated = agentCreditRepository.consumeCredit(agencyId, amount);
        if (updated == 0) {
            throw new RuntimeException("Hạn mức tín dụng không đủ");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus("NEW");
        orderRepository.save(order);

        saveLedger(agencyId, CreditLedger.LedgerType.DEBT, amount, orderId.toString());
    }

    @Transactional
    public void processOverdue(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        if (!"NEW".equals(order.getStatus())) return;
        
        order.setStatus("OVERDUE");
        orderRepository.save(order);

        AgentCredit credit = agentCreditRepository.findByAgencyId(order.getAgency().getId())
                .orElseThrow(() -> new RuntimeException("Credit account not found"));

        double overdueAmount = order.getTotalAmount();
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
    }

    @Transactional
    public void processPayment(Long agencyId, Double amount, Long targetOrderId) {
        AgentCredit credit = agentCreditRepository.findByAgencyId(agencyId)
                .orElseThrow(() -> new RuntimeException("Credit account not found"));

        double remainingAmount = amount;
        saveLedger(agencyId, CreditLedger.LedgerType.PAYMENT, amount, targetOrderId != null ? targetOrderId.toString() : "GENERAL");

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

        // Nếu còn dư sau khi trả hết nợ quá hạn, giảm total_debt chung
        if (remainingAmount > 0) {
            agentCreditRepository.decreaseDebt(agencyId, remainingAmount);
        }
    }

    private double payDebt(OverdueDebt debt, double amount, AgentCredit credit) {
        double remaining = amount;

        // 1. Trả gốc trước
        double principalToPay = Math.min(remaining, debt.getPrincipalAmount());
        debt.setPrincipalAmount(debt.getPrincipalAmount() - principalToPay);
        remaining -= principalToPay;
        agentCreditRepository.decreaseDebt(credit.getAgency().getId(), principalToPay);

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
    }
}
