package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Phiếu hẹn giờ cập nhật giá.
 * Cho phép admin đặt lịch cập nhật giá sản phẩm trên nhiều bảng giá cùng lúc.
 * Scheduler chạy mỗi phút để apply các phiếu đến hạn.
 */
@Entity
@Table(name = "price_update_vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PriceUpdateVoucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * Thời điểm hẹn giờ thực hiện cập nhật.
     */
    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;

    /**
     * Trạng thái phiếu: PENDING → APPLIED hoặc CANCELLED.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoucherStatus status = VoucherStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Thời điểm phiếu thực sự được áp dụng (null khi chưa apply).
     */
    @Column(name = "applied_at")
    private LocalDateTime appliedAt;
}
