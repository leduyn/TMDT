package com.anhtin.tmdt.backend.modules.loyalty.dto;

import java.util.List;

public class LeaderboardEntryDTO {
    private Long customerId;
    private String customerName;
    private Integer pointsBalance;
    private Integer totalEarned;
    private Integer levelNumber;
    private String levelName;
    private List<String> badges;
    private List<String> titles;

    public LeaderboardEntryDTO() {}

    public LeaderboardEntryDTO(Long customerId, String customerName, Integer pointsBalance, Integer totalEarned, Integer levelNumber, String levelName, List<String> badges, List<String> titles) {
        this.customerId = customerId;
        this.customerName = customerName;
        this.pointsBalance = pointsBalance;
        this.totalEarned = totalEarned;
        this.levelNumber = levelNumber;
        this.levelName = levelName;
        this.badges = badges;
        this.titles = titles;
    }

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
    public List<String> getBadges() { return badges; }
    public void setBadges(List<String> badges) { this.badges = badges; }
    public List<String> getTitles() { return titles; }
    public void setTitles(List<String> titles) { this.titles = titles; }
}
