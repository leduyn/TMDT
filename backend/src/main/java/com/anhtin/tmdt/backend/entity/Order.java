package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id")
    private Agency agency;

    private Double totalAmount;
    
    private String status; // PENDING, PROCESSING, COMPLETED, CANCELLED

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type")
    private OrderType orderType; // DROPSHIP hoặc MARKETPLACE

    private String shippingAddress;

    // Mã giảm giá đã áp dụng (nếu có)
    @Column(name = "promotion_code")
    private String promotionCode;

    // Số điểm loyalty đã đối trừ (nếu có)
    @Column(name = "points_redeemed")
    private Integer pointsRedeemed = 0;

    // Số tiền được giảm từ promotion/points
    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;
    
    private LocalDateTime orderDate = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}
