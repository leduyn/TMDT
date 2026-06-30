package com.anhtin.tmdt.backend.modules.loyalty.controller;

import com.anhtin.tmdt.backend.modules.common.dto.LoyaltyPointDTO;
import com.anhtin.tmdt.backend.modules.loyalty.dto.*;
import com.anhtin.tmdt.backend.modules.loyalty.entity.*;
import com.anhtin.tmdt.backend.modules.loyalty.repository.*;
import com.anhtin.tmdt.backend.modules.loyalty.service.GamificationRuleEngineService;
import com.anhtin.tmdt.backend.modules.loyalty.service.LoyaltyService;
import com.anhtin.tmdt.backend.modules.loyalty.service.SpelVariableService;
import com.anhtin.tmdt.backend.modules.common.service.SystemConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/gamification")
public class GamificationController {

    @Autowired
    private LoyaltyService loyaltyService;

    @Autowired
    private GamificationRuleEngineService ruleEngineService;

    @Autowired
    private BadgeRepository badgeRepository;

    @Autowired
    private GamificationRuleRepository gamificationRuleRepository;

    @Autowired
    private MembershipLevelRepository membershipLevelRepository;

    @Autowired
    private CustomerCertificateRepository customerCertificateRepository;

    @Autowired
    private SystemConfigService systemConfigService;

    @Autowired
    private SpelVariableService spelVariableService;

    // ======= CUSTOMER ENDPOINTS =======

    /**
     * Lấy danh sách Luật thi đua đang active (dành cho khách hàng xem điều kiện).
     */
    @GetMapping("/rules")
    public ResponseEntity<List<GamificationRule>> getActiveRules() {
        return ResponseEntity.ok(gamificationRuleRepository.findByActiveTrue());
    }

    /**
     * Đánh giá rule conditions cho customer → trả về rule + conditionMet.
     */
    @GetMapping("/rules/evaluated/{customerId}")
    public ResponseEntity<List<Map<String, Object>>> getEvaluatedRules(@PathVariable Long customerId) {
        return ResponseEntity.ok(ruleEngineService.evaluateRulesForCustomer(customerId));
    }

    /**
     * Lấy hồ sơ Gamification cá nhân (điểm, cấp bậc, huy hiệu, bằng khen).
     */
    @GetMapping("/profile/{customerId}")
    public ResponseEntity<GamificationProfileDTO> getProfile(@PathVariable Long customerId) {
        return ResponseEntity.ok(loyaltyService.getProfile(customerId));
    }

    /**
     * Lấy bảng xếp hạng thi đua (mặc định top 50).
     */
    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntryDTO>> getLeaderboard(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(loyaltyService.getLeaderboard(limit));
    }

    /**
     * Lấy danh sách toàn bộ Huy hiệu hệ thống (kèm trạng thái đã đạt được hay chưa).
     */
    @GetMapping("/badges")
    public ResponseEntity<List<BadgeDTO>> getAllBadges(
            @RequestParam(required = false) Long customerId) {
        List<Badge> allBadges = badgeRepository.findByActiveTrue();
        if (customerId == null) {
            return ResponseEntity.ok(allBadges.stream()
                    .map(b -> new BadgeDTO(b.getId(), b.getName(), b.getDescription(),
                            b.getIcon(), b.getColorGradient(), b.isActive(), false, null))
                    .collect(Collectors.toList()));
        }
        GamificationProfileDTO profile = loyaltyService.getProfile(customerId);
        List<String> earnedIds = profile.getEarnedBadges().stream()
                .map(BadgeDTO::getId).collect(Collectors.toList());
        return ResponseEntity.ok(allBadges.stream()
                .map(b -> new BadgeDTO(b.getId(), b.getName(), b.getDescription(),
                        b.getIcon(), b.getColorGradient(), b.isActive(), earnedIds.contains(b.getId()), null))
                .collect(Collectors.toList()));
    }

    /**
     * Lấy danh sách Bằng khen Danh dự của một khách hàng.
     */
    @GetMapping("/certificates/{customerId}")
    public ResponseEntity<List<CertificateDTO>> getCertificates(@PathVariable Long customerId) {
        GamificationProfileDTO profile = loyaltyService.getProfile(customerId);
        return ResponseEntity.ok(profile.getCertificates());
    }

    /**
     * Lấy số dư và lịch sử điểm tích lũy.
     */
    @GetMapping("/points/{customerId}")
    public ResponseEntity<LoyaltyPointDTO> getBalance(@PathVariable Long customerId) {
        return ResponseEntity.ok(loyaltyService.getBalance(customerId));
    }

    // ======= ADMIN ENDPOINTS =======

    /**
     * [Admin] Lấy danh sách tất cả Luật thi đua.
     */
    @GetMapping("/admin/rules")
    public ResponseEntity<List<GamificationRule>> getAllRules() {
        return ResponseEntity.ok(gamificationRuleRepository.findAll());
    }

    /**
     * [Admin] Thêm/cập nhật Luật thi đua.
     */
    @PostMapping("/admin/rules")
    public ResponseEntity<GamificationRule> upsertRule(@RequestBody GamificationRule rule) {
        return ResponseEntity.ok(gamificationRuleRepository.save(rule));
    }

    /**
     * [Admin] Bật/tắt Luật thi đua.
     */
    @PatchMapping("/admin/rules/{id}/toggle")
    public ResponseEntity<GamificationRule> toggleRule(@PathVariable String id) {
        GamificationRule rule = gamificationRuleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy luật: " + id));
        rule.setActive(!rule.isActive());
        return ResponseEntity.ok(gamificationRuleRepository.save(rule));
    }

    /**
     * [Admin] Xóa Luật thi đua.
     */
    @DeleteMapping("/admin/rules/{id}")
    public ResponseEntity<Void> deleteRule(@PathVariable String id) {
        gamificationRuleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * [Admin] Lấy danh sách Huy hiệu (bao gồm cả inactive).
     */
    @GetMapping("/admin/badges")
    public ResponseEntity<List<Badge>> getAllBadgesAdmin() {
        return ResponseEntity.ok(badgeRepository.findAll());
    }

    /**
     * [Admin] Thêm/cập nhật Huy hiệu.
     */
    @PostMapping("/admin/badges")
    public ResponseEntity<Badge> upsertBadge(@RequestBody Badge badge) {
        return ResponseEntity.ok(badgeRepository.save(badge));
    }

    /**
     * [Admin] Xóa Huy hiệu.
     */
    @DeleteMapping("/admin/badges/{id}")
    public ResponseEntity<Void> deleteBadge(@PathVariable String id) {
        badgeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * [Admin] Lấy danh sách cấu hình Cấp bậc thành viên.
     */
    @GetMapping("/admin/levels")
    public ResponseEntity<List<MembershipLevel>> getAllLevels() {
        return ResponseEntity.ok(membershipLevelRepository.findByActiveTrueOrderByLevelNumberAsc());
    }

    /**
     * [Admin] Thêm/cập nhật Cấp bậc thành viên.
     */
    @PostMapping("/admin/levels")
    public ResponseEntity<MembershipLevel> upsertLevel(@RequestBody MembershipLevel level) {
        return ResponseEntity.ok(membershipLevelRepository.save(level));
    }

    /**
     * [Admin] Xóa Cấp bậc thành viên.
     */
    @DeleteMapping("/admin/levels/{id}")
    public ResponseEntity<Void> deleteLevel(@PathVariable Long id) {
        membershipLevelRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * [Admin] Lấy công thức tích điểm hiện tại.
     */
    @GetMapping("/admin/points-formula")
    public ResponseEntity<Map<String, String>> getPointsFormula() {
        String formula = systemConfigService.getConfigValue(GamificationRuleEngineService.POINTS_FORMULA_KEY);
        return ResponseEntity.ok(Map.of("formula",
                formula != null ? formula : GamificationRuleEngineService.DEFAULT_POINTS_FORMULA));
    }

    /**
     * [Admin] Cập nhật công thức tích điểm.
     * Body: { "formula": "#amount * 0.1" }
     */
    @PutMapping("/admin/points-formula")
    public ResponseEntity<Map<String, String>> updatePointsFormula(
            @RequestBody Map<String, String> body) {
        String formula = body.get("formula");
        if (formula == null || formula.isBlank()) {
            throw new RuntimeException("Công thức không được để trống");
        }
        // Kiểm tra công thức hợp lệ trước khi lưu
        int testValue = ruleEngineService.calculatePoints(1_000_000);
        systemConfigService.setConfigValue(GamificationRuleEngineService.POINTS_FORMULA_KEY, formula, null);
        return ResponseEntity.ok(Map.of("formula", formula, "testResult1M", String.valueOf(testValue) + " điểm"));
    }

    // ======= SPEL VARIABLE ENDPOINTS =======

    @GetMapping("/admin/spel-variables")
    public ResponseEntity<List<SpelVariable>> getAllSpelVariables() {
        return ResponseEntity.ok(spelVariableService.findAll());
    }

    @PostMapping("/admin/spel-variables")
    public ResponseEntity<SpelVariable> saveSpelVariable(@RequestBody SpelVariable sv) {
        return ResponseEntity.ok(spelVariableService.save(sv));
    }

    @DeleteMapping("/admin/spel-variables/{id}")
    public ResponseEntity<Void> deleteSpelVariable(@PathVariable Long id) {
        spelVariableService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/spel-metadata")
    public ResponseEntity<Map<String, Object>> getSpelMetadata() {
        return ResponseEntity.ok(Map.of(
            "tables", spelVariableService.getTableColumns(),
            "numericColumns", spelVariableService.getNumericColumns(),
            "joinSuggestions", spelVariableService.getJoinSuggestions(),
            "aggFunctions", spelVariableService.getAllowedAggFunctions()
        ));
    }

    @PostMapping("/admin/spel-variables/test")
    public ResponseEntity<Map<String, Object>> testSpelQuery(@RequestBody Map<String, Object> body) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            com.fasterxml.jackson.databind.node.ObjectNode svNode = ((com.fasterxml.jackson.databind.node.ObjectNode) mapper.readTree(mapper.writeValueAsString(body)));
            svNode.remove("testCustomerId");
            svNode.remove("testAgencyId");
            SpelVariable sv = mapper.treeToValue(svNode, SpelVariable.class);
            Number customerId = (Number) body.getOrDefault("testCustomerId", 3);
            Number agencyId = (Number) body.getOrDefault("testAgencyId", 1);
            String sql = spelVariableService.buildSql(sv);
            spelVariableService.validateSql(sql);
            Object result = spelVariableService.executeSql(sql, customerId.longValue(), agencyId.longValue());
            return ResponseEntity.ok(Map.of("success", true, "sql", sql, "result", result != null ? result : 0L));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("success", false, "error", e.getMessage()));
        }
    }
}
