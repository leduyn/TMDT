package com.anhtin.tmdt.backend.modules.loyalty.dto;

import java.time.LocalDateTime;

public class CertificateDTO {
    private Long id;
    private String title;
    private String reason;
    private LocalDateTime earnedAt;
    private String customerName;

    public CertificateDTO() {}

    public CertificateDTO(Long id, String title, String reason, LocalDateTime earnedAt, String customerName) {
        this.id = id;
        this.title = title;
        this.reason = reason;
        this.earnedAt = earnedAt;
        this.customerName = customerName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getEarnedAt() { return earnedAt; }
    public void setEarnedAt(LocalDateTime earnedAt) { this.earnedAt = earnedAt; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
}
