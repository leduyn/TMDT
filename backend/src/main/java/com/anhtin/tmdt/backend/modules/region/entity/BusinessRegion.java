package com.anhtin.tmdt.backend.modules.region.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "business_regions")
public class BusinessRegion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    private boolean active = true;

    @OneToMany(mappedBy = "region", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<Ward> wards = new java.util.ArrayList<>();

    public BusinessRegion() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public java.util.List<Ward> getWards() { return wards; }
    public void setWards(java.util.List<Ward> wards) { this.wards = wards; }

    public void addWard(Ward ward) {
        wards.add(ward);
        ward.setRegion(this);
    }

    public void removeWard(Ward ward) {
        wards.remove(ward);
        ward.setRegion(null);
    }
}
