package com.anhtin.tmdt.backend.modules.user.controller;

import com.anhtin.tmdt.backend.modules.customer.dto.CustomerRequest;
import com.anhtin.tmdt.backend.modules.user.dto.UserDTO;
import com.anhtin.tmdt.backend.modules.user.service.UserService;
import com.anhtin.tmdt.backend.modules.agency.service.AgencyService;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyCustomerAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private AgencyService agencyService;

    @Autowired
    private AgencyCustomerAssignmentRepository assignmentRepository;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserDTO getMyProfile() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) auth.getPrincipal();
        return userService.getUserById(userDetails.getId());
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public UserDTO updateMyProfile(@RequestBody CustomerRequest request) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) auth.getPrincipal();
        return userService.updateCustomer(userDetails.getId(), request);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('COMPANY')")
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/customers")
    @PreAuthorize("hasRole('COMPANY')")
    public List<UserDTO> getAllCustomers() {
        return userService.getAllCustomers();
    }

    @GetMapping("/agencies-unassigned")
    @PreAuthorize("hasRole('COMPANY')")
    public List<UserDTO> getUnassignedAgencies() {
        return userService.getUnassignedAgencies();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public UserDTO getUserById(@PathVariable Long id) {
        UserDTO dto = userService.getUserById(id);

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        boolean isAgency = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_AGENCY"));

        if (isAgency) {
            com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) auth
                    .getPrincipal();
            com.anhtin.tmdt.backend.modules.agency.dto.AgencyDTO myAgency = agencyService
                    .getAgencyByUserId(userDetails.getId());

            if (myAgency != null) {
                Long myAgencyId = myAgency.getId();
                java.util.List<Long> filteredIds = new java.util.ArrayList<>();
                java.util.List<String> filteredNames = new java.util.ArrayList<>();

                if (dto.getAgencyIds() != null) {
                    for (int i = 0; i < dto.getAgencyIds().size(); i++) {
                        if (dto.getAgencyIds().get(i).equals(myAgencyId)) {
                            filteredIds.add(dto.getAgencyIds().get(i));
                            filteredNames.add(dto.getAgencyNames().get(i));
                        }
                    }
                }
                dto.setAgencyIds(filteredIds);
                dto.setAgencyNames(filteredNames);

                assignmentRepository.findByAgencyIdAndCustomerId(myAgencyId, id).ifPresent(a -> {
                    if (a.getCustomName() != null && !a.getCustomName().isBlank()) {
                        dto.setDisplayName(a.getCustomName());
                    }
                    if (a.getCustomShippingAddress() != null && !a.getCustomShippingAddress().isBlank()) {
                        dto.setShippingAddress(a.getCustomShippingAddress());
                    }
                    if (a.getCustomPhone() != null && !a.getCustomPhone().isBlank()) {
                        dto.setPhone(a.getCustomPhone());
                    }
                    dto.setApproved(a.isApproved());
                    dto.setCustomName(a.getCustomName());
                    dto.setCustomShippingAddress(a.getCustomShippingAddress());
                    dto.setCustomPhone(a.getCustomPhone());
                    dto.setTotalDebt(a.getTotalDebt());
                });
            }
        }

        return dto;
    }

    @PostMapping("/customers")
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public UserDTO createCustomer(@RequestBody CustomerRequest request) {
        return userService.createCustomer(request);
    }

    @PutMapping("/customers/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public UserDTO updateCustomer(@PathVariable Long id, @RequestBody CustomerRequest request) {
        return userService.updateCustomer(id, request);
    }

    @PutMapping("/customers/{id}/activate")
    @PreAuthorize("hasRole('COMPANY')")
    public UserDTO activateCustomer(@PathVariable Long id) {
        return userService.activateCustomer(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
