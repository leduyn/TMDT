package com.anhtin.tmdt.backend.modules.loyalty.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "badges")
public class Badge {
    @Id
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String icon;

    @Column(name = "color_gradient", length = 255)
    private String colorGradient;

    @Column(nullable = false)
    private boolean active = true;

    public Badge() {}

    public Badge(String id, String name, String description, String icon, String colorGradient) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.icon = icon;
        this.colorGradient = colorGradient;
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
}
