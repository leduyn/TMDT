package com.anhtin.tmdt.backend.credit.dto;

import lombok.Data;

@Data
public class PaymentRequest {
    private Long agentId;
    private Double amount;
    private Long orderId; // Optional: specify order to pay
}
