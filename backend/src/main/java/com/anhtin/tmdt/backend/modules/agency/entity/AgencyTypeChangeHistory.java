package com.anhtin.tmdt.backend.modules.agency.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "agency_type_change_history")
@NoArgsConstructor
@AllArgsConstructor
public class AgencyTypeChangeHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agency_id", nullable = false)
    private Long agencyId;

    @Column(name = "old_type", length = 20)
    private String oldType;

    @Column(name = "new_type", length = 20, nullable = false)
    private String newType;

    @Column(name = "changed_by")
    private Long changedBy;

    @Column(name = "changed_by_name", length = 100)
    private String changedByName;

    @Column(columnDefinition = "text")
    private String reason;

    @Column(name = "terms_version")
    private Integer termsVersion;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public String getOldType() { return oldType; }
    public void setOldType(String oldType) { this.oldType = oldType; }
    public String getNewType() { return newType; }
    public void setNewType(String newType) { this.newType = newType; }
    public Long getChangedBy() { return changedBy; }
    public void setChangedBy(Long changedBy) { this.changedBy = changedBy; }
    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public Integer getTermsVersion() { return termsVersion; }
    public void setTermsVersion(Integer termsVersion) { this.termsVersion = termsVersion; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}