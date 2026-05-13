package com.anhtin.tmdt.backend.modules.price.repository;

import com.anhtin.tmdt.backend.modules.price.entity.PriceListCondition;
import com.anhtin.tmdt.backend.modules.price.entity.PriceListConditionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.customer.entity.CustomerGroup;

@Repository
public interface PriceListConditionRepository extends JpaRepository<PriceListCondition, Long> {
    
    List<PriceListCondition> findByPriceListId(Long priceListId);
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM PriceListCondition c WHERE c.conditionType = :type AND c.effectiveFrom <= :now ORDER BY c.effectiveFrom DESC, c.priority DESC")
    List<PriceListCondition> findActiveByConditionType(PriceListConditionType type, java.time.LocalDateTime now);
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM PriceListCondition c WHERE c.conditionType = :type AND c.rankLevel = :rank AND c.effectiveFrom <= :now ORDER BY c.effectiveFrom DESC, c.priority DESC")
    List<PriceListCondition> findActiveByRank(PriceListConditionType type, String rank, java.time.LocalDateTime now);
    
    @org.springframework.data.jpa.repository.Query("SELECT c FROM PriceListCondition c WHERE c.conditionType = :type AND c.customerGroup.id = :groupId AND c.effectiveFrom <= :now ORDER BY c.effectiveFrom DESC, c.priority DESC")
    List<PriceListCondition> findActiveByCustomerGroup(PriceListConditionType type, Long groupId, java.time.LocalDateTime now);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM PriceListCondition c WHERE c.conditionType = :type AND c.user.id = :userId AND c.effectiveFrom <= :now ORDER BY c.effectiveFrom DESC, c.priority DESC")
    List<PriceListCondition> findActiveByCustomer(PriceListConditionType type, Long userId, java.time.LocalDateTime now);
}
