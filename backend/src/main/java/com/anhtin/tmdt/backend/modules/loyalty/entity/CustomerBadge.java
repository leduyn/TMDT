package com.anhtin.tmdt.backend.modules.loyalty.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.anhtin.tmdt.backend.modules.user.entity.User;

@Entity
@Table(name = "customer_badges", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"customer_id", "badge_id"})
})
public class CustomerBadge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(name = "earned_at")
    private LocalDateTime earnedAt = LocalDateTime.now();

    public CustomerBadge() {}

    public CustomerBadge(User customer, Badge badge) {
        this.customer = customer;
        this.badge = badge;
        this.earnedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    public Badge getBadge() { return badge; }
    public void setBadge(Badge badge) { this.badge = badge; }
    public LocalDateTime getEarnedAt() { return earnedAt; }
    public void setEarnedAt(LocalDateTime earnedAt) { this.earnedAt = earnedAt; }
}
