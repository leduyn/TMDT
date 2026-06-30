package com.anhtin.tmdt.backend.modules.loyalty.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.anhtin.tmdt.backend.modules.user.entity.User;

@Entity
@Table(name = "customer_titles", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"customer_id", "title_name"})
})
public class CustomerTitle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(name = "title_name", nullable = false, length = 200)
    private String titleName;

    @Column(name = "earned_at")
    private LocalDateTime earnedAt = LocalDateTime.now();

    public CustomerTitle() {}

    public CustomerTitle(User customer, String titleName) {
        this.customer = customer;
        this.titleName = titleName;
        this.earnedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }
    public String getTitleName() { return titleName; }
    public void setTitleName(String titleName) { this.titleName = titleName; }
    public LocalDateTime getEarnedAt() { return earnedAt; }
    public void setEarnedAt(LocalDateTime earnedAt) { this.earnedAt = earnedAt; }
}
