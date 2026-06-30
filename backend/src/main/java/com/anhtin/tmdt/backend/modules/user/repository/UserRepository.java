package com.anhtin.tmdt.backend.modules.user.repository;

import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByTaxCode(String taxCode);
    @org.springframework.data.jpa.repository.Query("SELECT a.customer FROM com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment a WHERE a.agency.id = :agencyId")
    java.util.List<com.anhtin.tmdt.backend.modules.customer.entity.Customer> findCustomersByAgencyId(Long agencyId);
    long countByRole(Role role);
}
