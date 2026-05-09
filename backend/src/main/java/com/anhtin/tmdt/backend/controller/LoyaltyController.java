package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.service.LoyaltyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    @Autowired
    private LoyaltyService loyaltyService;

    /**
     * Xem số dư điểm tích lũy.
     */
    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(Authentication authentication) {
        try {
            com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            if (userId == null) throw new RuntimeException("User ID not found");
            com.anhtin.tmdt.backend.dto.response.LoyaltyPointDTO dto = loyaltyService.getBalance(userId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.dto.response.MessageResponse(e.getMessage()));
        }
    }

    /**
     * Xem lịch sử giao dịch điểm (phân trang).
     */
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getId();
            if (userId == null) throw new RuntimeException("User ID not found");
            Page<com.anhtin.tmdt.backend.entity.PointTransaction> history = loyaltyService.getHistory(
                    userId, PageRequest.of(page, size));
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.dto.response.MessageResponse(e.getMessage()));
        }
    }
}
