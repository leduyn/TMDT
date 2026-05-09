package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;

/**
 * Liên kết phiếu cập nhật giá với nhiều bảng giá (one voucher → many price lists).
 */
@Entity
@Table(name = "price_update_voucher_price_lists", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"voucher_id", "price_list_id"})
})
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

    public PriceUpdateVoucherPriceList() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PriceUpdateVoucher getVoucher() { return voucher; }
    public void setVoucher(PriceUpdateVoucher voucher) { this.voucher = voucher; }

    public PriceList getPriceList() { return priceList; }
    public void setPriceList(PriceList priceList) { this.priceList = priceList; }
}
