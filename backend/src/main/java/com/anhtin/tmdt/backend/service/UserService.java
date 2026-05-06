package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.response.UserDTO;
import com.anhtin.tmdt.backend.entity.Role;
import com.anhtin.tmdt.backend.entity.User;
import com.anhtin.tmdt.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.anhtin.tmdt.backend.repository.AgencyRepository agencyRepository;

    public List<UserDTO> getAllCustomers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserDTO(user);
    }
    
    public List<UserDTO> getUnassignedAgencies() {
        // Lấy danh sách user có role AGENCY nhưng chưa có trong bảng agencies
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.AGENCY && !agencyRepository.existsByUserId(u.getId()))
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }
}
