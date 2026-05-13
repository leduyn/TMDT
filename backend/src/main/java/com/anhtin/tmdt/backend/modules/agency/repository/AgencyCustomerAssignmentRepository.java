package com.anhtin.tmdt.backend.modules.agency.repository;

import com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgencyCustomerAssignmentRepository extends JpaRepository<AgencyCustomerAssignment, Long> {
    List<AgencyCustomerAssignment> findByAgencyId(Long agencyId);
    List<AgencyCustomerAssignment> findByCustomerId(Long customerId);
    Optional<AgencyCustomerAssignment> findByAgencyIdAndCustomerId(Long agencyId, Long customerId);
    boolean existsByAgencyIdAndCustomerId(Long agencyId, Long customerId);
    List<AgencyCustomerAssignment> findByAgencyIdAndApprovedFalse(Long agencyId);
}
