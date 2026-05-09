package com.anhtin.tmdt.backend.dto.response;

public class LoyaltyPointDTO {
    private Long customerId;
    private Integer pointsBalance;
    private Integer totalEarned;

    public LoyaltyPointDTO() {}

    public LoyaltyPointDTO(Long customerId, Integer pointsBalance, Integer totalEarned) {
        this.customerId = customerId;
        this.pointsBalance = pointsBalance;
        this.totalEarned = totalEarned;
    }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Integer getPointsBalance() { return pointsBalance; }
    public void setPointsBalance(Integer pointsBalance) { this.pointsBalance = pointsBalance; }

    public Integer getTotalEarned() { return totalEarned; }
    public void setTotalEarned(Integer totalEarned) { this.totalEarned = totalEarned; }
}
