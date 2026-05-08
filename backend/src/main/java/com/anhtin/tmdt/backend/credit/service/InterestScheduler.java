package com.anhtin.tmdt.backend.credit.service;

import com.anhtin.tmdt.backend.credit.entity.CreditLedger;
import com.anhtin.tmdt.backend.credit.entity.OverdueDebt;
import com.anhtin.tmdt.backend.credit.repository.CreditLedgerRepository;
import com.anhtin.tmdt.backend.credit.repository.OverdueDebtRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class InterestScheduler {

    private final OverdueDebtRepository overdueDebtRepository;
    private final CreditLedgerRepository creditLedgerRepository;

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
        }
        log.info("Daily interest calculation completed for {} debts", activeDebts.size());
    }
}
