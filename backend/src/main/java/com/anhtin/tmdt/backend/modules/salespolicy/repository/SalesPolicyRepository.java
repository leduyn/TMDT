package com.anhtin.tmdt.backend.modules.salespolicy.repository;

import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SalesPolicyRepository extends JpaRepository<SalesPolicy, Long> {
    List<SalesPolicy> findByActiveTrueOrderByIdDesc();
}
