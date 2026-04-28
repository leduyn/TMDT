package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.CommissionConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommissionConfigRepository extends JpaRepository<CommissionConfig, Long> {
    List<CommissionConfig> findByAgencyIdAndActiveTrue(Long agencyId);

    // Tìm cấu hình theo Đại lý + Category (ưu tiên cụ thể hơn)
    Optional<CommissionConfig> findFirstByAgencyIdAndCategoryIdAndActiveTrueOrderByCreatedAtDesc(
            Long agencyId, Long categoryId);

    // Fallback: cấu hình chung của Đại lý (category = null)
    Optional<CommissionConfig> findFirstByAgencyIdAndCategoryIsNullAndActiveTrueOrderByCreatedAtDesc(
            Long agencyId);
}
