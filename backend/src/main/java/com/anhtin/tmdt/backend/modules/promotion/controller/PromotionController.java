package com.anhtin.tmdt.backend.modules.promotion.controller;

import com.anhtin.tmdt.backend.modules.promotion.service.PromotionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.common.dto.PromotionDTO;
import com.anhtin.tmdt.backend.modules.promotion.entity.Promotion;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.promotion.dto.PromotionRequest;

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
    public ResponseEntity<?> createPromotion(@Valid @RequestBody com.anhtin.tmdt.backend.modules.promotion.dto.PromotionRequest request) {
        try {
            com.anhtin.tmdt.backend.modules.common.dto.PromotionDTO dto = promotionService.createPromotion(request);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }

    /**
     * Lấy tất cả mã giảm giá đang hoạt động.
     */
    @GetMapping
    public ResponseEntity<List<com.anhtin.tmdt.backend.modules.common.dto.PromotionDTO>> getActivePromotions() {
        return ResponseEntity.ok(promotionService.getActivePromotions());
    }

    /**
     * Lấy voucher toàn sàn (do Công ty phát).
     */
    @GetMapping("/platform")
    public ResponseEntity<List<com.anhtin.tmdt.backend.modules.common.dto.PromotionDTO>> getPlatformPromotions() {
        return ResponseEntity.ok(promotionService.getPlatformPromotions());
    }

    /**
     * Lấy voucher riêng của Đại lý.
     */
    @GetMapping("/agency/{agencyId}")
    public ResponseEntity<List<com.anhtin.tmdt.backend.modules.common.dto.PromotionDTO>> getAgencyPromotions(@PathVariable Long agencyId) {
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
            return ResponseEntity.ok(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse("Giảm: " + discount + "đ"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }

    /**
     * Vô hiệu hoá mã giảm giá.
     */
    @PreAuthorize("hasRole('COMPANY')")
    @PutMapping("/{id}/disable")
    public ResponseEntity<?> disablePromotion(@PathVariable Long id) {
        try {
            promotionService.disablePromotion(id);
            return ResponseEntity.ok(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse("Đã vô hiệu hoá mã giảm giá"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }
}
