package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "agencies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Agency {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    private String phone;
    private String address;

    @Column(nullable = false)
    private Double latitude = 0.0;

    @Column(nullable = false)
    private Double longitude = 0.0;

    @Column(name = "default_commission_rate")
    private Double defaultCommissionRate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "varchar(255) default 'PENDING'")
    private AgencyStatus status = AgencyStatus.PENDING;

    private boolean active = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
