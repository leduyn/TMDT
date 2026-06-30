package com.anhtin.tmdt.backend.modules.loyalty.repository;

import com.anhtin.tmdt.backend.modules.loyalty.entity.CustomerCertificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerCertificateRepository extends JpaRepository<CustomerCertificate, Long> {
    List<CustomerCertificate> findByCustomerIdOrderByEarnedAtDesc(Long customerId);
}
