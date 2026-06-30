package com.anhtin.tmdt.backend.modules.user.service;

import com.anhtin.tmdt.backend.modules.customer.dto.CustomerRequest;
import com.anhtin.tmdt.backend.modules.user.dto.UserDTO;
import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserDTO> getAllCustomers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDTO getUserById(Long id) {
        if (id == null) throw new RuntimeException("ID cannot be null");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserDTO(user);
    }

    @Transactional
    @SuppressWarnings("null")
    public UserDTO createCustomer(CustomerRequest request) {
        // CustomerRequest now only has agency-related fields.
        // User creation requires username/email/password which are not in CustomerRequest.
        // This method is kept for backward compatibility but should use a dedicated DTO.
        throw new RuntimeException("Use dedicated user registration instead");
    }

    @Transactional
    @SuppressWarnings("null")
    public UserDTO updateCustomer(Long id, CustomerRequest request) {
        if (id == null) throw new RuntimeException("ID cannot be null");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        boolean isCompany = auth != null
                && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));

        com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = null;
        if (auth != null && auth.getPrincipal() instanceof com.anhtin.tmdt.backend.security.services.UserDetailsImpl) {
            userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) auth.getPrincipal();
        }
        boolean isSelf = userDetails != null && userDetails.getId().equals(id);

        if (isCompany || isSelf) {
            if (request.getOrganizationName() != null) user.setOrganizationName(request.getOrganizationName());
            if (request.getShippingAddress() != null) user.setShippingAddress(request.getShippingAddress());
            if (request.getBillingAddress() != null) user.setBillingAddress(request.getBillingAddress());
            if (request.getTaxCode() != null) user.setTaxCode(request.getTaxCode());

            if (isCompany) {
                if (request.getAgencyId() != null) {
                    // No direct mapping for agencyId on User
                }
            }

            userRepository.save(user);
        }

        return new UserDTO(user);
    }

    @Transactional
    @SuppressWarnings("null")
    public UserDTO activateCustomer(Long id) {
        if (id == null) throw new RuntimeException("ID cannot be null");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getTaxCode() == null || user.getTaxCode().isBlank() ||
            user.getOrganizationName() == null || user.getOrganizationName().isBlank() ||
            user.getBillingAddress() == null || user.getBillingAddress().isBlank()) {
            throw new RuntimeException("Error: Cần nhập đầy đủ Mã số thuế, Tên tổ chức và Địa chỉ xuất hóa đơn trước khi kích hoạt khách hàng.");
        }

        user.setActive(true);
        return new UserDTO(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        if (id == null) throw new RuntimeException("ID cannot be null");
        if (!userRepository.existsById(id)) throw new RuntimeException("User not found");
        userRepository.deleteById(id);
    }
}
