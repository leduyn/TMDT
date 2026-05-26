package com.anhtin.tmdt.backend.modules.price.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

/**
 * Bảng cấu hình chiết khấu/hoa hồng linh hoạt cho từng Đại lý.
 * Mỗi Đại lý có thể có nhiều dòng cấu hình (theo category hoặc theo sản phẩm cụ thể).
 * Nếu không có cấu hình riêng, hệ thống fallback sang defaultCommissionRate của Agency.
 */
@Entity
@Table(name = "commission_configs")
@NoArgsConstructor
@AllArgsConstructor
public class CommissionConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "platform_fee_rate", nullable = false)
    private Double platformFeeRate;

    @Column(name = "dropship_commission_rate", nullable = false)
    private Double dropshipCommissionRate;

    @Column(name = "effective_from")
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;

    private boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }
    public Double getPlatformFeeRate() { return platformFeeRate; }
    public void setPlatformFeeRate(Double platformFeeRate) { this.platformFeeRate = platformFeeRate; }
    public Double getDropshipCommissionRate() { return dropshipCommissionRate; }
    public void setDropshipCommissionRate(Double dropshipCommissionRate) { this.dropshipCommissionRate = dropshipCommissionRate; }
    public LocalDateTime getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDateTime effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDateTime getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDateTime effectiveTo) { this.effectiveTo = effectiveTo; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
