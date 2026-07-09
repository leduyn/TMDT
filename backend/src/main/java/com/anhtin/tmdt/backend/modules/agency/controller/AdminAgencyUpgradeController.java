package com.anhtin.tmdt.backend.modules.agency.controller;

import com.anhtin.tmdt.backend.modules.agency.dto.*;
import com.anhtin.tmdt.backend.modules.agency.service.AgencyService;
import com.anhtin.tmdt.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/agencies")
@CrossOrigin(origins = "*")
public class AdminAgencyUpgradeController {

    @Autowired
    private AgencyService agencyService;

    @GetMapping("/upgrade-requests")
    @PreAuthorize("hasRole('COMPANY')")
    public List<Map<String, Object>> getUpgradeRequests() {
        return agencyService.getUpgradeRequests();
    }

    @PutMapping("/{historyId}/approve-upgrade")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> approveUpgrade(
            @PathVariable Long historyId,
            @RequestBody ApproveUpgradeRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl user = (UserDetailsImpl) auth.getPrincipal();
            agencyService.approveUpgrade(historyId, request, user.getId(), user.getUsername());
            return ResponseEntity.ok(Map.of("message", request.isApproved()
                    ? "Đã duyệt nâng cấp lên khách sỉ"
                    : "Đã từ chối yêu cầu nâng cấp"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/retail")
    @PreAuthorize("hasRole('COMPANY')")
    public List<AgencyDTO> getRetailAgencies() {
        return agencyService.getRetailAgencies();
    }

    @PostMapping("/{agencyId}/direct-upgrade")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> directUpgrade(@PathVariable Long agencyId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl user = (UserDetailsImpl) auth.getPrincipal();
            agencyService.directUpgrade(agencyId, user.getId(), user.getUsername());
            return ResponseEntity.ok(Map.of("message", "Đã nâng cấp thành công lên khách sỉ"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/wholesale")
    @PreAuthorize("hasRole('COMPANY')")
    public List<AgencyDTO> getWholesaleAgencies() {
        return agencyService.getWholesaleAgencies();
    }

    @PostMapping("/{agencyId}/direct-downgrade")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> directDowngrade(@PathVariable Long agencyId) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl user = (UserDetailsImpl) auth.getPrincipal();
            agencyService.directDowngrade(agencyId, user.getId(), user.getUsername());
            return ResponseEntity.ok(Map.of("message", "Đã chuyển về khách lẻ"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}