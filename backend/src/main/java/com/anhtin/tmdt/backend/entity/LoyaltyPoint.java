package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_points")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyPoint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(name = "points_balance")
    private Integer pointsBalance = 0;

    @Column(name = "total_earned")
    private Integer totalEarned = 0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
