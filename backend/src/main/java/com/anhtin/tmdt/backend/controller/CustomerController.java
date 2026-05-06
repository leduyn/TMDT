package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.dto.response.UserDTO;
import com.anhtin.tmdt.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private UserService userService;

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
    @PreAuthorize("hasRole('COMPANY')")
    public UserDTO getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
