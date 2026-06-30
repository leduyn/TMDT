package com.anhtin.tmdt.backend.modules.dashboard.controller;

import com.anhtin.tmdt.backend.modules.dashboard.dto.DashboardDTO;
import com.anhtin.tmdt.backend.modules.dashboard.service.DashboardService;
import com.anhtin.tmdt.backend.security.services.UserDetailsImpl;
import com.anhtin.tmdt.backend.security.services.AgencyUserDetails;
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
        Object principal = auth.getPrincipal();

        String role = auth.getAuthorities().stream()
            .findFirst().map(g -> g.getAuthority()).orElse("");

        DashboardDTO dto;
        switch (role) {
            case "ROLE_COMPANY":
                dto = dashboardService.getCompanyDashboard();
                break;
            case "ROLE_AGENCY":
                Long agencyId;
                if (principal instanceof AgencyUserDetails) {
                    agencyId = ((AgencyUserDetails) principal).getId();
                } else if (principal instanceof UserDetailsImpl) {
                    agencyId = ((UserDetailsImpl) principal).getAgencyId();
                } else {
                    agencyId = null;
                }
                dto = dashboardService.getAgencyDashboard(agencyId);
                break;
            default:
                if (principal instanceof UserDetailsImpl) {
                    dto = dashboardService.getCustomerDashboard(((UserDetailsImpl) principal).getId());
                } else {
                    dto = new DashboardDTO();
                }
                break;
        }

        return ResponseEntity.ok(dto);
    }
}
