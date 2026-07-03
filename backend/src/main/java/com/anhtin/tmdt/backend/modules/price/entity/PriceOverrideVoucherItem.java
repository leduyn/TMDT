package com.anhtin.tmdt.backend.modules.price.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@Entity
@Table(name = "price_override_voucher_items", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"voucher_id", "agency_id", "product_id"})
})
@NoArgsConstructor
@AllArgsConstructor
public class PriceOverrideVoucherItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id", nullable = false)
    private PriceOverrideVoucher voucher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "new_price", nullable = false)
    private Double newPrice = -1.0;

    @Column(name = "is_visible")
    private Boolean isVisible = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PriceOverrideVoucher getVoucher() { return voucher; }
    public void setVoucher(PriceOverrideVoucher voucher) { this.voucher = voucher; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Double getNewPrice() { return newPrice; }
    public void setNewPrice(Double newPrice) { this.newPrice = newPrice; }
    public Boolean getIsVisible() { return isVisible; }
    public void setIsVisible(Boolean isVisible) { this.isVisible = isVisible; }
}
