package com.anhtin.tmdt.backend.modules.loyalty.repository;

import com.anhtin.tmdt.backend.modules.loyalty.entity.MembershipLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipLevelRepository extends JpaRepository<MembershipLevel, Long> {
    Optional<MembershipLevel> findByLevelNumber(Integer levelNumber);
    List<MembershipLevel> findByActiveTrueOrderByLevelNumberAsc();
}
