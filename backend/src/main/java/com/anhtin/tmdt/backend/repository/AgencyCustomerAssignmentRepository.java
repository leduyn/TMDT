package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.AgencyCustomerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgencyCustomerAssignmentRepository extends JpaRepository<AgencyCustomerAssignment, Long> {
    List<AgencyCustomerAssignment> findByAgencyId(Long agencyId);
    List<AgencyCustomerAssignment> findByCustomerId(Long customerId);
    Optional<AgencyCustomerAssignment> findByAgencyIdAndCustomerId(Long agencyId, Long customerId);
}
