package com.anhtin.tmdt.backend.modules.guide.repository;

import com.anhtin.tmdt.backend.modules.guide.entity.GuideTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuideTargetRepository extends JpaRepository<GuideTarget, Long> {
    Optional<GuideTarget> findByKey(String key);
    boolean existsByKey(String key);
}
