package com.anhtin.tmdt.backend.modules.order.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

/**
 * Bảng ghi nhận giao dịch tài chính (đối soát) cho mỗi đơn hàng.
 * Dùng để theo dõi dòng tiền: tổng thu, phí sàn, thu nhập ròng Đại lý.
 */
@Entity
@Table(name = "transactions")
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id")
    private Agency agency;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "platform_fee")
    private Double platformFee = 0.0;

    @Column(name = "agency_commission")
    private Double agencyCommission = 0.0;

    @Column(name = "agency_net_income")
    private Double agencyNetIncome = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type")
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public Double getPlatformFee() { return platformFee; }
    public void setPlatformFee(Double platformFee) { this.platformFee = platformFee; }
    public Double getAgencyCommission() { return agencyCommission; }
    public void setAgencyCommission(Double agencyCommission) { this.agencyCommission = agencyCommission; }
    public Double getAgencyNetIncome() { return agencyNetIncome; }
    public void setAgencyNetIncome(Double agencyNetIncome) { this.agencyNetIncome = agencyNetIncome; }
    public OrderType getOrderType() { return orderType; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(PaymentStatus paymentStatus) { this.paymentStatus = paymentStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
