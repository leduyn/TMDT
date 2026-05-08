package com.anhtin.tmdt.backend.credit.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_ledger")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreditLedger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "agency_id", nullable = false)
    private Long agencyId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LedgerType type;

    @Column(nullable = false)
    private Double amount;

    @Column(name = "reference_id")
    private String referenceId; // orderId, paymentId, etc.

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum LedgerType {
        DEBT, PAYMENT, INTEREST, HOLD, REFUND
    }
}
