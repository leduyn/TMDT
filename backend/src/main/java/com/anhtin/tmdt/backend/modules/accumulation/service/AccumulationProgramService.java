package com.anhtin.tmdt.backend.modules.accumulation.service;

import com.anhtin.tmdt.backend.modules.accumulation.dto.AccumulationProgramDTO;
import com.anhtin.tmdt.backend.modules.accumulation.dto.AccumulationProgramRequest;
import com.anhtin.tmdt.backend.modules.accumulation.dto.AccumulationSummaryDTO;
import com.anhtin.tmdt.backend.modules.accumulation.dto.AccumulationDebtDetailDTO;
import com.anhtin.tmdt.backend.modules.accumulation.dto.TierProgressDTO;
import com.anhtin.tmdt.backend.modules.accumulation.entity.AccumulationPayment;
import com.anhtin.tmdt.backend.modules.accumulation.entity.AccumulationProgram;
import com.anhtin.tmdt.backend.modules.accumulation.entity.AccumulationProgramTier;
import com.anhtin.tmdt.backend.modules.accumulation.repository.AccumulationPaymentRepository;
import com.anhtin.tmdt.backend.modules.accumulation.repository.AccumulationProgramRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.credit.entity.AgencyDebt;
import com.anhtin.tmdt.backend.modules.credit.repository.AgencyDebtRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AccumulationProgramService {

    @Autowired
    private AccumulationProgramRepository programRepository;

    @Autowired
    private AccumulationPaymentRepository paymentRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private AgencyDebtRepository agencyDebtRepository;

    @Transactional
    public AccumulationProgramDTO createProgram(AccumulationProgramRequest request) {
        AccumulationProgram program = new AccumulationProgram();
        program.setName(request.getName());
        program.setDescription(request.getDescription());
        program.setStartDate(request.getStartDate());
        program.setEndDate(request.getEndDate());
        program.setRebateCalculationType(AccumulationProgram.RebateCalculationType.valueOf(request.getRebateCalculationType()));
        program.setActive(request.isActive());
        program.setUnlimited(request.isUnlimited());

        if (request.getTiers() != null) {
            List<AccumulationProgramTier> tiers = request.getTiers().stream()
                .map(t -> new AccumulationProgramTier(program, t.getTierIndex(), t.getThresholdValue(), t.getRebateRate()))
                .collect(Collectors.toList());
            program.setTiers(tiers);
        }

        if (request.getAgencyIds() != null) {
            List<Agency> agencies = agencyRepository.findAllById(request.getAgencyIds());
            program.setAgencies(new java.util.HashSet<>(agencies));
        }

        return AccumulationProgramDTO.fromEntity(programRepository.save(program));
    }

    @Transactional
    public AccumulationProgramDTO updateProgram(Long id, AccumulationProgramRequest request) {
        AccumulationProgram program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found: " + id));

        program.setName(request.getName());
        program.setDescription(request.getDescription());
        program.setStartDate(request.getStartDate());
        program.setEndDate(request.getEndDate());
        program.setRebateCalculationType(AccumulationProgram.RebateCalculationType.valueOf(request.getRebateCalculationType()));
        program.setActive(request.isActive());
        program.setUnlimited(request.isUnlimited());

        if (request.getTiers() != null) {
            program.getTiers().clear();
            List<AccumulationProgramTier> tiers = request.getTiers().stream()
                .map(t -> new AccumulationProgramTier(program, t.getTierIndex(), t.getThresholdValue(), t.getRebateRate()))
                .collect(Collectors.toList());
            program.getTiers().addAll(tiers);
        }

        if (request.getAgencyIds() != null) {
            program.getAgencies().clear();
            List<Agency> agencies = agencyRepository.findAllById(request.getAgencyIds());
            program.getAgencies().addAll(agencies);
        }

        return AccumulationProgramDTO.fromEntity(programRepository.save(program));
    }

    public List<AccumulationProgramDTO> getAllPrograms() {
        return programRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(AccumulationProgramDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public AccumulationProgramDTO getProgramById(Long id) {
        AccumulationProgram program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found: " + id));
        return AccumulationProgramDTO.fromEntity(program);
    }

    @Transactional
    public void deleteProgram(Long id) {
        if (!programRepository.existsById(id)) {
            throw new RuntimeException("Program not found: " + id);
        }
        programRepository.deleteById(id);
    }

    @Transactional
    public AccumulationProgramDTO activateProgram(Long id) {
        AccumulationProgram program = programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found: " + id));
        
        if (program.getStatus() != AccumulationProgram.ProgramStatus.DRAFT) {
            throw new RuntimeException("Only programs in DRAFT status can be activated. Current status: " + program.getStatus());
        }
        
        // Validate program has at least one tier
        if (program.getTiers() == null || program.getTiers().isEmpty()) {
            throw new RuntimeException("Program must have at least one tier to be activated");
        }
        
        // Validate program has at least one agency
        if (program.getAgencies() == null || program.getAgencies().isEmpty()) {
            throw new RuntimeException("Program must have at least one agency to be activated");
        }
        
        program.setStatus(AccumulationProgram.ProgramStatus.ACTIVE);
        program.setStartDate(LocalDateTime.now()); // Set start date to now when activated
        return AccumulationProgramDTO.fromEntity(programRepository.save(program));
    }

    public AccumulationSummaryDTO getAgencySummary(Long programId, Long agencyId) {
        AccumulationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found: " + programId));
        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agency not found: " + agencyId));

        List<AgencyDebt> debts = agencyDebtRepository.findByAgencyIdAndRecordingDateBetween(
                agencyId, program.getStartDate(), program.getEndDate());

        double totalValue = debts.stream().mapToDouble(AgencyDebt::getValue).sum();
        double totalPaid = debts.stream().mapToDouble(AgencyDebt::getPaidValue).sum();
        double remaining = debts.stream().mapToDouble(d -> d.getRemainingToCollect() != null ? d.getRemainingToCollect() : 0.0).sum();

        List<AccumulationProgramTier> sortedTiers = program.getTiers().stream()
                .sorted(Comparator.comparing(AccumulationProgramTier::getThresholdValue))
                .collect(Collectors.toList());

        double currentRate = resolveRebateRate(program.getRebateCalculationType(), sortedTiers, totalValue, program.isUnlimited());
        AccumulationProgramTier nextTier = findNextTier(sortedTiers, totalValue);

        AccumulationSummaryDTO summary = new AccumulationSummaryDTO();
        summary.setAgencyId(agencyId);
        summary.setAgencyName(agency.getName());
        summary.setProgramId(programId);
        summary.setProgramName(program.getName());
        summary.setTotalAccumulatedValue(totalValue);
        summary.setTotalCollectedValue(totalPaid);
        summary.setTotalRemainingDebt(remaining);
        summary.setCurrentTierRate(currentRate);
        summary.setCurrentTierLabel(String.format("%.0f%%", currentRate * 100));

        if (nextTier != null) {
            summary.setNextTierThreshold(nextTier.getThresholdValue());
            summary.setNextTierDistance(Math.max(0, nextTier.getThresholdValue() - totalValue));
        }

        double estimatedCommission;
        if (program.getRebateCalculationType() == AccumulationProgram.RebateCalculationType.TIERED_PROGRESSIVE) {
            estimatedCommission = calculateCommissionFromTiers(sortedTiers, totalValue, program.isUnlimited());
        } else {
            estimatedCommission = totalValue * currentRate;
        }
        double estimatedStage1 = totalPaid * currentRate;
        double estimatedStage2 = estimatedCommission - estimatedStage1;
        summary.setEstimatedCommission(estimatedCommission);
        summary.setEstimatedStage1(estimatedStage1);
        summary.setEstimatedStage2(estimatedStage2);

        summary.setCalculationType(program.getRebateCalculationType().name());

        if (program.getRebateCalculationType() == AccumulationProgram.RebateCalculationType.TIERED_PROGRESSIVE) {
            List<TierProgressDTO> tierProgress = calculateTierProgress(sortedTiers, totalValue, program.isUnlimited());
            summary.setTierProgress(tierProgress);

            double totalFromTiers = calculateCommissionFromTiers(sortedTiers, totalValue, program.isUnlimited());
            summary.setTotalCommissionFromTiers(totalFromTiers);

            summary.setEstimatedCommission(totalFromTiers);
            summary.setEstimatedStage1(totalPaid > 0 ? calculateStage1FromTiers(sortedTiers, totalPaid, program.isUnlimited()) : 0.0);
            summary.setEstimatedStage2(Math.max(0, totalFromTiers - summary.getEstimatedStage1()));
        }

        paymentRepository.findByProgramIdAndAgencyIdAndPaymentStage(programId, agencyId, 1).ifPresent(p -> {
            summary.setPaidStage1(p.getAmount());
            summary.setStage1Status(p.getStatus().name());
        });

        paymentRepository.findByProgramIdAndAgencyIdAndPaymentStage(programId, agencyId, 2).ifPresent(p -> {
            summary.setPaidStage2(p.getAmount());
            summary.setStage2Status(p.getStatus().name());
        });

        return summary;
    }

    public List<AccumulationSummaryDTO> getAllAgencySummaries(Long programId) {
        AccumulationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found: " + programId));

        return program.getAgencies().stream()
                .map(a -> getAgencySummary(programId, a.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public AccumulationProgramDTO calculateStage1(Long programId) {
        AccumulationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found: " + programId));

        if (program.getStatus() != AccumulationProgram.ProgramStatus.ACTIVE) {
            throw new RuntimeException("Program must be ACTIVE to calculate stage 1. Current status: " + program.getStatus());
        }

        for (Agency agency : program.getAgencies()) {
            List<AgencyDebt> debts = agencyDebtRepository.findByAgencyIdAndRecordingDateBetween(
                    agency.getId(), program.getStartDate(), program.getEndDate());

            double totalValue = debts.stream().mapToDouble(AgencyDebt::getValue).sum();
            double totalPaid = debts.stream().mapToDouble(AgencyDebt::getPaidValue).sum();

            List<AccumulationProgramTier> sortedTiers = program.getTiers().stream()
                    .sorted(Comparator.comparing(AccumulationProgramTier::getThresholdValue))
                    .collect(Collectors.toList());

            double rate;
            double amount;
            if (program.getRebateCalculationType() == AccumulationProgram.RebateCalculationType.TIERED_PROGRESSIVE) {
                amount = calculateStage1FromTiers(sortedTiers, totalPaid, program.isUnlimited());
                rate = totalPaid > 0 ? amount / totalPaid : 0.0;
            } else {
                rate = resolveRebateRate(program.getRebateCalculationType(), sortedTiers, totalValue);
                amount = totalPaid * rate;
            }

            AccumulationPayment payment = new AccumulationPayment();
            payment.setProgramId(program.getId());
            payment.setAgencyId(agency.getId());
            payment.setPaymentStage(1);
            payment.setAccumulatedValue(totalValue);
            payment.setCollectedValue(totalPaid);
            payment.setRebateRate(rate);
            payment.setAmount(amount);
            payment.setCalculatedAt(LocalDateTime.now());

            paymentRepository.save(payment);
        }

        program.setStatus(AccumulationProgram.ProgramStatus.STAGE1_PENDING);
        return AccumulationProgramDTO.fromEntity(programRepository.save(program));
    }

    @Transactional
    public AccumulationPayment approveStage1Payment(Long programId, Long agencyId, String approvedBy) {
        AccumulationPayment payment = paymentRepository.findByProgramIdAndAgencyIdAndPaymentStage(programId, agencyId, 1)
                .orElseThrow(() -> new RuntimeException("Stage 1 payment not found for agency " + agencyId));

        if (payment.getStatus() != AccumulationPayment.PaymentStatus.PENDING) {
            throw new RuntimeException("Stage 1 payment already " + payment.getStatus());
        }

        payment.setStatus(AccumulationPayment.PaymentStatus.APPROVED);
        payment.setApprovedAt(LocalDateTime.now());
        payment.setApprovedBy(approvedBy);
        return paymentRepository.save(payment);
    }

    @Transactional
    public AccumulationProgramDTO approveAllStage1(Long programId, String approvedBy) {
        AccumulationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found: " + programId));

        for (Agency agency : program.getAgencies()) {
            paymentRepository.findByProgramIdAndAgencyIdAndPaymentStage(programId, agency.getId(), 1)
                .filter(p -> p.getStatus() == AccumulationPayment.PaymentStatus.PENDING)
                .ifPresent(p -> {
                    p.setStatus(AccumulationPayment.PaymentStatus.APPROVED);
                    p.setApprovedAt(LocalDateTime.now());
                    p.setApprovedBy(approvedBy);
                    paymentRepository.save(p);
                });
        }

        program.setStatus(AccumulationProgram.ProgramStatus.STAGE1_APPROVED);
        return AccumulationProgramDTO.fromEntity(programRepository.save(program));
    }

    @Transactional
    public AccumulationPayment rejectStage1Payment(Long programId, Long agencyId, String notes) {
        AccumulationPayment payment = paymentRepository.findByProgramIdAndAgencyIdAndPaymentStage(programId, agencyId, 1)
                .orElseThrow(() -> new RuntimeException("Stage 1 payment not found for agency " + agencyId));

        if (payment.getStatus() != AccumulationPayment.PaymentStatus.PENDING) {
            throw new RuntimeException("Stage 1 payment already " + payment.getStatus());
        }

        payment.setStatus(AccumulationPayment.PaymentStatus.REJECTED);
        payment.setNotes(notes);
        return paymentRepository.save(payment);
    }

    @Transactional
    public AccumulationPayment calculateStage2(Long programId, Long agencyId) {
        AccumulationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found: " + programId));

        if (program.getStatus() != AccumulationProgram.ProgramStatus.STAGE1_APPROVED &&
            program.getStatus() != AccumulationProgram.ProgramStatus.COMPLETED) {
            throw new RuntimeException("Program must have stage 1 approved to calculate stage 2. Current status: " + program.getStatus());
        }

        AccumulationPayment stage1 = paymentRepository.findByProgramIdAndAgencyIdAndPaymentStage(programId, agencyId, 1)
                .orElseThrow(() -> new RuntimeException("Stage 1 payment not found for agency " + agencyId));

        if (stage1.getStatus() != AccumulationPayment.PaymentStatus.APPROVED) {
            throw new RuntimeException("Stage 1 must be APPROVED before calculating stage 2");
        }

        List<AgencyDebt> debts = agencyDebtRepository.findByAgencyIdAndRecordingDateBetween(
                agencyId, program.getStartDate(), program.getEndDate());

        boolean allPaid = debts.stream().allMatch(d -> d.getRemainingToCollect() == null || d.getRemainingToCollect() <= 0);
        if (!allPaid) {
            throw new RuntimeException("Not all accumulated debts are fully paid for agency " + agencyId);
        }

        double totalValue = debts.stream().mapToDouble(AgencyDebt::getValue).sum();
        List<AccumulationProgramTier> sortedTiers = program.getTiers().stream()
                .sorted(Comparator.comparing(AccumulationProgramTier::getThresholdValue))
                .collect(Collectors.toList());

        double totalCommission;
        if (program.getRebateCalculationType() == AccumulationProgram.RebateCalculationType.TIERED_PROGRESSIVE) {
            totalCommission = calculateCommissionFromTiers(sortedTiers, totalValue, program.isUnlimited());
        } else {
            double rate = stage1.getRebateRate();
            totalCommission = totalValue * rate;
        }
        double stage2Amount = totalCommission - stage1.getAmount();

        if (stage2Amount < 0) stage2Amount = 0;

        AccumulationPayment payment = new AccumulationPayment();
        payment.setProgramId(program.getId());
        payment.setAgencyId(agencyId);
        payment.setPaymentStage(2);
        payment.setAccumulatedValue(totalValue);
        payment.setCollectedValue(totalValue);
        payment.setRebateRate(totalValue > 0 ? totalCommission / totalValue : 0.0);
        payment.setAmount(stage2Amount);
        payment.setCalculatedAt(LocalDateTime.now());

        AccumulationPayment saved = paymentRepository.save(payment);

        boolean allStage2Done = program.getAgencies().stream()
                .allMatch(a -> paymentRepository.findByProgramIdAndAgencyIdAndPaymentStage(programId, a.getId(), 2)
                        .filter(p -> p.getStatus() == AccumulationPayment.PaymentStatus.APPROVED || p.getStatus() == AccumulationPayment.PaymentStatus.PENDING)
                        .isPresent());

        if (allStage2Done) {
            program.setStatus(AccumulationProgram.ProgramStatus.COMPLETED);
            programRepository.save(program);
        }

        return saved;
    }

    public double resolveRebateRate(AccumulationProgram.RebateCalculationType type,
                                     List<AccumulationProgramTier> sortedTiers,
                                     double totalValue) {
        return resolveRebateRate(type, sortedTiers, totalValue, false);
    }

    public double resolveRebateRate(AccumulationProgram.RebateCalculationType type,
                                     List<AccumulationProgramTier> sortedTiers,
                                     double totalValue, boolean unlimited) {
        if (sortedTiers.isEmpty()) return 0.0;

        if (type == AccumulationProgram.RebateCalculationType.HIGHEST_THRESHOLD) {
            return calculateHighestThresholdRate(sortedTiers, totalValue);
        } else {
            return calculateTieredProgressiveRate(sortedTiers, totalValue, unlimited);
        }
    }

    private double calculateCommissionFromTiers(List<AccumulationProgramTier> tiers,
                                                 double value, boolean unlimited) {
        if (tiers.isEmpty() || value <= 0) return 0.0;

        double totalCommission = 0.0;

        if (unlimited) {
            double previousThreshold = 0.0;
            for (int i = 0; i < tiers.size(); i++) {
                AccumulationProgramTier tier = tiers.get(i);
                boolean isLast = (i == tiers.size() - 1);
                double upper = isLast ? Double.MAX_VALUE : tier.getThresholdValue();
                double valueInTier = Math.max(0, Math.min(value, upper) - previousThreshold);
                totalCommission += valueInTier * tier.getRebateRate();
                previousThreshold = tier.getThresholdValue();
                if (!isLast && value <= tier.getThresholdValue()) break;
            }
        } else {
            double remaining = value;
            while (remaining > 0) {
                double previousThreshold = 0.0;
                for (AccumulationProgramTier tier : tiers) {
                    double tierRange = tier.getThresholdValue() - previousThreshold;
                    double valueInTier = Math.min(remaining, tierRange);
                    if (valueInTier > 0) {
                        totalCommission += valueInTier * tier.getRebateRate();
                        remaining -= valueInTier;
                    }
                    previousThreshold = tier.getThresholdValue();
                    if (remaining <= 0) break;
                }
            }
        }

        return totalCommission;
    }

    private double calculateHighestThresholdRate(List<AccumulationProgramTier> tiers, double totalValue) {
        double rate = 0.0;
        for (AccumulationProgramTier tier : tiers) {
            if (totalValue >= tier.getThresholdValue()) {
                rate = tier.getRebateRate();
            }
        }
        return rate;
    }

    private double calculateTieredProgressiveRate(List<AccumulationProgramTier> tiers, double totalValue, boolean unlimited) {
        if (tiers.isEmpty() || totalValue <= 0) return 0.0;
        double commission = calculateCommissionFromTiers(tiers, totalValue, unlimited);
        return commission / totalValue;
    }

    private AccumulationProgramTier findNextTier(List<AccumulationProgramTier> sortedTiers, double totalValue) {
        for (AccumulationProgramTier tier : sortedTiers) {
            if (totalValue < tier.getThresholdValue()) {
                return tier;
            }
        }
        return null;
    }

    private List<TierProgressDTO> calculateTierProgress(List<AccumulationProgramTier> sortedTiers, double totalValue, boolean unlimited) {
        List<TierProgressDTO> result = new ArrayList<>();

        if (unlimited) {
            double previousThreshold = 0.0;
            for (int i = 0; i < sortedTiers.size(); i++) {
                AccumulationProgramTier tier = sortedTiers.get(i);
                boolean isLast = (i == sortedTiers.size() - 1);
                double upper = isLast ? Double.MAX_VALUE : tier.getThresholdValue();
                double tierRange = isLast ? Double.MAX_VALUE : tier.getThresholdValue() - previousThreshold;
                double rawValue = totalValue - previousThreshold;
                double valueInTier = Math.max(0, Math.min(rawValue, upper - previousThreshold));

                double commission = valueInTier * tier.getRebateRate();
                double progress = (isLast || tierRange == Double.MAX_VALUE)
                    ? (totalValue >= previousThreshold ? 1.0 : 0.0)
                    : Math.min(1.0, valueInTier / tierRange);
                boolean isReached = isLast ? totalValue >= previousThreshold : totalValue >= tier.getThresholdValue();
                boolean isCurrentTier = !isReached && totalValue >= previousThreshold;

                TierProgressDTO dto = new TierProgressDTO();
                dto.setTierIndex(i);
                dto.setThresholdValue(tier.getThresholdValue());
                dto.setPreviousThreshold(previousThreshold);
                dto.setRebateRate(tier.getRebateRate());
                dto.setValueInTier(valueInTier);
                dto.setCommissionFromTier(commission);
                dto.setProgress(progress);
                dto.setIsReached(isReached);
                dto.setIsCurrentTier(isCurrentTier);

                result.add(dto);
                previousThreshold = tier.getThresholdValue();
                if (!isLast && totalValue <= tier.getThresholdValue()) break;
            }
        } else {
            double remaining = totalValue;
            int cycle = 0;
            while (remaining > 0 && cycle < 10) {
                double previousThreshold = 0.0;
                for (int i = 0; i < sortedTiers.size(); i++) {
                    AccumulationProgramTier tier = sortedTiers.get(i);
                    double tierRange = tier.getThresholdValue() - previousThreshold;
                    double valueInTier = Math.min(remaining, tierRange);

                    if (valueInTier > 0) {
                        boolean isLast = (i == sortedTiers.size() - 1);
                        boolean isReached = remaining <= tierRange;
                        boolean isCurrentTier = !isReached;

                        TierProgressDTO dto = new TierProgressDTO();
                        dto.setTierIndex(i);
                        dto.setThresholdValue(tier.getThresholdValue());
                        dto.setPreviousThreshold(previousThreshold);
                        dto.setRebateRate(tier.getRebateRate());
                        dto.setValueInTier(valueInTier);
                        dto.setCommissionFromTier(valueInTier * tier.getRebateRate());
                        dto.setProgress(tierRange > 0 ? valueInTier / tierRange : 0);
                        dto.setIsReached(isReached);
                        dto.setIsCurrentTier(false);

                        result.add(dto);
                    }

                    remaining -= valueInTier;
                    previousThreshold = tier.getThresholdValue();
                    if (remaining <= 0) break;
                }
                cycle++;
            }
        }

        return result;
    }

    private double calculateStage1FromTiers(List<AccumulationProgramTier> sortedTiers, double paidValue, boolean unlimited) {
        return calculateCommissionFromTiers(sortedTiers, paidValue, unlimited);
    }

    @Transactional(readOnly = true)
    public List<AccumulationDebtDetailDTO> getProgramDebts(Long programId) {
        AccumulationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found: " + programId));

        List<AgencyDebt> debts = agencyDebtRepository.findByRecordingDateBetween(
                program.getStartDate(), program.getEndDate());

        System.out.println("=== ACCUMULATION DEBTS: programId=" + programId + ", startDate=" + program.getStartDate() + ", endDate=" + program.getEndDate() + ", debtsFound=" + debts.size());

        return debts.stream().map(d -> {
            String agencyName = d.getAgencyName();
            Long agencyId = null;
            try {
                if (d.getAgency() != null) agencyId = d.getAgency().getId();
            } catch (Exception e) {}
            Long orderId = null;
            try {
                if (d.getOrder() != null) orderId = d.getOrder().getId();
            } catch (Exception e) {}
            return new AccumulationDebtDetailDTO(
                d.getId(),
                d.getDebtCode(),
                orderId,
                agencyId,
                agencyName,
                d.getCustomerName(),
                d.getDebtType() != null ? d.getDebtType().name() : null,
                d.getValue(),
                d.getPaidValue(),
                d.getRemainingToCollect(),
                d.getDebtTermDays(),
                d.getRecordingDate(),
                d.getDueDate(),
                d.getPaymentDate()
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AccumulationDebtDetailDTO> getProgramDebtsByAgency(Long programId, Long agencyId) {
        AccumulationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found: " + programId));

        List<AgencyDebt> debts = agencyDebtRepository.findByAgencyIdAndRecordingDateBetween(
                agencyId, program.getStartDate(), program.getEndDate());

        return debts.stream().map(d -> {
            String agencyName = d.getAgencyName();
            Long aId = null;
            try {
                if (d.getAgency() != null) aId = d.getAgency().getId();
            } catch (Exception e) {}
            Long orderId = null;
            try {
                if (d.getOrder() != null) orderId = d.getOrder().getId();
            } catch (Exception e) {}
            return new AccumulationDebtDetailDTO(
                d.getId(),
                d.getDebtCode(),
                orderId,
                aId,
                agencyName,
                d.getCustomerName(),
                d.getDebtType() != null ? d.getDebtType().name() : null,
                d.getValue(),
                d.getPaidValue(),
                d.getRemainingToCollect(),
                d.getDebtTermDays(),
                d.getRecordingDate(),
                d.getDueDate(),
                d.getPaymentDate()
            );
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Object getProgramDebtStats(Long programId) {
        AccumulationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found: " + programId));

        List<AgencyDebt> allDebts = agencyDebtRepository.findByRecordingDateBetween(
                program.getStartDate(), program.getEndDate());

        System.out.println("=== ACCUMULATION STATS: programId=" + programId + ", debtsFound=" + allDebts.size());

        double totalValue = allDebts.stream().mapToDouble(d -> d.getValue() != null ? d.getValue() : 0).sum();
        double totalPaid = allDebts.stream().mapToDouble(d -> d.getPaidValue() != null ? d.getPaidValue() : 0).sum();
        double totalRemaining = allDebts.stream().mapToDouble(d -> d.getRemainingToCollect() != null ? d.getRemainingToCollect() : 0).sum();
        int totalOrders = allDebts.size();
        int fullyPaidCount = (int) allDebts.stream().filter(d -> d.getRemainingToCollect() == null || d.getRemainingToCollect() <= 0).count();
        int unpaidCount = totalOrders - fullyPaidCount;

        List<Long> agencyIds = program.getAgencies().stream()
                .map(a -> a.getId())
                .collect(Collectors.toList());

        java.util.Map<Long, Double> debtByAgency = new java.util.HashMap<>();
        java.util.Map<Long, Double> paidByAgency = new java.util.HashMap<>();
        java.util.Map<Long, Integer> countByAgency = new java.util.HashMap<>();

        for (AgencyDebt d : allDebts) {
            Long aId = d.getAgency() != null ? d.getAgency().getId() : null;
            if (aId != null) {
                debtByAgency.merge(aId, d.getValue() != null ? d.getValue() : 0, Double::sum);
                paidByAgency.merge(aId, d.getPaidValue() != null ? d.getPaidValue() : 0, Double::sum);
                countByAgency.merge(aId, 1, Integer::sum);
            }
        }

        java.util.List<java.util.Map<String, Object>> perAgency = new java.util.ArrayList<>();
        for (Agency a : program.getAgencies()) {
            java.util.Map<String, Object> item = new java.util.HashMap<>();
            item.put("agencyId", a.getId());
            item.put("agencyName", a.getName());
            item.put("totalValue", debtByAgency.getOrDefault(a.getId(), 0.0));
            item.put("totalPaid", paidByAgency.getOrDefault(a.getId(), 0.0));
            item.put("totalRemaining", debtByAgency.getOrDefault(a.getId(), 0.0) - paidByAgency.getOrDefault(a.getId(), 0.0));
            item.put("orderCount", countByAgency.getOrDefault(a.getId(), 0));
            perAgency.add(item);
        }

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("programId", programId);
        result.put("programName", program.getName());
        result.put("startDate", program.getStartDate());
        result.put("endDate", program.getEndDate());
        result.put("totalDebtValue", totalValue);
        result.put("totalCollectedValue", totalPaid);
        result.put("totalRemainingValue", totalRemaining);
        result.put("totalOrders", totalOrders);
        result.put("fullyPaidOrders", fullyPaidCount);
        result.put("unpaidOrders", unpaidCount);
        result.put("collectionRate", totalValue > 0 ? totalPaid / totalValue : 0);
        result.put("perAgencyStats", perAgency);

        return result;
    }
}
