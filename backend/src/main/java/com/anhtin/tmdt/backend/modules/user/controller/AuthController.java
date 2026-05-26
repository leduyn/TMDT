package com.anhtin.tmdt.backend.modules.user.controller;

import com.anhtin.tmdt.backend.modules.user.dto.LoginRequest;
import com.anhtin.tmdt.backend.modules.user.dto.RegisterRequest;
import com.anhtin.tmdt.backend.modules.user.dto.JwtResponse;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
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
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyStatus;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

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
            agencyId = agencyRepository.findByUserId(userDetails.getId())
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
        
        // Nếu là Đại lý, mặc định chưa được kích hoạt cho đến khi Admin duyệt
        if (userRole == Role.AGENCY) {
            user.setActive(false);
        } else {
            user.setActive(true);
        }

        User savedUser = userRepository.save(user);

        // Tạo bản ghi Agency cho tài khoản Đại lý
        if (userRole == Role.AGENCY) {
            Agency agency = new Agency();
            agency.setUser(savedUser);
            agency.setName(savedUser.getUsername()); // Tạm thời lấy username làm tên đại lý
            agency.setPhone(savedUser.getPhone());
            agency.setLatitude(0.0);
            agency.setLongitude(0.0);
            agency.setStatus(AgencyStatus.PENDING);
            agency.setActive(false);
            agencyRepository.save(agency);
        }

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
