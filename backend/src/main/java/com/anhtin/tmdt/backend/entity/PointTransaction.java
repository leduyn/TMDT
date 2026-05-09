package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Lịch sử giao dịch điểm tích lũy (Loyalty Points).
 * Ghi nhận mỗi lần khách hàng tích điểm (EARN) hoặc đối trừ điểm (REDEEM).
 */
@Entity
@Table(name = "point_transactions")
public class PointTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    // Số điểm (dương = tích, âm = trừ)
    private Integer points;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private PointTransactionType transactionType;

    // Đơn hàng liên quan (nếu có)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public PointTransaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public PointTransactionType getTransactionType() { return transactionType; }
    public void setTransactionType(PointTransactionType transactionType) { this.transactionType = transactionType; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
