package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Phiếu hẹn giờ áp dụng bảng giá cho Đại lý hoặc theo Điều kiện.
 */
@Entity
@Table(name = "price_assignment_vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PriceAssignmentVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_list_id", nullable = false)
    private PriceList priceList;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_type", nullable = false)
    private PriceListConditionType assignmentType;

    /**
     * Dùng cho assignmentType = AGENCY_RANK
     */
    @Column(name = "rank_level")
    private String rankLevel;

    /**
     * Dùng cho assignmentType = DIRECT_AGENCY (Tương ứng với gán trực tiếp cho 1 Agency)
     * Lưu ý: Ta thêm DIRECT_AGENCY vào PriceListConditionType hoặc xử lý riêng.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id")
    private Agency agency;

    /**
     * Dùng cho assignmentType = CUSTOMER_GROUP
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_group_id")
    private CustomerGroup customerGroup;

    /**
     * Dùng cho assignmentType = DIRECT_CUSTOMER
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoucherStatus status = VoucherStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "applied_at")
    private LocalDateTime appliedAt;
}
