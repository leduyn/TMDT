package com.anhtin.tmdt.backend.modules.agency.dto;

import java.time.LocalDateTime;

public class AgencyTypeChangeHistoryDTO {

    private Long id;
    private Long agencyId;
    private String oldType;
    private String newType;
    private String changedByName;
    private String reason;
    private LocalDateTime createdAt;

    public AgencyTypeChangeHistoryDTO() {}

    public AgencyTypeChangeHistoryDTO(
        Long id, Long agencyId, String oldType, String newType,
        String changedByName, String reason, LocalDateTime createdAt
    ) {
        this.id = id;
        this.agencyId = agencyId;
        this.oldType = oldType;
        this.newType = newType;
        this.changedByName = changedByName;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public String getOldType() { return oldType; }
    public void setOldType(String oldType) { this.oldType = oldType; }
    public String getNewType() { return newType; }
    public void setNewType(String newType) { this.newType = newType; }
    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}