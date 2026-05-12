package com.anhtin.tmdt.backend.credit.service;

import com.anhtin.tmdt.backend.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.credit.entity.OverdueDebt;
import com.anhtin.tmdt.backend.credit.repository.CreditLedgerRepository;
import com.anhtin.tmdt.backend.credit.repository.OverdueDebtRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class InterestScheduler {

    private static final Logger log = LoggerFactory.getLogger(InterestScheduler.class);

    private final OverdueDebtRepository overdueDebtRepository;
    private final CreditLedgerRepository creditLedgerRepository;
    private final AgencyDebtService agencyDebtService;

    public InterestScheduler(OverdueDebtRepository overdueDebtRepository, CreditLedgerRepository creditLedgerRepository, AgencyDebtService agencyDebtService) {
        this.overdueDebtRepository = overdueDebtRepository;
        this.creditLedgerRepository = creditLedgerRepository;
        this.agencyDebtService = agencyDebtService;
    }

    @Value("${app.credit.overdue-interest-rate:0.0004}")
    private double dailyInterestRate;

    @Scheduled(cron = "0 0 0 * * *") // Runs every day at midnight
    @Transactional
    public void calculateDailyInterest() {
        log.info("Starting daily overdue interest calculation...");
        List<OverdueDebt> activeDebts = overdueDebtRepository.findByStatus(OverdueDebt.OverdueStatus.ACTIVE);

        for (OverdueDebt debt : activeDebts) {
            double dailyInterest = debt.getPrincipalAmount() * dailyInterestRate;
            debt.setInterestAccrued(debt.getInterestAccrued() + dailyInterest);
            debt.setLastCalculatedAt(LocalDateTime.now());
            overdueDebtRepository.save(debt);

            CreditLedger ledger = new CreditLedger();
            ledger.setAgencyId(debt.getAgency().getId());
            ledger.setType(CreditLedger.LedgerType.INTEREST);
            ledger.setAmount(dailyInterest);
            ledger.setReferenceId(debt.getOrder().getId().toString());
            creditLedgerRepository.save(ledger);

            agencyDebtService.recordTransaction(debt.getAgency(), debt.getOrder(), "INT-" + debt.getOrder().getId() + "-" + java.util.UUID.randomUUID().toString().substring(0,8), 
                com.anhtin.tmdt.backend.credit.entity.AgencyDebt.DebtType.INTEREST, "Lãi quá hạn - Đơn " + debt.getOrder().getId(), dailyInterest, 0);
        }
        log.info("Daily interest calculation completed for {} debts", activeDebts.size());
    }
}
