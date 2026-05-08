package com.anhtin.tmdt.backend.credit.entity;

import com.anhtin.tmdt.backend.entity.Agency;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "agent_credit")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AgentCredit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false, unique = true)
    private Agency agency;

    @Column(name = "credit_limit", nullable = false)
    private Double creditLimit = 0.0;

    @Column(name = "total_debt", nullable = false)
    private Double totalDebt = 0.0;

    @Column(name = "vtc_available", nullable = false)
    private Double vtcAvailable = 0.0;

    @Column(name = "vtc_hold", nullable = false)
    private Double vtcHold = 0.0;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
