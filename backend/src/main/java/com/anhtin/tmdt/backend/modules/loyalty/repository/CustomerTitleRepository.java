package com.anhtin.tmdt.backend.modules.loyalty.repository;

import com.anhtin.tmdt.backend.modules.loyalty.entity.CustomerTitle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CustomerTitleRepository extends JpaRepository<CustomerTitle, Long> {
    List<CustomerTitle> findByCustomerId(Long customerId);
    boolean existsByCustomerIdAndTitleName(Long customerId, String titleName);
}
