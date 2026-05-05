package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.PriceListCondition;
import com.anhtin.tmdt.backend.entity.PriceListConditionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceListConditionRepository extends JpaRepository<PriceListCondition, Long> {
    
    List<PriceListCondition> findByPriceListId(Long priceListId);
    
    List<PriceListCondition> findByConditionTypeOrderByPriorityDesc(PriceListConditionType conditionType);
    
    List<PriceListCondition> findByConditionTypeAndRankLevelOrderByPriorityDesc(PriceListConditionType conditionType, String rankLevel);
    
    List<PriceListCondition> findByConditionTypeAndCustomerGroupIdOrderByPriorityDesc(PriceListConditionType conditionType, Long customerGroupId);
}
