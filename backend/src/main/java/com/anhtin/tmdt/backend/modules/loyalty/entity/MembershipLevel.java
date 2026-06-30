package com.anhtin.tmdt.backend.modules.loyalty.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "membership_levels")
public class MembershipLevel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "level_number", unique = true, nullable = false)
    private Integer levelNumber;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "min_points", nullable = false)
    private Integer minPoints = 0;

    @Column(name = "min_orders", nullable = false)
    private Integer minOrders = 0;

    @Column(name = "min_revenue", nullable = false)
    private Double minRevenue = 0.0;

    @Column(nullable = false)
    private boolean active = true;

    public MembershipLevel() {}

    public MembershipLevel(Integer levelNumber, String name, Integer minPoints, Integer minOrders, Double minRevenue) {
        this.levelNumber = levelNumber;
        this.name = name;
        this.minPoints = minPoints;
        this.minOrders = minOrders;
        this.minRevenue = minRevenue;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getLevelNumber() { return levelNumber; }
    public void setLevelNumber(Integer levelNumber) { this.levelNumber = levelNumber; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getMinPoints() { return minPoints; }
    public void setMinPoints(Integer minPoints) { this.minPoints = minPoints; }
    public Integer getMinOrders() { return minOrders; }
    public void setMinOrders(Integer minOrders) { this.minOrders = minOrders; }
    public Double getMinRevenue() { return minRevenue; }
    public void setMinRevenue(Double minRevenue) { this.minRevenue = minRevenue; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
