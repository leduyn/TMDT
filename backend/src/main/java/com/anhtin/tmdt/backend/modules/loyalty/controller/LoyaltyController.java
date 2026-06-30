package com.anhtin.tmdt.backend.modules.loyalty.controller;

import com.anhtin.tmdt.backend.modules.loyalty.service.LoyaltyService;
import com.anhtin.tmdt.backend.security.services.UserDetailsImpl;
import com.anhtin.tmdt.backend.security.services.AgencyUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.loyalty.entity.PointTransaction;
import com.anhtin.tmdt.backend.modules.common.dto.LoyaltyPointDTO;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/loyalty")
public class LoyaltyController {

    @Autowired
    private LoyaltyService loyaltyService;

    private Long resolveUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            return ((UserDetailsImpl) principal).getId();
        } else if (principal instanceof AgencyUserDetails) {
            return ((AgencyUserDetails) principal).getId();
        }
        return null;
    }

    /**
     * Xem số dư điểm tích lũy.
     */
    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(Authentication authentication) {
        try {
            Long userId = resolveUserId(authentication);
            if (userId == null) throw new RuntimeException("User ID not found");
            com.anhtin.tmdt.backend.modules.common.dto.LoyaltyPointDTO dto = loyaltyService.getBalance(userId);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
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
            Long userId = resolveUserId(authentication);
            if (userId == null) throw new RuntimeException("User ID not found");
            Page<com.anhtin.tmdt.backend.modules.loyalty.entity.PointTransaction> history = loyaltyService.getHistory(
                    userId, PageRequest.of(page, size));
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new com.anhtin.tmdt.backend.modules.common.dto.MessageResponse(e.getMessage()));
        }
    }
}
