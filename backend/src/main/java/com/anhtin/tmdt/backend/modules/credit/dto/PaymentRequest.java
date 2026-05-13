package com.anhtin.tmdt.backend.modules.credit.dto;
import com.anhtin.tmdt.backend.modules.order.entity.Order;

public class PaymentRequest {
    private Long agentId;
    private Double amount;
    private Long orderId; // Optional: specify order to pay

    public Long getAgentId() { return agentId; }
    public void setAgentId(Long agentId) { this.agentId = agentId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
}
