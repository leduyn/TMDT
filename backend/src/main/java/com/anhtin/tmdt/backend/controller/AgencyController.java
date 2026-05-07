package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.dto.request.AgencyRequest;
import com.anhtin.tmdt.backend.dto.response.AgencyDTO;
import com.anhtin.tmdt.backend.dto.response.UserDTO;
import com.anhtin.tmdt.backend.service.AgencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agencies")
@CrossOrigin(origins = "*")
public class AgencyController {

    @Autowired
    private AgencyService agencyService;

    @GetMapping
    public List<AgencyDTO> getAllAgencies() {
        return agencyService.getAllAgencies();
    }

    @GetMapping("/{id}")
    public AgencyDTO getAgencyById(@PathVariable Long id) {
        return agencyService.getAgencyById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public AgencyDTO createAgency(@RequestBody AgencyRequest request) {
        return agencyService.createAgency(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public AgencyDTO updateAgency(@PathVariable Long id, @RequestBody AgencyRequest request) {
        return agencyService.updateAgency(id, request);
    }

    @GetMapping("/{id}/customers")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public List<UserDTO> getAgencyCustomers(@PathVariable Long id) {
        List<UserDTO> customers = agencyService.getCustomersByAgency(id);

        // Bảo mật: Nếu là AGENCY, chỉ cho thấy thông tin đại lý của chính họ
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        boolean isAgency = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_AGENCY"));

        if (isAgency) {
            for (UserDTO dto : customers) {
                int idx = dto.getAgencyIds() != null ? dto.getAgencyIds().indexOf(id) : -1;
                if (idx != -1) {
                    String name = dto.getAgencyNames().get(idx);
                    dto.setAgencyIds(java.util.Collections.singletonList(id));
                    dto.setAgencyNames(java.util.Collections.singletonList(name));
                } else {
                    dto.setAgencyIds(new java.util.ArrayList<>());
                    dto.setAgencyNames(new java.util.ArrayList<>());
                }
            }
        }

        return customers;
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public AgencyDTO getMyAgency(@RequestParam Long userId) {
        // Lưu ý: Thông thường userId lấy từ Token, ở đây tạm dùng @RequestParam để đơn
        // giản
        return agencyService.getAgencyByUserId(userId);
    }

    @PostMapping("/{id}/approve/{customerId}")
    @PreAuthorize("hasRole('AGENCY') or hasRole('COMPANY')")
    public void approveCustomer(@PathVariable Long id, @PathVariable Long customerId) {
        agencyService.approveCustomer(id, customerId);
    }
}
