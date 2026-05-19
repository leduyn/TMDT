package com.anhtin.tmdt.backend.modules.agency.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.price.entity.PriceList;

@Entity
@Table(name = "agency_product_prices", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"agency_id", "product_id"})
})
@NoArgsConstructor
@AllArgsConstructor
public class AgencyProductPrice {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private Double price = -1.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_price_list_id")
    private PriceList sourcePriceList;

    @Column(name = "is_override")
    private Boolean isOverride = false;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "old_price")
    private Double oldPrice = -1.0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getOldPrice() { return oldPrice; }
    public void setOldPrice(Double oldPrice) { this.oldPrice = oldPrice; }
    public PriceList getSourcePriceList() { return sourcePriceList; }
    public void setSourcePriceList(PriceList sourcePriceList) { this.sourcePriceList = sourcePriceList; }
    public Boolean getIsOverride() { return isOverride; }
    public void setIsOverride(Boolean isOverride) { this.isOverride = isOverride; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
