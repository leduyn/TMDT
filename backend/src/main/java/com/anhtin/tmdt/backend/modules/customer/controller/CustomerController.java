package com.anhtin.tmdt.backend.modules.customer.controller;

import com.anhtin.tmdt.backend.modules.customer.dto.CustomerDTO;
import com.anhtin.tmdt.backend.modules.customer.dto.CustomerRequest;
import com.anhtin.tmdt.backend.modules.customer.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public List<CustomerDTO> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public CustomerDTO getCustomerById(@PathVariable Long id) {
        return customerService.getCustomerById(id);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public ResponseEntity<CustomerDTO> searchByTaxCode(@RequestParam String taxCode) {
        CustomerDTO customer = customerService.findByTaxCode(taxCode);
        if (customer == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(customer);
    }

    @PostMapping
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public CustomerDTO createCustomer(@RequestBody CustomerRequest request) {
        return customerService.createCustomer(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY') or hasRole('AGENCY')")
    public CustomerDTO updateCustomer(@PathVariable Long id, @RequestBody CustomerRequest request) {
        return customerService.updateCustomer(id, request);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public void deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
    }
}
