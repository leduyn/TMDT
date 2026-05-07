package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.entity.*;
import com.anhtin.tmdt.backend.repository.AgencyPriceListRepository;
import com.anhtin.tmdt.backend.repository.PriceAssignmentVoucherRepository;
import com.anhtin.tmdt.backend.repository.PriceListConditionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PriceAssignmentService {

    private final PriceAssignmentVoucherRepository voucherRepository;
    private final AgencyPriceListRepository agencyPriceListRepository;
    private final PriceListConditionRepository conditionRepository;

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
                


                // Xóa TẤT CẢ bản ghi cũ của đại lý này để tránh vi phạm unique constraint
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
            // Tạo bản ghi điều kiện
            System.out.println(">> Creating PriceListCondition for type: " + voucher.getAssignmentType());
            PriceListCondition plc = new PriceListCondition();
            plc.setPriceList(voucher.getPriceList());
            plc.setConditionType(voucher.getAssignmentType());
            plc.setRankLevel(voucher.getRankLevel());
            plc.setCustomerGroup(voucher.getCustomerGroup());
            plc.setUser(voucher.getCustomer());
            plc.setEffectiveFrom(voucher.getScheduledAt());
            plc.setPriority(100); // Mặc định ưu tiên cao cho các lệnh set thủ công
            conditionRepository.save(plc);
        }

        voucher.setStatus(VoucherStatus.APPLIED);
        voucher.setAppliedAt(LocalDateTime.now());
        voucherRepository.save(voucher);
    }

    @Transactional
    public void stopVoucher(Long voucherId) {
        if (voucherId == null) throw new RuntimeException("ID cannot be null");
        PriceAssignmentVoucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        if (voucher.getStatus() != VoucherStatus.APPLIED) {
            throw new RuntimeException("Chỉ có thể dừng voucher đã áp dụng");
        }

        voucher.setStatus(VoucherStatus.STOPPED);
        voucherRepository.save(voucher);

        if (voucher.getAssignmentType() == PriceListConditionType.DIRECT_AGENCY) {
            Agency agency = voucher.getAgency();
            if (agency != null) {
                agencyPriceListRepository.deleteByAgencyId(agency.getId());
                
                // Khôi phục bằng cách tìm voucher APPLIED gần nhất cho agency này
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
    }

    @Transactional
    public void reactivateVoucher(Long voucherId, LocalDateTime newScheduledAt) {
        if (voucherId == null) throw new RuntimeException("ID cannot be null");
        PriceAssignmentVoucher voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new RuntimeException("Voucher not found"));

        if (voucher.getStatus() != VoucherStatus.STOPPED) {
            throw new RuntimeException("Chỉ có thể kích hoạt lại voucher đã dừng");
        }

        // Cập nhật lại thời gian lên lịch (nếu không truyền vào thì mặc định là bây giờ)
        LocalDateTime targetTime = newScheduledAt != null ? newScheduledAt : LocalDateTime.now();
        voucher.setScheduledAt(targetTime);

        if (targetTime.isAfter(LocalDateTime.now())) {
            // Nếu là hẹn giờ trong tương lai -> Chuyển về trạng thái PENDING để Scheduler xử lý
            voucher.setStatus(VoucherStatus.PENDING);
            voucher.setAppliedAt(null);
            voucherRepository.save(voucher);
        } else {
            // Nếu là kích hoạt ngay (hoặc thời gian quá khứ) -> Áp dụng luôn
            applyVoucher(voucher);
        }
    }
}
