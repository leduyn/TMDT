package com.anhtin.tmdt.backend.credit.controller;

import com.anhtin.tmdt.backend.credit.dto.AgencyDebtDTO;
import com.anhtin.tmdt.backend.credit.entity.AgencyDebt;
import com.anhtin.tmdt.backend.credit.service.AgencyDebtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agency-debts")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AgencyDebtController {

    @Autowired
    private AgencyDebtService agencyDebtService;

    @GetMapping("/agency/{agencyId}")
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public ResponseEntity<List<AgencyDebtDTO>> getDebtsByAgency(@PathVariable Long agencyId) {
        // Security check: Agencies can only view their own debts
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth.getPrincipal() instanceof com.anhtin.tmdt.backend.security.services.UserDetailsImpl) {
            com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) auth.getPrincipal();
            if (userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_AGENCY"))) {
                if (!agencyId.equals(userDetails.getAgencyId())) {
                    return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
                }
            }
        }

        List<AgencyDebt> debts = agencyDebtService.getDebtsByAgency(agencyId);
        List<AgencyDebtDTO> dtos = debts.stream()
                .map(AgencyDebtDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/{debtId}/pay")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<AgencyDebtDTO> payDebt(@PathVariable Long debtId, @RequestParam Double amount) {
        AgencyDebt updated = agencyDebtService.payDebt(debtId, amount);
        return ResponseEntity.ok(AgencyDebtDTO.fromEntity(updated));
    }
}
