package com.anhtin.tmdt.backend.modules.agency.repository;

import com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    long countByAgencyId(Long agencyId);

    @Query("SELECT COUNT(DISTINCT a.customer.id) FROM AgencyCustomerAssignment a WHERE a.agency.id = :agencyId AND a.totalDebt > 0")
    long countActiveBuyersByAgencyId(@Param("agencyId") Long agencyId);
}
