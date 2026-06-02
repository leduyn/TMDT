package com.anhtin.tmdt.backend.modules.salespolicy.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sales_policy_audience_filters")
public class SalesPolicyAudienceFilter {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sales_policy_id")
    private Long salesPolicyId;

    @Column(name = "rank_levels", length = 500)
    private String rankLevels; // Phân tách bằng dấu phẩy, e.g. "BRONZE,SILVER,GOLD"

    @Column(name = "provinces", length = 1000)
    private String provinces; // Phân tách bằng dấu phẩy, e.g. "Miền Nam,Hồ Chí Minh" hoặc "ALL"

    public SalesPolicyAudienceFilter() {}

    public SalesPolicyAudienceFilter(String rankLevels, String provinces) {
        this.rankLevels = rankLevels;
        this.provinces = provinces;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSalesPolicyId() { return salesPolicyId; }
    public void setSalesPolicyId(Long salesPolicyId) { this.salesPolicyId = salesPolicyId; }

    public String getRankLevels() { return rankLevels; }
    public void setRankLevels(String rankLevels) { this.rankLevels = rankLevels; }

    public String getProvinces() { return provinces; }
    public void setProvinces(String provinces) { this.provinces = provinces; }
}
