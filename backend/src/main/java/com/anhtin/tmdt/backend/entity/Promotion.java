package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Mã khuyến mãi / Voucher.
 * agency_id = null → voucher toàn sàn (do Công ty phát).
 * agency_id != null → voucher riêng của Đại lý.
 */
@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false)
    private DiscountType discountType; // PERCENTAGE hoặc FIXED_AMOUNT

    @Column(name = "discount_value", nullable = false)
    private Double discountValue; // % hoặc số tiền cố định

    @Column(name = "min_order_value")
    private Double minOrderValue = 0.0; // Giá trị đơn tối thiểu để áp dụng

    @Column(name = "max_discount")
    private Double maxDiscount; // Giới hạn giảm tối đa (cho PERCENTAGE)

    @Column(name = "usage_limit")
    private Integer usageLimit; // Giới hạn số lần sử dụng (null = không giới hạn)

    @Column(name = "used_count")
    private Integer usedCount = 0;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    // null = voucher toàn sàn; != null = voucher riêng Đại lý
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id")
    private Agency agency;

    @Enumerated(EnumType.STRING)
    private PromotionStatus status = PromotionStatus.ACTIVE;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
