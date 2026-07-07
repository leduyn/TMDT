package com.anhtin.tmdt.backend.modules.common.controller;

import com.anhtin.tmdt.backend.modules.common.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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

    // ─────────────────────────────────────────────────────────────────────────
    // Retail trend display config
    // ─────────────────────────────────────────────────────────────────────────

    /** Keys for retail price trend display */
    private static final String KEY_INCREASE_LABEL = "retail.trend.increase.label";
    private static final String KEY_INCREASE_COLOR = "retail.trend.increase.color";
    private static final String KEY_DECREASE_LABEL = "retail.trend.decrease.label";
    private static final String KEY_DECREASE_COLOR = "retail.trend.decrease.color";
    private static final String KEY_NEUTRAL_LABEL = "retail.trend.neutral.label";
    private static final String KEY_NEUTRAL_COLOR = "retail.trend.neutral.color";

    /**
     * Get the full retail trend display config as a JSON object.
     */
    @GetMapping("/retail-trend")
    public ResponseEntity<RetailTrendConfig> getRetailTrendConfig() {
        RetailTrendConfig cfg = new RetailTrendConfig();
        String incLabel = systemConfigService.getConfigValue(KEY_INCREASE_LABEL);
        cfg.setIncreaseLabel(incLabel != null ? incLabel : "Tăng thêm");
        String incColor = systemConfigService.getConfigValue(KEY_INCREASE_COLOR);
        cfg.setIncreaseColor(incColor != null ? incColor : "#ef4444");
        String decLabel = systemConfigService.getConfigValue(KEY_DECREASE_LABEL);
        cfg.setDecreaseLabel(decLabel != null ? decLabel : "Giảm đi");
        String decColor = systemConfigService.getConfigValue(KEY_DECREASE_COLOR);
        cfg.setDecreaseColor(decColor != null ? decColor : "#10b981");
        String neuLabel = systemConfigService.getConfigValue(KEY_NEUTRAL_LABEL);
        cfg.setNeutralLabel(neuLabel != null ? neuLabel : "Giữ nguyên");
        String neuColor = systemConfigService.getConfigValue(KEY_NEUTRAL_COLOR);
        cfg.setNeutralColor(neuColor != null ? neuColor : "#94a3b8");
        return ResponseEntity.ok(cfg);
    }

    /**
     * Update the retail trend display config.
     */
    @PutMapping("/retail-trend")
    public ResponseEntity<Void> setRetailTrendConfig(@RequestBody RetailTrendConfig payload) {
        if (payload == null) return ResponseEntity.badRequest().build();
        Long adminUserId = null;
        if (payload.getIncreaseLabel() != null)
            systemConfigService.setConfigValue(KEY_INCREASE_LABEL, payload.getIncreaseLabel(), adminUserId);
        if (payload.getIncreaseColor() != null)
            systemConfigService.setConfigValue(KEY_INCREASE_COLOR, payload.getIncreaseColor(), adminUserId);
        if (payload.getDecreaseLabel() != null)
            systemConfigService.setConfigValue(KEY_DECREASE_LABEL, payload.getDecreaseLabel(), adminUserId);
        if (payload.getDecreaseColor() != null)
            systemConfigService.setConfigValue(KEY_DECREASE_COLOR, payload.getDecreaseColor(), adminUserId);
        if (payload.getNeutralLabel() != null)
            systemConfigService.setConfigValue(KEY_NEUTRAL_LABEL, payload.getNeutralLabel(), adminUserId);
        if (payload.getNeutralColor() != null)
            systemConfigService.setConfigValue(KEY_NEUTRAL_COLOR, payload.getNeutralColor(), adminUserId);
        return ResponseEntity.ok().build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Registration category level config
    // ─────────────────────────────────────────────────────────────────────────

    private static final String KEY_REG_CATEGORY_LEVEL = "registration.category.level";

    @GetMapping("/registration-category-level")
    public ResponseEntity<Integer> getRegistrationCategoryLevel() {
        String val = systemConfigService.getConfigValue(KEY_REG_CATEGORY_LEVEL);
        int level = val != null ? Integer.parseInt(val) : 1;
        return ResponseEntity.ok(level);
    }

    @PutMapping("/registration-category-level")
    public ResponseEntity<Void> setRegistrationCategoryLevel(@RequestBody Map<String, Integer> body) {
        Integer level = body.get("level");
        if (level == null) return ResponseEntity.badRequest().build();
        systemConfigService.setConfigValue(KEY_REG_CATEGORY_LEVEL, String.valueOf(level), null);
        return ResponseEntity.ok().build();
    }

    /** DTO for retail trend config */
    public static class RetailTrendConfig {
        private String increaseLabel;
        private String increaseColor;
        private String decreaseLabel;
        private String decreaseColor;
        private String neutralLabel;
        private String neutralColor;

        public String getIncreaseLabel() { return increaseLabel; }
        public void setIncreaseLabel(String v) { this.increaseLabel = v; }
        public String getIncreaseColor() { return increaseColor; }
        public void setIncreaseColor(String v) { this.increaseColor = v; }
        public String getDecreaseLabel() { return decreaseLabel; }
        public void setDecreaseLabel(String v) { this.decreaseLabel = v; }
        public String getDecreaseColor() { return decreaseColor; }
        public void setDecreaseColor(String v) { this.decreaseColor = v; }
        public String getNeutralLabel() { return neutralLabel; }
        public void setNeutralLabel(String v) { this.neutralLabel = v; }
        public String getNeutralColor() { return neutralColor; }
        public void setNeutralColor(String v) { this.neutralColor = v; }
    }
}
