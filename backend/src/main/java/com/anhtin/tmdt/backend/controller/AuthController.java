package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.dto.request.LoginRequest;
import com.anhtin.tmdt.backend.dto.request.RegisterRequest;
import com.anhtin.tmdt.backend.dto.response.JwtResponse;
import com.anhtin.tmdt.backend.dto.response.MessageResponse;
import com.anhtin.tmdt.backend.entity.Role;
import com.anhtin.tmdt.backend.entity.User;
import com.anhtin.tmdt.backend.repository.UserRepository;
import com.anhtin.tmdt.backend.security.jwt.JwtUtils;
import com.anhtin.tmdt.backend.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @Autowired
    com.anhtin.tmdt.backend.repository.AgencyRepository agencyRepository;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        Long agencyId = null;
        if (roles.contains("ROLE_AGENCY")) {
            agencyId = agencyRepository.findByUserId(userDetails.getId())
                    .map(com.anhtin.tmdt.backend.entity.Agency::getId)
                    .orElse(null);
        }

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                agencyId));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        if (userRepository.findByUsername(signUpRequest.getUsername()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        if (userRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        if (signUpRequest.getPhone() != null && !signUpRequest.getPhone().isBlank() && userRepository.findByPhone(signUpRequest.getPhone()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Phone number is already in use!"));
        }

        if (signUpRequest.getTaxCode() != null && !signUpRequest.getTaxCode().isBlank() && userRepository.findByTaxCode(signUpRequest.getTaxCode()).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Tax Code is already in use!"));
        }

        // Create new user's account
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPhone(signUpRequest.getPhone());
        user.setTaxCode(signUpRequest.getTaxCode());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));

        String roleStr = signUpRequest.getRole();
        Role userRole;

        if (roleStr == null) {
            userRole = Role.CUSTOMER;
        } else {
            switch (roleStr.toUpperCase()) {
                case "COMPANY":
                    userRole = Role.COMPANY;
                    break;
                case "AGENCY":
                    userRole = Role.AGENCY;
                    break;
                default:
                    userRole = Role.CUSTOMER;
            }
        }

        user.setRole(userRole);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
