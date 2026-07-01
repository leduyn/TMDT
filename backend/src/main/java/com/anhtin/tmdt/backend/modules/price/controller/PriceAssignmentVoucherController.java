package com.anhtin.tmdt.backend.modules.price.controller;

import com.anhtin.tmdt.backend.modules.price.dto.PriceAssignmentVoucherRequest;
import com.anhtin.tmdt.backend.modules.common.dto.PriceAssignmentVoucherDTO;
import com.anhtin.tmdt.backend.modules.price.entity.PriceAssignmentVoucher;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

import java.util.List;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.price.service.PriceAssignmentService;
import com.anhtin.tmdt.backend.modules.price.repository.PriceAssignmentVoucherRepository;
import com.anhtin.tmdt.backend.modules.price.repository.PriceListRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import com.anhtin.tmdt.backend.modules.customer.repository.CustomerGroupRepository;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/price-assignment-vouchers")
@RequiredArgsConstructor
public class PriceAssignmentVoucherController {

    private final PriceAssignmentVoucherRepository voucherRepository;
    private final PriceListRepository priceListRepository;
    private final AgencyRepository agencyRepository;
    private final CustomerGroupRepository customerGroupRepository;
    private final UserRepository userRepository;
    private final com.anhtin.tmdt.backend.modules.price.service.PriceAssignmentService priceAssignmentService;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/fix-db")
    @PreAuthorize("permitAll()")
    public ResponseEntity<?> fixDb() {
        jdbcTemplate.execute("ALTER TABLE price_assignment_vouchers DROP CONSTRAINT IF EXISTS price_assignment_vouchers_status_check;");
        return ResponseEntity.ok("Database constraint dropped successfully");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public Page<PriceAssignmentVoucherDTO> getAllVouchers(@PageableDefault(size = 20) Pageable pageable) {
        return voucherRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(PriceAssignmentVoucherDTO::new);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public PriceAssignmentVoucherDTO createVoucher(@RequestBody PriceAssignmentVoucherRequest request) {
        PriceAssignmentVoucher voucher = new PriceAssignmentVoucher();
        voucher.setName(request.getName());
        Long plId = request.getPriceListId();
        if (plId == null) throw new RuntimeException("Price List ID is required");
        voucher.setPriceList(priceListRepository.findById(plId).orElseThrow());
        voucher.setAssignmentType(request.getAssignmentType());
        voucher.setRankLevel(request.getRankLevel());
        Long agencyId = request.getAgencyId();
        if (agencyId != null) {
            voucher.setAgency(agencyRepository.findById(agencyId).orElse(null));
        }
        Long groupId = request.getCustomerGroupId();
        if (groupId != null) {
            voucher.setCustomerGroup(customerGroupRepository.findById(groupId).orElse(null));
        }
        Long customerId = request.getCustomerId();
        if (customerId != null) {
            voucher.setCustomer(userRepository.findById(customerId).orElse(null));
        }
        voucher.setScheduledAt(request.getScheduledAt());
        return new PriceAssignmentVoucherDTO(voucherRepository.save(voucher));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> cancelVoucher(@PathVariable @org.springframework.lang.NonNull Long id) {
        return voucherRepository.findById(id).map(v -> {
            if (v.getStatus() == com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus.PENDING) {
                v.setStatus(com.anhtin.tmdt.backend.modules.common.entity.VoucherStatus.CANCELLED);
                voucherRepository.save(v);
                return ResponseEntity.ok(java.util.Map.of("message", "Thành công"));
            }
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Chỉ có thể huỷ voucher PENDING"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/stop")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> stopVoucher(@PathVariable @org.springframework.lang.NonNull Long id) {
        try {
            priceAssignmentService.stopVoucher(id);
            return ResponseEntity.ok(java.util.Map.of("message", "Thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/reactivate")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> reactivateVoucher(
            @PathVariable @org.springframework.lang.NonNull Long id,
            @RequestBody(required = false) java.util.Map<String, String> body) {
        try {
            LocalDateTime newScheduledAt = null;
            if (body != null && body.get("scheduledAt") != null) {
                newScheduledAt = LocalDateTime.parse(body.get("scheduledAt"));
            }
            priceAssignmentService.reactivateVoucher(id, newScheduledAt);
            return ResponseEntity.ok(java.util.Map.of("message", "Thành công"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }
}
