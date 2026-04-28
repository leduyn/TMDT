package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Bảng ghi nhận giao dịch tài chính (đối soát) cho mỗi đơn hàng.
 * Dùng để theo dõi dòng tiền: tổng thu, phí sàn, thu nhập ròng Đại lý.
 */
@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id")
    private Agency agency;

    // Tổng tiền khách trả
    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    // Phí sàn (Công ty thu) - cho đơn Marketplace
    @Column(name = "platform_fee")
    private Double platformFee = 0.0;

    // Hoa hồng Đại lý được hưởng - cho đơn Dropship
    @Column(name = "agency_commission")
    private Double agencyCommission = 0.0;

    // Thu nhập ròng Đại lý (sau trừ phí sàn hoặc hoa hồng nhận được)
    @Column(name = "agency_net_income")
    private Double agencyNetIncome = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type")
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
