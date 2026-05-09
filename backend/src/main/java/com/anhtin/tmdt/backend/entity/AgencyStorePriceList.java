package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

/**
 * Đại lý tự chọn bảng giá để hiển thị trên cửa hàng của mình.
 * Ưu tiên CAO NHẤT trong luồng resolve cho khách hàng mua trên cửa hàng đại lý.
 * Mỗi đại lý chỉ có tối đa 1 bản ghi (UNIQUE agency_id).
 */
@Entity
@Table(name = "agency_store_price_lists", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"agency_id"})
})
@NoArgsConstructor
@AllArgsConstructor
public class AgencyStorePriceList {

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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public PriceList getPriceList() { return priceList; }
    public void setPriceList(PriceList priceList) { this.priceList = priceList; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
