package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Sản phẩm cần cập nhật giá trong phiếu cập nhật giá.
 * newPrice = -1 → cập nhật thành "Liên hệ".
 * isVisible → thay đổi trạng thái hiển thị sản phẩm trong các bảng giá được chọn.
 */
@Entity
@Table(name = "price_update_voucher_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"voucher_id", "product_id"})
})
@Getter
@Setter
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

    /**
     * Giá mới muốn cập nhật. -1.0 = "Liên hệ".
     */
    @Column(name = "new_price", nullable = false)
    private Double newPrice = -1.0;

    /**
     * Trạng thái hiển thị mới của sản phẩm trong các bảng giá được chọn.
     */
    @Column(name = "is_visible")
    private Boolean isVisible = true;
}
