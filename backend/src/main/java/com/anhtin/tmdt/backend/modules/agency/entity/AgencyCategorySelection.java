package com.anhtin.tmdt.backend.modules.agency.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "agency_category_selections")
public class AgencyCategorySelection {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agency_id", nullable = false)
    private Long agencyId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "source", length = 50)
    private String source = "MANUAL";

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
}
