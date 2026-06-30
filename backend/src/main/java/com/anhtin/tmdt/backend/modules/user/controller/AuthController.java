package com.anhtin.tmdt.backend.modules.user.controller;

import com.anhtin.tmdt.backend.modules.user.dto.LoginRequest;
import com.anhtin.tmdt.backend.modules.user.dto.AgencyLoginRequest;
import com.anhtin.tmdt.backend.modules.user.dto.RegisterRequest;
import com.anhtin.tmdt.backend.modules.user.dto.JwtResponse;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import com.anhtin.tmdt.backend.security.jwt.JwtUtils;
import com.anhtin.tmdt.backend.security.services.UserDetailsImpl;
import com.anhtin.tmdt.backend.security.services.AgencyUserDetails;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyStatus;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
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
    AgencyRepository agencyRepository;

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
            agencyId = agencyRepository.findByPhone(userDetails.getUsername())
                    .map(Agency::getId)
                    .orElse(null);
        }

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                agencyId,
                userDetails.getShippingAddress()));
    }

    @PostMapping("/agency/signin")
    public ResponseEntity<?> authenticateAgency(@Valid @RequestBody AgencyLoginRequest loginRequest) {
        Agency agency = agencyRepository.findByPhone(loginRequest.getPhone())
                .orElse(null);

        if (agency == null) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Số điện thoại chưa được đăng ký!"));
        }

        if (!encoder.matches(loginRequest.getPassword(), agency.getPassword())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Mật khẩu không chính xác!"));
        }

        if (agency.getStatus() == AgencyStatus.REJECTED) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Tài khoản đã bị từ chối!"));
        }

        AgencyUserDetails agencyDetails = AgencyUserDetails.build(agency);
        String jwt = jwtUtils.generateJwtTokenFromAgency(agencyDetails);

        List<String> roles = List.of("ROLE_AGENCY");

        return ResponseEntity.ok(new JwtResponse(jwt,
                agency.getId(),
                agency.getPhone(),
                agency.getName(),
                agency.getCode(),
                roles,
                agency.getId(),
                agency.getStatus().name()));
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

        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPhone(signUpRequest.getPhone());
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
                default:
                    userRole = Role.CUSTOMER;
            }
        }

        user.setRole(userRole);
        user.setActive(true);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
