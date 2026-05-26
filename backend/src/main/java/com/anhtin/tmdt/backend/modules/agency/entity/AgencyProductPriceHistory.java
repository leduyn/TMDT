package com.anhtin.tmdt.backend.modules.agency.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.price.entity.PriceList;
import com.anhtin.tmdt.backend.modules.user.entity.User;

@Entity
@Table(name = "agency_product_price_histories")
@NoArgsConstructor
@AllArgsConstructor
public class AgencyProductPriceHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_product_price_id", nullable = false)
    private AgencyProductPrice agencyProductPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "old_price")
    private Double oldPrice;

    @Column(name = "new_price", nullable = false)
    private Double newPrice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private User changedBy;

    @Column(name = "changed_at")
    private LocalDateTime changedAt = LocalDateTime.now();

    @Column(name = "change_source")
    private String changeSource; // e.g. "PRICE_LIST_UPDATED", "AGENCY_ASSIGNMENT_CHANGED", "MANUAL_OVERRIDE", "EXCEL_IMPORT"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_price_list_id")
    private PriceList sourcePriceList;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public AgencyProductPrice getAgencyProductPrice() { return agencyProductPrice; }
    public void setAgencyProductPrice(AgencyProductPrice agencyProductPrice) { this.agencyProductPrice = agencyProductPrice; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public Double getOldPrice() { return oldPrice; }
    public void setOldPrice(Double oldPrice) { this.oldPrice = oldPrice; }
    public Double getNewPrice() { return newPrice; }
    public void setNewPrice(Double newPrice) { this.newPrice = newPrice; }
    public User getChangedBy() { return changedBy; }
    public void setChangedBy(User changedBy) { this.changedBy = changedBy; }
    public LocalDateTime getChangedAt() { return changedAt; }
    public void setChangedAt(LocalDateTime changedAt) { this.changedAt = changedAt; }
    public String getChangeSource() { return changeSource; }
    public void setChangeSource(String changeSource) { this.changeSource = changeSource; }
    public PriceList getSourcePriceList() { return sourcePriceList; }
    public void setSourcePriceList(PriceList sourcePriceList) { this.sourcePriceList = sourcePriceList; }
}
