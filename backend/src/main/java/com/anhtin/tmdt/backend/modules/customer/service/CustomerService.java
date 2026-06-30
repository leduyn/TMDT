package com.anhtin.tmdt.backend.modules.customer.service;

import com.anhtin.tmdt.backend.modules.customer.dto.CustomerDTO;
import com.anhtin.tmdt.backend.modules.customer.dto.CustomerRequest;
import com.anhtin.tmdt.backend.modules.customer.entity.Customer;
import com.anhtin.tmdt.backend.modules.customer.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository customerRepository;

    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(CustomerDTO::new)
                .collect(Collectors.toList());
    }

    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));
        return new CustomerDTO(customer);
    }

    public CustomerDTO findByTaxCode(String taxCode) {
        return customerRepository.findByTaxCode(taxCode)
                .map(CustomerDTO::new)
                .orElse(null);
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerRequest request) {
        if (request.getTaxCode() != null && !request.getTaxCode().isBlank()
                && customerRepository.findByTaxCode(request.getTaxCode()).isPresent()) {
            throw new RuntimeException("Tax code already exists!");
        }

        Customer customer = new Customer();
        updateCustomerFields(customer, request);
        Customer saved = customerRepository.save(customer);
        return new CustomerDTO(saved);
    }

    @Transactional
    public CustomerDTO updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found"));

        if (request.getTaxCode() != null && !request.getTaxCode().isBlank()
                && !request.getTaxCode().equals(customer.getTaxCode())
                && customerRepository.findByTaxCode(request.getTaxCode()).isPresent()) {
            throw new RuntimeException("Tax code already exists!");
        }

        updateCustomerFields(customer, request);
        return new CustomerDTO(customerRepository.save(customer));
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Customer not found");
        }
        customerRepository.deleteById(id);
    }

    private void updateCustomerFields(Customer customer, CustomerRequest request) {
        if (request.getAgencyId() != null) customer.setAgencyId(request.getAgencyId());
        if (request.getOrganizationName() != null) customer.setOrganizationName(request.getOrganizationName());
        if (request.getTaxCode() != null) customer.setTaxCode(request.getTaxCode());
        if (request.getShippingAddress() != null) customer.setShippingAddress(request.getShippingAddress());
        if (request.getBillingAddress() != null) customer.setBillingAddress(request.getBillingAddress());
        if (request.getReceiverName() != null) customer.setReceiverName(request.getReceiverName());
        if (request.getReceiverPhone() != null) customer.setReceiverPhone(request.getReceiverPhone());
        if (request.getNote() != null) customer.setNote(request.getNote());
    }
}
