package com.anhtin.tmdt.backend.modules.common.controller;

import com.anhtin.tmdt.backend.modules.common.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller exposing system configuration values.
 * Currently provides GET and PUT for the discountMaxDays setting.
 * Security (admin role) should be enforced via method security or filters (not implemented here).
 */
@RestController
@RequestMapping("/api/config")
public class SystemConfigController {

    @Autowired
    private SystemConfigService systemConfigService;

    /**
     * Get the current discount max days value.
     */
    @GetMapping("/discount-max-days")
    public ResponseEntity<Integer> getDiscountMaxDays() {
        int days = systemConfigService.getDiscountMaxDays();
        return ResponseEntity.ok(days);
    }

    /**
     * Update the discount max days value.
     * @param payload JSON object containing "days": integer.
     */
    @PutMapping("/discount-max-days")
    public ResponseEntity<Void> setDiscountMaxDays(@RequestBody DiscountDaysPayload payload) {
        if (payload == null || payload.getDays() == null) {
            return ResponseEntity.badRequest().build();
        }
        // In a real app, retrieve the current authenticated user ID for audit.
        Long adminUserId = null; // placeholder
        systemConfigService.setConfigValue("discount.max.days", String.valueOf(payload.getDays()), adminUserId);
        return ResponseEntity.ok().build();
    }

    // Simple DTO for the PUT request body
    public static class DiscountDaysPayload {
        private Integer days;
        public Integer getDays() { return days; }
        public void setDays(Integer days) { this.days = days; }
    }
}
