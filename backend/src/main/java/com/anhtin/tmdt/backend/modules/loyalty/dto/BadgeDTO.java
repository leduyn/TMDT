package com.anhtin.tmdt.backend.modules.loyalty.dto;

import java.time.LocalDateTime;

public class BadgeDTO {
    private String id;
    private String name;
    private String description;
    private String icon;
    private String colorGradient;
    private boolean active;
    private boolean earned;
    private LocalDateTime earnedAt;

    public BadgeDTO() {}

    public BadgeDTO(String id, String name, String description, String icon, String colorGradient, boolean active, boolean earned, LocalDateTime earnedAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.colorGradient = colorGradient;
        this.active = active;
        this.earned = earned;
        this.earnedAt = earnedAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getColorGradient() { return colorGradient; }
    public void setColorGradient(String colorGradient) { this.colorGradient = colorGradient; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isEarned() { return earned; }
    public void setEarned(boolean earned) { this.earned = earned; }
    public LocalDateTime getEarnedAt() { return earnedAt; }
    public void setEarnedAt(LocalDateTime earnedAt) { this.earnedAt = earnedAt; }
}
