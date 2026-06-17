package com.anhtin.tmdt.backend.modules.product.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "brands")
@NoArgsConstructor
@AllArgsConstructor
public class Brand {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "bravo_id")
    private Long bravoId;

    @Column(name = "is_highlight")
    private Integer isHighlight;

    @Column(name = "highlight_priority")
    private Integer highlightPriority;

    private Integer status;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    @Column(name = "bravo_sort_value")
    private String bravoSortValue;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedDate = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public Long getBravoId() { return bravoId; }
    public void setBravoId(Long bravoId) { this.bravoId = bravoId; }
    public Integer getIsHighlight() { return isHighlight; }
    public void setIsHighlight(Integer isHighlight) { this.isHighlight = isHighlight; }
    public Integer getHighlightPriority() { return highlightPriority; }
    public void setHighlightPriority(Integer highlightPriority) { this.highlightPriority = highlightPriority; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public String getBravoSortValue() { return bravoSortValue; }
    public void setBravoSortValue(String bravoSortValue) { this.bravoSortValue = bravoSortValue; }
    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
}
