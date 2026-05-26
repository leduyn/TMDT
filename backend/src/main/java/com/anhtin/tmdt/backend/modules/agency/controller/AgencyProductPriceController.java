package com.anhtin.tmdt.backend.modules.agency.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import com.anhtin.tmdt.backend.modules.agency.dto.AgencyProductPriceDTO;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyProductPriceHistoryDTO;
import com.anhtin.tmdt.backend.modules.agency.service.AgencyProductPriceService;
import com.anhtin.tmdt.backend.modules.agency.service.CustomerPriceSyncService;

@RestController
@RequestMapping("/api/customer-prices")
public class AgencyProductPriceController {

    @Autowired
    private AgencyProductPriceService agencyProductPriceService;
    
    @Autowired
    private CustomerPriceSyncService customerPriceSyncService;

    @GetMapping
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<List<AgencyProductPriceDTO>> getPricesForAgency(
            @RequestParam Long agencyId,
            @RequestParam(required = false) Integer days) {
        return ResponseEntity.ok(agencyProductPriceService.getPricesForAgency(agencyId, days));
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<List<AgencyProductPriceHistoryDTO>> getHistoryForAgencyProduct(
            @RequestParam Long agencyId, 
            @RequestParam Long productId) {
        return ResponseEntity.ok(agencyProductPriceService.getHistoryForAgencyProduct(agencyId, productId));
    }

    @PostMapping("/override")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> overridePrice(
            @RequestParam Long agencyId,
            @RequestParam Long productId,
            @RequestParam Double price,
            @RequestAttribute(value = "userId", required = false) Long userId) {
        agencyProductPriceService.overridePrice(agencyId, productId, price, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/remove-override")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> removeOverride(
            @RequestParam Long agencyId,
            @RequestParam Long productId,
            @RequestAttribute(value = "userId", required = false) Long userId) {
        agencyProductPriceService.removeOverride(agencyId, productId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/rollback/{historyId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> rollbackPrice(
            @PathVariable Long historyId,
            @RequestAttribute(value = "userId", required = false) Long userId) {
        agencyProductPriceService.rollbackPrice(historyId, userId);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/sync/{agencyId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> syncAgencyPrices(
            @PathVariable Long agencyId,
            @RequestAttribute(value = "userId", required = false) Long userId) {
        customerPriceSyncService.syncAllPricesForAgency(agencyId, userId, "MANUAL_SYNC");
        return ResponseEntity.ok().build();
    }

    @GetMapping("/export/{agencyId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<InputStreamResource> exportPrices(@PathVariable Long agencyId) {
        InputStreamResource file = new InputStreamResource(agencyProductPriceService.exportPricesToExcel(agencyId));
        String filename = "BangGiaKhachHang_" + agencyId + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @PostMapping("/import/{agencyId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public ResponseEntity<?> importPrices(
            @PathVariable Long agencyId,
            @RequestParam("file") MultipartFile file,
            @RequestAttribute(value = "userId", required = false) Long userId) {
        String result = agencyProductPriceService.importPricesFromExcel(agencyId, file, userId);
        return ResponseEntity.ok(result);
    }
}
