package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.LoyaltyPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoyaltyPointRepository extends JpaRepository<LoyaltyPoint, Long> {
    Optional<LoyaltyPoint> findByCustomerId(Long customerId);
}
