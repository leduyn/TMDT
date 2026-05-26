package com.anhtin.tmdt.backend.modules.order.repository;

import com.anhtin.tmdt.backend.modules.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByAgencyId(Long agencyId);
}
