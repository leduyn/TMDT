package com.anhtin.tmdt.backend.modules.dashboard.controller;

import com.anhtin.tmdt.backend.modules.dashboard.dto.DashboardDTO;
import com.anhtin.tmdt.backend.modules.dashboard.service.DashboardService;
import com.anhtin.tmdt.backend.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DashboardDTO> getDashboard() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        String role = userDetails.getAuthorities().stream()
            .findFirst().map(g -> g.getAuthority()).orElse("");

        DashboardDTO dto;
        switch (role) {
            case "ROLE_COMPANY":
                dto = dashboardService.getCompanyDashboard();
                break;
            case "ROLE_AGENCY":
                dto = dashboardService.getAgencyDashboard(userDetails.getAgencyId());
                break;
            default:
                dto = dashboardService.getCustomerDashboard(userDetails.getId());
                break;
        }

        return ResponseEntity.ok(dto);
    }
}
