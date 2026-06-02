package com.anhtin.tmdt.backend.modules.order.repository;

import com.anhtin.tmdt.backend.modules.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerId(Long customerId);
    List<Order> findByAgencyId(Long agencyId);

    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING_PAYMENT' AND o.orderDate < :expiryTime")
    List<Order> findPendingPaymentOrdersBefore(@Param("expiryTime") LocalDateTime expiryTime);

    long countByCustomerId(Long customerId);
    long countByAgencyId(Long agencyId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.agency.id = :agencyId AND o.status = 'COMPLETED'")
    Double sumTotalAmountByAgencyIdAndStatusCompleted(@Param("agencyId") Long agencyId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.customer.id = :customerId AND o.status = 'COMPLETED'")
    Double sumTotalAmountByCustomerIdAndStatusCompleted(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'COMPLETED'")
    Double sumTotalAmountByStatusCompleted();

    long countByStatus(String status);

    List<Order> findTop5ByOrderByOrderDateDesc();

    List<Order> findTop5ByAgencyIdOrderByOrderDateDesc(Long agencyId);

    List<Order> findTop5ByCustomerIdOrderByOrderDateDesc(Long customerId);

    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countByStatusGrouped();
}
