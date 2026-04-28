package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "agency_rankings", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"agency_id", "month", "year"})
})
@Getter
@Setter
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
    private String rankLevel; // BRONZE, SILVER, GOLD, PLATINUM, DIAMOND

    private Integer month;
    private Integer year;
}
