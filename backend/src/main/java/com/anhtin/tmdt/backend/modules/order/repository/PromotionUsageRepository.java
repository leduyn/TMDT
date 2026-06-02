package com.anhtin.tmdt.backend.modules.order.repository;

import com.anhtin.tmdt.backend.modules.order.entity.PromotionUsage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PromotionUsageRepository extends JpaRepository<PromotionUsage, Long> {
    int countBySalesPolicyIdAndCustomerId(Long salesPolicyId, Long customerId);
}
