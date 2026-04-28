package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Bảng cấu hình chiết khấu/hoa hồng linh hoạt cho từng Đại lý.
 * Mỗi Đại lý có thể có nhiều dòng cấu hình (theo category hoặc theo sản phẩm cụ thể).
 * Nếu không có cấu hình riêng, hệ thống fallback sang defaultCommissionRate của Agency.
 */
@Entity
@Table(name = "commission_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommissionConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    // Cấu hình theo category (nullable - nếu null thì áp dụng chung cho agency)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // Phí sàn (%) mà Công ty thu từ Đại lý khi Đại lý tự bán (Marketplace)
    @Column(name = "platform_fee_rate", nullable = false)
    private Double platformFeeRate;

    // Chiết khấu (%) mà Đại lý được hưởng khi bán hàng Dropship của Công ty
    @Column(name = "dropship_commission_rate", nullable = false)
    private Double dropshipCommissionRate;

    // Ngày hiệu lực
    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;

    // Ngày hết hiệu lực (nullable = vô thời hạn)
    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;

    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
