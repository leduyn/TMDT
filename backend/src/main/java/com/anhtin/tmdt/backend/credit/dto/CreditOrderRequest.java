package com.anhtin.tmdt.backend.credit.dto;

import lombok.Data;

@Data
public class CreditOrderRequest {
    private Long agentId;
    private Long orderId;
    private Double amount;
    private String requestId; // Idempotency key
}
