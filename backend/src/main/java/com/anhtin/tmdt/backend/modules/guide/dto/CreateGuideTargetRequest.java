package com.anhtin.tmdt.backend.modules.guide.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateGuideTargetRequest {

    @NotBlank
    private String key;

    @NotBlank
    private String name;

    private String description;

    @NotBlank
    private String screenName;

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getScreenName() { return screenName; }
    public void setScreenName(String screenName) { this.screenName = screenName; }
}
