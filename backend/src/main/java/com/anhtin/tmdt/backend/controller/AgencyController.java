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
    @PreAuthorize("hasRole('COMPANY')")
    public AgencyDTO updateAgency(@PathVariable Long id, @RequestBody AgencyRequest request) {
        return agencyService.updateAgency(id, request);
    }

    @GetMapping("/{id}/customers")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public List<UserDTO> getAgencyCustomers(@PathVariable Long id) {
        return agencyService.getCustomersByAgency(id);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('AGENCY')")
    public AgencyDTO getMyAgency(@RequestParam Long userId) {
        // Lưu ý: Thông thường userId lấy từ Token, ở đây tạm dùng @RequestParam để đơn giản
        return agencyService.getAgencyByUserId(userId);
    }
}
