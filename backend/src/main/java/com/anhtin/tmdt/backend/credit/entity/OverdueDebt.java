package com.anhtin.tmdt.backend.credit.entity;

import com.anhtin.tmdt.backend.entity.Order;
import com.anhtin.tmdt.backend.entity.Agency;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "overdue_debt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OverdueDebt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    @Column(name = "principal_amount", nullable = false)
    private Double principalAmount;

    @Column(name = "interest_accrued", nullable = false)
    private Double interestAccrued = 0.0;

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "last_calculated_at")
    private LocalDateTime lastCalculatedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OverdueStatus status = OverdueStatus.ACTIVE;

    public enum OverdueStatus {
        ACTIVE, CLOSED
    }
}
