package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * Sản phẩm cần cập nhật giá trong phiếu cập nhật giá.
 * newPrice = -1 → cập nhật thành "Liên hệ".
 * isVisible → thay đổi trạng thái hiển thị sản phẩm trong các bảng giá được chọn.
 */
@Entity
@Table(name = "price_update_voucher_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"voucher_id", "product_id"})
})
@NoArgsConstructor
@AllArgsConstructor
public class PriceUpdateVoucherItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private PriceUpdateVoucher voucher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "new_price", nullable = false)
    private Double newPrice = -1.0;

    @Column(name = "is_visible")
    private Boolean isVisible = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PriceUpdateVoucher getVoucher() { return voucher; }
    public void setVoucher(PriceUpdateVoucher voucher) { this.voucher = voucher; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Double getNewPrice() { return newPrice; }
    public void setNewPrice(Double newPrice) { this.newPrice = newPrice; }
    public Boolean getIsVisible() { return isVisible; }
    public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }
}
