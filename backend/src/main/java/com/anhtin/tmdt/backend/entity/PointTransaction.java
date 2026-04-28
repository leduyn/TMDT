package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Lịch sử giao dịch điểm tích lũy (Loyalty Points).
 * Ghi nhận mỗi lần khách hàng tích điểm (EARN) hoặc đối trừ điểm (REDEEM).
 */
@Entity
@Table(name = "point_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
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
}
