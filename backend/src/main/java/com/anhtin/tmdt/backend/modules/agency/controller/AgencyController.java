package com.anhtin.tmdt.backend.modules.agency.controller;

import com.anhtin.tmdt.backend.modules.agency.dto.AgencyRequest;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyDTO;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyRegisterRequest;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyApproveRequest;
import com.anhtin.tmdt.backend.modules.agency.service.AgencyService;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.price.service.PriceListService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agencies")
@CrossOrigin(origins = "*")
public class AgencyController {

    @Autowired
    private AgencyService agencyService;

    @Autowired
    private PriceListService priceListService;

    @GetMapping
    @PreAuthorize("hasRole('COMPANY')")
    public List<AgencyDTO> getAllAgencies() {
        return agencyService.getAllAgencies();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public AgencyDTO getAgencyById(@PathVariable Long id) {
        return agencyService.getAgencyById(id);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody AgencyRegisterRequest request) {
        try {
            AgencyDTO agency = agencyService.register(request);
            return ResponseEntity.ok(agency);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public AgencyDTO createAgency(@RequestBody AgencyRequest request) {
        return agencyService.createAgency(request);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('COMPANY')")
    public AgencyDTO approveAgency(@PathVariable Long id, @RequestBody AgencyApproveRequest request) {
        return agencyService.approveAgency(id, request);
    }

    @GetMapping("/{id}/prices")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> getAgencyPrices(@PathVariable Long id) {
        try {
            com.anhtin.tmdt.backend.modules.price.entity.PriceList priceList = priceListService.resolveForAgency(id);
            java.util.Map<String, Object> result = new java.util.HashMap<>();
            result.put("id", priceList.getId());
            result.put("name", priceList.getName());
            result.put("agencyId", id);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public AgencyDTO updateAgency(@PathVariable Long id, @RequestBody AgencyRequest request) {
        return agencyService.updateAgency(id, request);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('AGENCY')")
    public AgencyDTO getMyAgency() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        com.anhtin.tmdt.backend.security.services.AgencyUserDetails agencyDetails =
                (com.anhtin.tmdt.backend.security.services.AgencyUserDetails) auth.getPrincipal();
        return agencyService.getAgencyById(agencyDetails.getId());
    }
}
