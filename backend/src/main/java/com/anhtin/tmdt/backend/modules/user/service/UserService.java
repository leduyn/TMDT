package com.anhtin.tmdt.backend.modules.user.service;

import com.anhtin.tmdt.backend.modules.customer.dto.CustomerRequest;
import com.anhtin.tmdt.backend.modules.user.dto.UserDTO;
import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyCustomerAssignmentRepository;
import com.anhtin.tmdt.backend.modules.customer.repository.CustomerGroupRepository;
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
    private AgencyRepository agencyRepository;

    @Autowired
    private AgencyCustomerAssignmentRepository assignmentRepository;

    @Autowired
    private CustomerGroupRepository customerGroupRepository;

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
        UserDTO dto = new UserDTO(user);
        agencyRepository.findByUserId(id).ifPresent(a -> dto.setAgencyId(a.getId()));
        return dto;
    }

    public List<UserDTO> getUnassignedAgencies() {
        // Lấy danh sách user có role AGENCY nhưng chưa có trong bảng agencies
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.AGENCY && !agencyRepository.existsByUserId(u.getId()))
                .map(UserDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    @SuppressWarnings("null")
    public UserDTO createCustomer(CustomerRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Error: Username is already taken!");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Error: Email is already in use!");
        }
        if (request.getPhone() != null && !request.getPhone().isBlank() && userRepository.findByPhone(request.getPhone()).isPresent()) {
            throw new RuntimeException("Error: Phone is already in use!");
        }
        if (request.getTaxCode() != null && !request.getTaxCode().isBlank() && userRepository.findByTaxCode(request.getTaxCode()).isPresent()) {
            throw new RuntimeException("Error: Tax Code is already in use!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword() != null ? request.getPassword() : "123456"));
        user.setRole(Role.CUSTOMER);
        user.setActive(request.isActive());
        user.setOrganizationName(request.getOrganizationName());
        user.setShippingAddress(request.getShippingAddress());
        user.setBillingAddress(request.getBillingAddress());
        user.setTaxCode(request.getTaxCode());
        user.setPhone(request.getPhone());

        if (request.getCustomerGroupId() != null) {
            Long groupId = request.getCustomerGroupId();
            user.setCustomerGroup(customerGroupRepository.findById(groupId)
                    .orElseThrow(() -> new RuntimeException("Customer group not found")));
        }

        User savedUser = userRepository.save(user);
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        boolean isAgency = auth != null
                && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_AGENCY"));
        if (request.getAgencyIds() != null && !request.getAgencyIds().isEmpty()) {
            for (Long agencyId : request.getAgencyIds()) {
                if (agencyId == null) continue;
                com.anhtin.tmdt.backend.modules.agency.entity.Agency agency = agencyRepository.findById(agencyId)
                        .orElseThrow(() -> new RuntimeException("Agency not found"));
                com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment assignment = new com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment();
                assignment.setCustomer(savedUser);
                assignment.setAgency(agency);
                assignment.setCustomName(request.getCustomName());
                assignment.setCustomShippingAddress(request.getCustomShippingAddress());
                assignment.setCustomPhone(request.getCustomPhone());
                // Quan hệ Agency-Customer luôn là true khi tạo từ đây để đại lý thấy được khách
                assignment.setApproved(true);
                assignmentRepository.save(assignment);
            }
        }

        // Nếu được tạo bởi Agency, account global set active = false (chờ Admin duyệt)
        if (isAgency) {
            savedUser.setActive(false);
            userRepository.save(savedUser);
        }

        return new UserDTO(savedUser);
    }

    @Transactional
    @SuppressWarnings("null")
    public UserDTO updateCustomer(Long id, CustomerRequest request) {
        if (id == null) throw new RuntimeException("ID cannot be null");
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        boolean isAgency = auth != null
                && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_AGENCY"));
        boolean isCompany = auth != null
                && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));

        com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = null;
        if (auth != null && auth.getPrincipal() instanceof com.anhtin.tmdt.backend.security.services.UserDetailsImpl) {
            userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) auth.getPrincipal();
        }
        boolean isSelf = userDetails != null && userDetails.getId().equals(id);

        if (isCompany || isSelf) {
            if (request.getEmail() != null && !user.getEmail().equals(request.getEmail()) && userRepository.findByEmail(request.getEmail()).isPresent()) {
                throw new RuntimeException("Error: Email is already in use!");
            }
            if (request.getPhone() != null && !request.getPhone().isBlank() && !request.getPhone().equals(user.getPhone()) && userRepository.findByPhone(request.getPhone()).isPresent()) {
                throw new RuntimeException("Error: Phone is already in use!");
            }
            if (request.getTaxCode() != null && !request.getTaxCode().isBlank() && !request.getTaxCode().equals(user.getTaxCode()) && userRepository.findByTaxCode(request.getTaxCode()).isPresent()) {
                throw new RuntimeException("Error: Tax Code is already in use!");
            }

            if (request.getEmail() != null) user.setEmail(request.getEmail());
            if (isCompany && request.isActive() != user.isActive()) user.setActive(request.isActive());
            if (request.getOrganizationName() != null) user.setOrganizationName(request.getOrganizationName());
            if (request.getShippingAddress() != null) user.setShippingAddress(request.getShippingAddress());
            if (request.getBillingAddress() != null) user.setBillingAddress(request.getBillingAddress());
            if (request.getTaxCode() != null) user.setTaxCode(request.getTaxCode());
            if (request.getPhone() != null) user.setPhone(request.getPhone());

            if (request.getPassword() != null && !request.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(request.getPassword()));
            }

            if (isCompany) {
                if (request.getCustomerGroupId() != null) {
                    Long groupId = request.getCustomerGroupId();
                    user.setCustomerGroup(customerGroupRepository.findById(groupId)
                            .orElseThrow(() -> new RuntimeException("Customer group not found")));
                } else {
                    user.setCustomerGroup(null);
                }
            }

            userRepository.save(user);
        }

        User savedUser = user;



        if (request.getAgencyIds() != null) {
            // Xóa các gán cũ không còn trong list mới
            List<com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment> existing = assignmentRepository
                    .findByCustomerId(savedUser.getId());
            for (com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment assignment : existing) {
                if (!request.getAgencyIds().contains(assignment.getAgency().getId())) {
                    assignmentRepository.delete(assignment);
                } else if (isAgency && auth != null) {
                    // Nếu là Agency đang update, cho phép update customName và customAddress của
                    // chính họ
                    // Ở đây cần biết agencyId của agency hiện tại
                    userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) auth
                            .getPrincipal();
                    com.anhtin.tmdt.backend.modules.agency.entity.Agency myAgency = agencyRepository.findByUserId(userDetails.getId())
                            .orElse(null);
                    if (myAgency != null && assignment.getAgency().getId().equals(myAgency.getId())) {
                        if (request.getCustomName() != null)
                            assignment.setCustomName(request.getCustomName());
                        if (request.getCustomShippingAddress() != null)
                            assignment.setCustomShippingAddress(request.getCustomShippingAddress());
                        if (request.getCustomPhone() != null)
                            assignment.setCustomPhone(request.getCustomPhone());
                        assignmentRepository.save(assignment);
                    }
                }
            }

            // Thêm hoặc cập nhật gán mới
            for (Long agencyId : request.getAgencyIds()) {
                if (agencyId == null) continue;
                if (existing.stream().noneMatch(a -> a.getAgency().getId().equals(agencyId))) {
                    com.anhtin.tmdt.backend.modules.agency.entity.Agency agency = agencyRepository.findById(agencyId)
                            .orElseThrow(() -> new RuntimeException("Agency not found"));
                    com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment assignment = new com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment();
                    assignment.setCustomer(savedUser);
                    assignment.setAgency(agency);
                    assignment.setApproved(true);
                    assignment.setCustomName(request.getCustomName());
                    assignment.setCustomShippingAddress(request.getCustomShippingAddress());
                    assignment.setCustomPhone(request.getCustomPhone());
                    assignmentRepository.save(assignment);
                }
            }
        }

        return new UserDTO(savedUser);
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
