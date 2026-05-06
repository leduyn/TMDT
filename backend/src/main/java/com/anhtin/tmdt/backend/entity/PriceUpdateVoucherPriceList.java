package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Liên kết phiếu cập nhật giá với nhiều bảng giá (one voucher → many price lists).
 */
@Entity
@Table(name = "price_update_voucher_price_lists", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"voucher_id", "price_list_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PriceUpdateVoucherPriceList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private PriceUpdateVoucher voucher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_list_id", nullable = false)
    private PriceList priceList;
}
