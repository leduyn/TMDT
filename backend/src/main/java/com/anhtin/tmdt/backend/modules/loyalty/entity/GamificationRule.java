package com.anhtin.tmdt.backend.modules.loyalty.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "gamification_rules")
public class GamificationRule {
    @Id
    private String id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(name = "event_trigger", nullable = false, length = 100)
    private String eventTrigger;

    @Column(name = "condition_expression", nullable = false, length = 500)
    private String conditionExpression;

    @Column(name = "reward_points")
    private Integer rewardPoints = 0;

    @Column(name = "reward_badge_id", length = 100)
    private String rewardBadgeId;

    @Column(name = "reward_title", length = 200)
    private String rewardTitle;

    @Column(nullable = false)
    private boolean active = true;

    public GamificationRule() {}

    public GamificationRule(String id, String name, String eventTrigger, String conditionExpression, Integer rewardPoints, String rewardBadgeId, String rewardTitle) {
        this.id = id;
        this.name = name;
        this.eventTrigger = eventTrigger;
        this.conditionExpression = conditionExpression;
        this.rewardPoints = rewardPoints;
        this.rewardBadgeId = rewardBadgeId;
        this.rewardTitle = rewardTitle;
        this.active = true;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEventTrigger() { return eventTrigger; }
    public void setEventTrigger(String eventTrigger) { this.eventTrigger = eventTrigger; }
    public String getConditionExpression() { return conditionExpression; }
    public void setConditionExpression(String conditionExpression) { this.conditionExpression = conditionExpression; }
    public Integer getRewardPoints() { return rewardPoints; }
    public void setRewardPoints(Integer rewardPoints) { this.rewardPoints = rewardPoints; }
    public String getRewardBadgeId() { return rewardBadgeId; }
    public void setRewardBadgeId(String rewardBadgeId) { this.rewardBadgeId = rewardBadgeId; }
    public String getRewardTitle() { return rewardTitle; }
    public void setRewardTitle(String rewardTitle) { this.rewardTitle = rewardTitle; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
