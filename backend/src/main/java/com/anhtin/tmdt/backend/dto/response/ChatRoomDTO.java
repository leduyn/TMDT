package com.anhtin.tmdt.backend.dto.response;

import java.time.LocalDateTime;

public class ChatRoomDTO {
    public ChatRoomDTO() {}

    public ChatRoomDTO(Long id, Long agencyId, String agencyName, Long customerId, String customerName, long unreadCount, LocalDateTime createdAt) {
        this.id = id;
        this.agencyId = agencyId;
        this.agencyName = agencyName;
        this.customerId = customerId;
        this.customerName = customerName;
        this.unreadCount = unreadCount;
        this.createdAt = createdAt;
    }

    private Long id;
    private Long agencyId;
    private String agencyName;
    private Long customerId;
    private String customerName;
    private long unreadCount;
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAgencyId() { return agencyId; }
    public void setAgencyId(Long agencyId) { this.agencyId = agencyId; }
    public String getAgencyName() { return agencyName; }
    public void setAgencyName(String agencyName) { this.agencyName = agencyName; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
