package com.anhtin.tmdt.backend.modules.credit.dto;

public class CreditOrderRequest {
    private Long agentId;
    private Long orderId;
    private Double amount;
    private String requestId; // Idempotency key

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getRequestId() { return requestId; }
    public void setRequestId(String requestId) { this.requestId = requestId; }
}
