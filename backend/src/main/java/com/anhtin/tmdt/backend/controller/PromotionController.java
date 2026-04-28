package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.dto.request.PromotionRequest;
import com.anhtin.tmdt.backend.dto.response.MessageResponse;
import com.anhtin.tmdt.backend.dto.response.PromotionDTO;
import com.anhtin.tmdt.backend.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    /**
     * Tạo mã khuyến mãi (COMPANY hoặc AGENCY).
     */
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    @PostMapping
    public ResponseEntity<?> createPromotion(@Valid @RequestBody PromotionRequest request) {
        try {
            PromotionDTO dto = promotionService.createPromotion(request);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Lấy tất cả mã giảm giá đang hoạt động.
     */
    @GetMapping
    public ResponseEntity<List<PromotionDTO>> getActivePromotions() {
        return ResponseEntity.ok(promotionService.getActivePromotions());
    }

    /**
     * Lấy voucher toàn sàn (do Công ty phát).
     */
    @GetMapping("/platform")
    public ResponseEntity<List<PromotionDTO>> getPlatformPromotions() {
        return ResponseEntity.ok(promotionService.getPlatformPromotions());
    }

    /**
     * Lấy voucher riêng của Đại lý.
     */
    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<List<PromotionDTO>> getAgencyPromotions(@PathVariable @NonNull Long agencyId) {
        return ResponseEntity.ok(promotionService.getAgencyPromotions(agencyId));
    }

    /**
     * Validate mã giảm giá (preview giá trị giảm).
     */
    @GetMapping("/validate")
    public ResponseEntity<?> validatePromotion(
            @RequestParam String code,
            @RequestParam Double orderTotal) {
        try {
            double discount = promotionService.validateAndCalculateDiscount(code, orderTotal);
            return ResponseEntity.ok(new MessageResponse("Giảm: " + discount + "đ"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Vô hiệu hoá mã giảm giá.
     */
    @PreAuthorize("hasRole('COMPANY')")
    @PutMapping("/{id}/disable")
    public ResponseEntity<?> disablePromotion(@PathVariable @NonNull Long id) {
        try {
            promotionService.disablePromotion(id);
            return ResponseEntity.ok(new MessageResponse("Đã vô hiệu hoá mã giảm giá"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
