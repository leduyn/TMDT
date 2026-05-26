package com.anhtin.tmdt.backend.modules.price.service;

import com.anhtin.tmdt.backend.modules.agency.repository.AgencyPriceListRepository;
import com.anhtin.tmdt.backend.modules.price.repository.PriceAssignmentVoucherRepository;
import com.anhtin.tmdt.backend.modules.price.repository.PriceListConditionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import com.anhtin.tmdt.backend.modules.price.entity.PriceAssignmentVoucher;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyPriceList;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListCondition;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListConditionType;
import com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;
import com.anhtin.tmdt.backend.modules.agency.service.CustomerPriceSyncService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
@RequiredArgsConstructor
public class PriceAssignmentService {

    private final PriceAssignmentVoucherRepository voucherRepository;
    private final AgencyPriceListRepository agencyPriceListRepository;
    private final PriceListConditionRepository conditionRepository;

    @Autowired
    @Lazy
    private CustomerPriceSyncService customerPriceSyncService;

    @Transactional
    public void processPendingVouchers() {
        LocalDateTime now = LocalDateTime.now();
        List<PriceAssignmentVoucher> pending = voucherRepository.findByStatusAndScheduledAtBefore(VoucherStatus.PENDING, now);
        if (!pending.isEmpty()) {
            System.out.println(">> Found " + pending.size() + " pending assignments to process.");
        }
        
        for (PriceAssignmentVoucher voucher : pending) {
            try {
                applyVoucher(voucher);
                System.out.println(">> Successfully applied voucher: " + voucher.getName());
            } catch (Exception e) {
                System.err.println(">> Failed to apply voucher: " + voucher.getName() + " - " + e.getMessage());
                e.printStackTrace();
            }
        }
    }

    @Transactional
    public void applyVoucher(PriceAssignmentVoucher voucher) {
        System.out.println(">> Applying voucher type: " + voucher.getAssignmentType());
        if (voucher.getAssignmentType() == PriceListConditionType.DIRECT_AGENCY) {
            Agency agency = voucher.getAgency();
            if (agency != null) {
                System.out.println(">> Creating AgencyPriceList for agency: " + agency.getName());
                


                // XÃ³a Táº¤T Cáº¢ báº£n ghi cÅ© cá»§a Ä‘áº¡i lÃ½ nÃ y Ä‘á»ƒ trÃ¡nh vi pháº¡m unique constraint
                agencyPriceListRepository.deleteByAgencyId(agency.getId());

                AgencyPriceList apl = new AgencyPriceList();
                apl.setAgency(agency);
                apl.setPriceList(voucher.getPriceList());
                apl.setEffectiveFrom(voucher.getScheduledAt());
                agencyPriceListRepository.save(apl);
            } else {
                System.err.println(">> Voucher DIRECT_AGENCY but agency is null! Skipping.");
            }
        } else {
            // Táº¡o báº£n ghi Ä‘iá»u kiá»‡n
            System.out.println(">> Creating PriceListCondition for type: " + voucher.getAssignmentType());
            PriceListCondition plc = new PriceListCondition();
            plc.setPriceList(voucher.getPriceList());
            plc.setConditionType(voucher.getAssignmentType());
            plc.setRankLevel(voucher.getRankLevel());
            plc.setCustomerGroup(voucher.getCustomerGroup());
            plc.setUser(voucher.getCustomer());
            plc.setEffectiveFrom(voucher.getScheduledAt());
            plc.setPriority(100); // Máº·c Ä‘á»‹nh Æ°u tiÃªn cao cho cÃ¡c lá»‡nh set thá»§ cÃ´ng
            conditionRepository.save(plc);
        }

        voucher.setStatus(VoucherStatus.APPLIED);
        voucher.setAppliedAt(LocalDateTime.now());
        voucherRepository.save(voucher);

        final Long plId = voucher.getPriceList().getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                customerPriceSyncService.syncAllPricesForPriceList(plId, null, "PRICE_ASSIGNMENT_CHANGED");
            }
        });
    }

    @Transactional
    public void stopVoucher(Long voucherId) {
        if (voucherId == null) throw new RuntimeException("ID cannot be null");
        PriceAssignmentVoucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        if (voucher.getStatus() != VoucherStatus.APPLIED) {
            throw new RuntimeException("Chá»‰ cÃ³ thá»ƒ dá»«ng voucher Ä‘Ã£ Ã¡p dá»¥ng");
        }

        voucher.setStatus(VoucherStatus.STOPPED);
        voucherRepository.save(voucher);

        if (voucher.getAssignmentType() == PriceListConditionType.DIRECT_AGENCY) {
            Agency agency = voucher.getAgency();
            if (agency != null) {
                agencyPriceListRepository.deleteByAgencyId(agency.getId());
                
                // KhÃ´i phá»¥c báº±ng cÃ¡ch tÃ¬m voucher APPLIED gáº§n nháº¥t cho agency nÃ y
                voucherRepository.findAllByOrderByCreatedAtDesc().stream()
                        .filter(v -> v.getStatus() == VoucherStatus.APPLIED)
                        .filter(v -> v.getAssignmentType() == PriceListConditionType.DIRECT_AGENCY)
                        .filter(v -> v.getAgency() != null && v.getAgency().getId().equals(agency.getId()))
                        .sorted((v1, v2) -> v2.getScheduledAt().compareTo(v1.getScheduledAt()))
                        .findFirst()
                        .ifPresent(lastVoucher -> {
                            AgencyPriceList restored = new AgencyPriceList();
                            restored.setAgency(agency);
                            restored.setPriceList(lastVoucher.getPriceList());
                            restored.setEffectiveFrom(LocalDateTime.now());
                            agencyPriceListRepository.save(restored);
                        });
            }
        } else {
            // For condition types, we delete the exact condition created by this voucher at its scheduledAt
            // Since we didn't link the ID, we find it by matching type, rank, group, user and effectiveFrom
            List<PriceListCondition> conditions = conditionRepository.findAll();
            for (PriceListCondition c : conditions) {
                if (c.getConditionType() == voucher.getAssignmentType() &&
                    c.getEffectiveFrom().equals(voucher.getScheduledAt()) &&
                    c.getPriceList().getId().equals(voucher.getPriceList().getId())) {
                    
                    boolean match = true;
                    if (voucher.getRankLevel() != null && !voucher.getRankLevel().equals(c.getRankLevel())) match = false;
                    if (voucher.getCustomerGroup() != null && (c.getCustomerGroup() == null || !voucher.getCustomerGroup().getId().equals(c.getCustomerGroup().getId()))) match = false;
                    if (voucher.getCustomer() != null && (c.getUser() == null || !voucher.getCustomer().getId().equals(c.getUser().getId()))) match = false;
                    
                    if (match) {
                        conditionRepository.delete(c);
                        break;
                    }
                }
            }
        }

        final Long plId = voucher.getPriceList().getId();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                customerPriceSyncService.syncAllPricesForPriceList(plId, null, "PRICE_ASSIGNMENT_STOPPED");
            }
        });
    }

    @Transactional
    public void reactivateVoucher(Long voucherId, LocalDateTime newScheduledAt) {
        if (voucherId == null) throw new RuntimeException("ID cannot be null");
        PriceAssignmentVoucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        if (voucher.getStatus() != VoucherStatus.STOPPED) {
            throw new RuntimeException("Chá»‰ cÃ³ thá»ƒ kÃ­ch hoáº¡t láº¡i voucher Ä‘Ã£ dá»«ng");
        }

        // Cáº­p nháº­t láº¡i thá»i gian lÃªn lá»‹ch (náº¿u khÃ´ng truyá»n vÃ o thÃ¬ máº·c Ä‘á»‹nh lÃ  bÃ¢y giá»)
        LocalDateTime targetTime = newScheduledAt != null ? newScheduledAt : LocalDateTime.now();
        voucher.setScheduledAt(targetTime);

        if (targetTime.isAfter(LocalDateTime.now())) {
            // Náº¿u lÃ  háº¹n giá» trong tÆ°Æ¡ng lai -> Chuyá»ƒn vá» tráº¡ng thÃ¡i PENDING Ä‘á»ƒ Scheduler xá»­ lÃ½
            voucher.setStatus(VoucherStatus.PENDING);
            voucher.setAppliedAt(null);
            voucherRepository.save(voucher);
        } else {
            // Náº¿u lÃ  kÃ­ch hoáº¡t ngay (hoáº·c thá»i gian quÃ¡ khá»©) -> Ãp dá»¥ng luÃ´n
            applyVoucher(voucher);
        }
    }
}
