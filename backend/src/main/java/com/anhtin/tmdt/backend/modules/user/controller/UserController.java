package com.anhtin.tmdt.backend.modules.user.controller;

import com.anhtin.tmdt.backend.modules.user.dto.UserDTO;
import com.anhtin.tmdt.backend.modules.user.service.UserService;
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

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public UserDTO getMyProfile() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth.getPrincipal() instanceof com.anhtin.tmdt.backend.security.services.UserDetailsImpl) {
            com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails =
                    (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) auth.getPrincipal();
            return userService.getUserById(userDetails.getId());
        }
        throw new RuntimeException("Không hỗ trợ lấy profile cho tài khoản đại lý tại đây");
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('COMPANY')")
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('COMPANY', 'AGENCY')")
    public UserDTO getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
