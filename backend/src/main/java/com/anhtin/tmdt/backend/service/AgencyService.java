package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.AgencyRequest;
import com.anhtin.tmdt.backend.dto.response.AgencyDTO;
import com.anhtin.tmdt.backend.dto.response.UserDTO;
import com.anhtin.tmdt.backend.entity.Agency;
import com.anhtin.tmdt.backend.entity.User;
import com.anhtin.tmdt.backend.repository.AgencyRepository;
import com.anhtin.tmdt.backend.repository.UserRepository;
import com.anhtin.tmdt.backend.repository.AgencyCustomerAssignmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AgencyService {

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private UserRepository userRepository;


    @Autowired
    private AgencyCustomerAssignmentRepository assignmentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<AgencyDTO> getAllAgencies() {
        return agencyRepository.findAll().stream()
                .map(AgencyDTO::new)
                .collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    public AgencyDTO getAgencyById(Long id) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agency not found"));
        return new AgencyDTO(agency);
    }

    @SuppressWarnings("null")
    @Transactional
    public AgencyDTO createAgency(AgencyRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Agency agency = new Agency();
        agency.setUser(user);
        agency.setName(request.getName());
        agency.setPhone(request.getPhone());
        agency.setAddress(request.getAddress());
        agency.setLatitude(request.getLatitude() != null ? request.getLatitude() : 0.0);
        agency.setLongitude(request.getLongitude() != null ? request.getLongitude() : 0.0);
        agency.setDefaultCommissionRate(request.getDefaultCommissionRate());
        agency.setStatus(com.anhtin.tmdt.backend.entity.AgencyStatus.APPROVED);
        agency.setActive(true);
        
        return new AgencyDTO(agencyRepository.save(agency));
    }

    @SuppressWarnings("null")
    @Transactional
    public AgencyDTO createAgencyWithAccount(com.anhtin.tmdt.backend.dto.request.AgencyWithAccountRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setOrganizationName(request.getOrganizationName());
        user.setTaxCode(request.getTaxCode());
        user.setBillingAddress(request.getBillingAddress());
        user.setRole(com.anhtin.tmdt.backend.entity.Role.AGENCY);
        user.setActive(true);
        User savedUser = userRepository.save(user);

        Agency agency = new Agency();
        agency.setUser(savedUser);
        agency.setName(request.getName());
        agency.setPhone(request.getPhone());
        agency.setAddress(request.getAddress());
        agency.setLatitude(request.getLatitude() != null ? request.getLatitude() : 0.0);
        agency.setLongitude(request.getLongitude() != null ? request.getLongitude() : 0.0);
        agency.setDefaultCommissionRate(request.getDefaultCommissionRate());
        agency.setStatus(com.anhtin.tmdt.backend.entity.AgencyStatus.APPROVED);
        agency.setActive(true);

        return new AgencyDTO(agencyRepository.save(agency));
    }

    @SuppressWarnings("null")
    @Transactional
    public AgencyDTO approveAgency(Long id, AgencyRequest request) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agency not found"));
        
        if (request.getName() != null) agency.setName(request.getName());
        if (request.getPhone() != null) agency.setPhone(request.getPhone());
        if (request.getAddress() != null) agency.setAddress(request.getAddress());
        if (request.getLatitude() != null) agency.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) agency.setLongitude(request.getLongitude());
        if (request.getDefaultCommissionRate() != null) agency.setDefaultCommissionRate(request.getDefaultCommissionRate());
        
        agency.setStatus(com.anhtin.tmdt.backend.entity.AgencyStatus.APPROVED);
        agency.setActive(true);
        
        // Kích hoạt luôn tài khoản user
        User user = agency.getUser();
        if (user != null) {
            user.setActive(true);
            userRepository.save(user);
        }
        
        return new AgencyDTO(agencyRepository.save(agency));
    }

    @SuppressWarnings("null")
    @Transactional
    public AgencyDTO convertUserToAgency(Long userId, AgencyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setRole(com.anhtin.tmdt.backend.entity.Role.AGENCY);
        user.setActive(true);
        userRepository.save(user);
        
        Agency agency = agencyRepository.findByUserId(userId).orElse(new Agency());
        agency.setUser(user);
        agency.setName(request.getName() != null ? request.getName() : user.getUsername());
        agency.setPhone(request.getPhone() != null ? request.getPhone() : user.getPhone());
        agency.setAddress(request.getAddress());
        agency.setLatitude(request.getLatitude() != null ? request.getLatitude() : 0.0);
        agency.setLongitude(request.getLongitude() != null ? request.getLongitude() : 0.0);
        agency.setDefaultCommissionRate(request.getDefaultCommissionRate() != null ? request.getDefaultCommissionRate() : 10.0);
        agency.setStatus(com.anhtin.tmdt.backend.entity.AgencyStatus.APPROVED);
        agency.setActive(true);
        
        return new AgencyDTO(agencyRepository.save(agency));
    }

    @SuppressWarnings("null")
    @Transactional
    public AgencyDTO updateAgency(Long id, AgencyRequest request) {
        Agency agency = agencyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agency not found"));
        
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean isCompany = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_COMPANY"));
        
        if (!isCompany) {
            com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) auth.getPrincipal();
            if (!agency.getUser().getId().equals(userDetails.getId())) {
                throw new RuntimeException("Bạn không có quyền thực hiện hành động này");
            }
            if (request.getName() != null) agency.setName(request.getName());
            if (request.getPhone() != null) agency.setPhone(request.getPhone());
        } else {
            if (request.getName() != null) agency.setName(request.getName());
            if (request.getPhone() != null) agency.setPhone(request.getPhone());
            if (request.getAddress() != null) agency.setAddress(request.getAddress());
            if (request.getLatitude() != null) agency.setLatitude(request.getLatitude());
            if (request.getLongitude() != null) agency.setLongitude(request.getLongitude());
            if (request.getActive() != null) agency.setActive(request.getActive());
        }
        
        return new AgencyDTO(agencyRepository.save(agency));
    }

    @Transactional(readOnly = true)
    public List<UserDTO> getCustomersByAgency(Long agencyId) {
        List<com.anhtin.tmdt.backend.entity.AgencyCustomerAssignment> assignments = assignmentRepository.findByAgencyId(agencyId);
        return assignments.stream().map(a -> {
            UserDTO dto = new UserDTO(a.getCustomer());
            // Ghi đè bằng thông tin cá nhân hóa của đại lý
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
            return dto;
        }).collect(Collectors.toList());
    }

    @SuppressWarnings("null")
    @Transactional
    public void approveCustomer(Long agencyId, Long customerId) {
        com.anhtin.tmdt.backend.entity.AgencyCustomerAssignment assignment = assignmentRepository.findByAgencyIdAndCustomerId(agencyId, customerId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
        
        User customer = assignment.getCustomer();
        if (customer.getTaxCode() == null || customer.getTaxCode().isBlank() ||
            customer.getOrganizationName() == null || customer.getOrganizationName().isBlank() ||
            customer.getBillingAddress() == null || customer.getBillingAddress().isBlank()) {
            throw new RuntimeException("Error: Khách hàng cần có đầy đủ Mã số thuế, Tên tổ chức và Địa chỉ xuất hóa đơn để được duyệt.");
        }
        
        assignment.setApproved(true);
        assignmentRepository.save(assignment);
    }

    public AgencyDTO getAgencyByUserId(Long userId) {
        return agencyRepository.findByUserId(userId)
                .map(AgencyDTO::new)
                .orElseThrow(() -> new RuntimeException("User is not an agency or agency not found"));
    }
}
