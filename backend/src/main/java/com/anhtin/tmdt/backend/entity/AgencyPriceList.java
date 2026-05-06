package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Admin chỉ định bảng giá trực tiếp cho một đại lý cụ thể.
 * Đây là ưu tiên CAO NHẤT trong chuỗi resolve bảng giá cho đại lý.
 * Hỗ trợ nhiều bản ghi theo thời gian hiệu lực (effective_from).
 */
@Entity
@Table(name = "agency_price_lists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AgencyPriceList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_list_id", nullable = false)
    private PriceList priceList;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    /**
     * Thời điểm bắt đầu có hiệu lực.
     */
    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom = LocalDateTime.now();
}
