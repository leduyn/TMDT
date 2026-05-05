package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.CustomerGroupRequest;
import com.anhtin.tmdt.backend.dto.response.CustomerGroupDTO;
import com.anhtin.tmdt.backend.entity.CustomerGroup;
import com.anhtin.tmdt.backend.entity.User;
import com.anhtin.tmdt.backend.repository.CustomerGroupRepository;
import com.anhtin.tmdt.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerGroupService {

    @Autowired
    private CustomerGroupRepository customerGroupRepository;

    @Autowired
    private UserRepository userRepository;

    public List<CustomerGroupDTO> getAllGroups() {
        return customerGroupRepository.findAll().stream()
                .map(CustomerGroupDTO::new)
                .collect(Collectors.toList());
    }

    public CustomerGroupDTO getGroupById(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        CustomerGroup group = customerGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer group not found"));
        return new CustomerGroupDTO(group);
    }

    @Transactional
    public CustomerGroupDTO createGroup(CustomerGroupRequest request) {
        if (customerGroupRepository.existsByName(request.getName())) {
            throw new RuntimeException("Group name already exists");
        }
        CustomerGroup group = new CustomerGroup();
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        return new CustomerGroupDTO(customerGroupRepository.save(group));
    }

    @Transactional
    public CustomerGroupDTO updateGroup(Long id, CustomerGroupRequest request) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        CustomerGroup group = customerGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer group not found"));
        
        if (!group.getName().equals(request.getName()) && customerGroupRepository.existsByName(request.getName())) {
            throw new RuntimeException("Group name already exists");
        }
        
        group.setName(request.getName());
        group.setDescription(request.getDescription());
        return new CustomerGroupDTO(customerGroupRepository.save(group));
    }

    @Transactional
    public void deleteGroup(Long id) {
        if (id == null) throw new IllegalArgumentException("ID cannot be null");
        if (!customerGroupRepository.existsById(id)) {
            throw new RuntimeException("Customer group not found");
        }
        customerGroupRepository.deleteById(id);
    }

    @Transactional
    public void assignUserToGroup(Long userId, Long groupId) {
        if (userId == null || groupId == null) throw new IllegalArgumentException("IDs cannot be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        CustomerGroup group = customerGroupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Customer group not found"));
        
        user.setCustomerGroup(group);
        userRepository.save(user);
    }

    @Transactional
    public void removeUserFromGroup(Long userId) {
        if (userId == null) throw new IllegalArgumentException("User ID cannot be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setCustomerGroup(null);
        userRepository.save(user);
    }
}
