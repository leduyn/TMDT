package com.anhtin.tmdt.backend.modules.loyalty.dto;

import java.util.List;

public class GamificationProfileDTO {
    private Long customerId;
    private String customerName;
    private Integer pointsBalance;
    private Integer totalEarned;
    private Integer levelNumber;
    private String levelName;
    private Integer totalOrders;
    private Double totalRevenue;

    private Integer nextLevelMinPoints;
    private Integer nextLevelMinOrders;
    private Double nextLevelMinRevenue;
    private String nextLevelName;

    private List<BadgeDTO> earnedBadges;
    private List<String> titles;
    private List<CertificateDTO> certificates;

    public GamificationProfileDTO() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public Integer getPointsBalance() { return pointsBalance; }
    public void setPointsBalance(Integer pointsBalance) { this.pointsBalance = pointsBalance; }
    public Integer getTotalEarned() { return totalEarned; }
    public void setTotalEarned(Integer totalEarned) { this.totalEarned = totalEarned; }
    public Integer getLevelNumber() { return levelNumber; }
    public void setLevelNumber(Integer levelNumber) { this.levelNumber = levelNumber; }
    public String getLevelName() { return levelName; }
    public void setLevelName(String levelName) { this.levelName = levelName; }
    public Integer getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Integer totalOrders) { this.totalOrders = totalOrders; }
    public Double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(Double totalRevenue) { this.totalRevenue = totalRevenue; }
    public Integer getNextLevelMinPoints() { return nextLevelMinPoints; }
    public void setNextLevelMinPoints(Integer nextLevelMinPoints) { this.nextLevelMinPoints = nextLevelMinPoints; }
    public Integer getNextLevelMinOrders() { return nextLevelMinOrders; }
    public void setNextLevelMinOrders(Integer nextLevelMinOrders) { this.nextLevelMinOrders = nextLevelMinOrders; }
    public Double getNextLevelMinRevenue() { return nextLevelMinRevenue; }
    public void setNextLevelMinRevenue(Double nextLevelMinRevenue) { this.nextLevelMinRevenue = nextLevelMinRevenue; }
    public String getNextLevelName() { return nextLevelName; }
    public void setNextLevelName(String nextLevelName) { this.nextLevelName = nextLevelName; }
    public List<BadgeDTO> getEarnedBadges() { return earnedBadges; }
    public void setEarnedBadges(List<BadgeDTO> earnedBadges) { this.earnedBadges = earnedBadges; }
    public List<String> getTitles() { return titles; }
    public void setTitles(List<String> titles) { this.titles = titles; }
    public List<CertificateDTO> getCertificates() { return certificates; }
    public void setCertificates(List<CertificateDTO> certificates) { this.certificates = certificates; }
}
