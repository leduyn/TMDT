package com.anhtin.tmdt.backend.modules.price.controller;

import com.anhtin.tmdt.backend.modules.price.dto.PriceOverrideVoucherRequest;
import com.anhtin.tmdt.backend.modules.common.dto.PriceOverrideVoucherDTO;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.price.service.PriceOverrideVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-override-vouchers")
public class PriceOverrideVoucherController {

    @Autowired
    private PriceOverrideVoucherService voucherService;

    @GetMapping
    public List<PriceOverrideVoucherDTO> getAllVouchers() {
        return voucherService.getAllVouchers();
    }

    @GetMapping("/page")
    public Page<PriceOverrideVoucherDTO> getVouchersPage(@PageableDefault(size = 20) Pageable pageable) {
        return voucherService.getAllVouchers(pageable);
    }

    @GetMapping("/{id}")
    public PriceOverrideVoucherDTO getVoucherById(@PathVariable Long id) {
        return voucherService.getVoucherById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public PriceOverrideVoucherDTO createVoucher(@RequestBody PriceOverrideVoucherRequest request) {
        return voucherService.createVoucher(request);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> cancelVoucher(@PathVariable Long id) {
        voucherService.cancelVoucher(id);
        return ResponseEntity.ok(new MessageResponse("Cancelled override voucher successfully"));
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> applyVoucher(@PathVariable Long id) {
        voucherService.applyVoucher(id);
        return ResponseEntity.ok(new MessageResponse("Applied override voucher successfully"));
    }
}
