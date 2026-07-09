package com.anhtin.tmdt.backend.modules.customer.repository;

import com.anhtin.tmdt.backend.modules.customer.entity.Customer;
import com.anhtin.tmdt.backend.modules.customer.entity.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByTaxCode(String taxCode);
    List<Customer> findByAgencyId(Long agencyId);
    List<Customer> findByOrganizationNameContainingIgnoreCase(String name);
    Optional<Customer> findByUserId(Long userId);
    long countByStatus(CustomerStatus status);
    List<Customer> findByStatus(CustomerStatus status);
}
