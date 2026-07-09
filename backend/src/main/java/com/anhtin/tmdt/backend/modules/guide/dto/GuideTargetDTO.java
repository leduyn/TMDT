package com.anhtin.tmdt.backend.modules.guide.dto;

import com.anhtin.tmdt.backend.modules.guide.entity.GuideTarget;

import java.time.LocalDateTime;

public class GuideTargetDTO {

    private Long id;
    private String key;
    private String name;
    private String description;
    private String screenName;
    private LocalDateTime createdAt;

    public GuideTargetDTO() {}

    public GuideTargetDTO(GuideTarget target) {
        this.id = target.getId();
        this.key = target.getKey();
        this.name = target.getName();
        this.description = target.getDescription();
        this.screenName = target.getScreenName();
        this.createdAt = target.getCreatedAt();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getScreenName() { return screenName; }
    public void setScreenName(String screenName) { this.screenName = screenName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
