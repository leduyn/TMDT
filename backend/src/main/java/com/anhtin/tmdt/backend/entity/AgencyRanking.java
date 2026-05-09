package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "agency_rankings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"agency_id", "month", "year"})
})
@NoArgsConstructor
@AllArgsConstructor
public class AgencyRanking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @Column(name = "total_revenue")
    private Double totalRevenue = 0.0;

    @Column(name = "total_orders")
    private Integer totalOrders = 0;

    @Column(name = "average_rating")
    private Double averageRating = 0.0;

    @Column(name = "rank_level")
    private String rankLevel; 

    private Integer month;
    private Integer year;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }
    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    public String getRankLevel() { return rankLevel; }
    public void setRankLevel(String rankLevel) { this.rankLevel = rankLevel; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
}
