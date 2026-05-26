package com.anhtin.tmdt.backend.modules.price.controller;

import com.anhtin.tmdt.backend.modules.price.dto.PriceUpdateVoucherRequest;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.common.dto.PriceUpdateVoucherDTO;
import com.anhtin.tmdt.backend.modules.price.service.PriceUpdateVoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/price-vouchers")
public class PriceUpdateVoucherController {

    @Autowired
    private PriceUpdateVoucherService voucherService;

    @GetMapping
    public List<PriceUpdateVoucherDTO> getAllVouchers() {
        return voucherService.getAllVouchers();
    }

    @GetMapping("/{id}")
    public PriceUpdateVoucherDTO getVoucherById(@PathVariable Long id) {
        return voucherService.getVoucherById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public PriceUpdateVoucherDTO createVoucher(@RequestBody PriceUpdateVoucherRequest request) {
        return voucherService.createVoucher(request);
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> cancelVoucher(@PathVariable Long id) {
        voucherService.cancelVoucher(id);
        return ResponseEntity.ok(new MessageResponse("Cancelled voucher successfully"));
    }

    @PostMapping("/{id}/apply")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> applyVoucher(@PathVariable Long id) {
        voucherService.applyVoucher(id);
        return ResponseEntity.ok(new MessageResponse("Applied voucher successfully"));
    }

    @GetMapping("/active-history/agency/{agencyId}")
    public List<PriceUpdateVoucherDTO> getActiveHistoryForAgency(@PathVariable Long agencyId) {
        return voucherService.getAppliedVouchersForAgency(agencyId);
    }
}
