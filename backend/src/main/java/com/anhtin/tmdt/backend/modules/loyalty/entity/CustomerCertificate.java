package com.anhtin.tmdt.backend.modules.loyalty.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.anhtin.tmdt.backend.modules.user.entity.User;

@Entity
@Table(name = "customer_certificates")
public class CustomerCertificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "earned_at")
    private LocalDateTime earnedAt = LocalDateTime.now();

    public CustomerCertificate() {}

    public CustomerCertificate(User customer, String title, String reason) {
        this.customer = customer;
        this.title = title;
        this.reason = reason;
        this.earnedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getEarnedAt() { return earnedAt; }
    public void setEarnedAt(LocalDateTime earnedAt) { this.earnedAt = earnedAt; }
}
