package com.anhtin.tmdt.backend.modules.customer.service;

import com.anhtin.tmdt.backend.modules.customer.dto.CustomerGroupRequest;
import com.anhtin.tmdt.backend.modules.common.dto.CustomerGroupDTO;
import com.anhtin.tmdt.backend.modules.customer.entity.CustomerGroup;
import com.anhtin.tmdt.backend.modules.customer.repository.CustomerGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerGroupService {

    @Autowired
    private CustomerGroupRepository customerGroupRepository;

    public List<CustomerGroupDTO> getAllGroups() {
        return customerGroupRepository.findAll().stream()
                .map(CustomerGroupDTO::new)
                .toList();
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
}
