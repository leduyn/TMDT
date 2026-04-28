package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.Promotion;
import com.anhtin.tmdt.backend.entity.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCode(String code);
    Optional<Promotion> findByCodeAndStatus(String code, PromotionStatus status);
    List<Promotion> findByAgencyIdAndStatus(Long agencyId, PromotionStatus status);
    List<Promotion> findByAgencyIsNullAndStatus(PromotionStatus status); // Voucher toàn sàn
    List<Promotion> findByStatus(PromotionStatus status);
}
