package com.anhtin.tmdt.backend.modules.loyalty.repository;

import com.anhtin.tmdt.backend.modules.loyalty.entity.GamificationRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GamificationRuleRepository extends JpaRepository<GamificationRule, String> {
    List<GamificationRule> findByEventTriggerAndActiveTrue(String eventTrigger);
    List<GamificationRule> findByActiveTrue();
}
