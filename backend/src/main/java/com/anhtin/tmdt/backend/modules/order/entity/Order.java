package com.anhtin.tmdt.backend.modules.order.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.anhtin.tmdt.backend.modules.customer.entity.Customer;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id")
    private Agency agency;

    private Double totalAmount;
    
    private String status; 

    @Enumerated(EnumType.STRING)
    @Column(name = "order_type")
    private OrderType orderType; 

    private String shippingAddress;

    @Column(name = "promotion_code")
    private String promotionCode;

    @Column(name = "points_redeemed")
    private Integer pointsRedeemed = 0;

    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;
    
    @Column(name = "delivery_fee")
    private Double deliveryFee = 0.0;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "debt_term_days")
    private Integer debtTermDays;

    private LocalDateTime orderDate = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "price_list_id")
    private Long priceListId;

    @Column(name = "receiver_type")
    private String receiverType;

    @Column(name = "payment_method", length = 100)
    private String paymentMethod;

    @Column(name = "order_source", length = 100)
    private String orderSource;

    @Column(name = "invoice_name")
    private String invoiceName;

    @Column(name = "invoice_tax_code")
    private String invoiceTaxCode;

    @Column(name = "invoice_address", columnDefinition = "TEXT")
    private String invoiceAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(name = "updated_date")
    private LocalDateTime updatedDate = LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public OrderType getOrderType() { return orderType; }
    public void setOrderType(OrderType orderType) { this.orderType = orderType; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getPromotionCode() { return promotionCode; }
    public void setPromotionCode(String promotionCode) { this.promotionCode = promotionCode; }
    public Integer getPointsRedeemed() { return pointsRedeemed; }
    public void setPointsRedeemed(Integer pointsRedeemed) { this.pointsRedeemed = pointsRedeemed; }
    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }
    public Double getDeliveryFee() { return deliveryFee; }
    public void setDeliveryFee(Double deliveryFee) { this.deliveryFee = deliveryFee; }
    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }
    public Integer getDebtTermDays() { return debtTermDays; }
    public void setDebtTermDays(Integer debtTermDays) { this.debtTermDays = debtTermDays; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
    public Long getPriceListId() { return priceListId; }
    public void setPriceListId(Long priceListId) { this.priceListId = priceListId; }
    public String getReceiverType() { return receiverType; }
    public void setReceiverType(String receiverType) { this.receiverType = receiverType; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getOrderSource() { return orderSource; }
    public void setOrderSource(String orderSource) { this.orderSource = orderSource; }
    public String getInvoiceName() { return invoiceName; }
    public void setInvoiceName(String invoiceName) { this.invoiceName = invoiceName; }
    public String getInvoiceTaxCode() { return invoiceTaxCode; }
    public void setInvoiceTaxCode(String invoiceTaxCode) { this.invoiceTaxCode = invoiceTaxCode; }
    public String getInvoiceAddress() { return invoiceAddress; }
    public void setInvoiceAddress(String invoiceAddress) { this.invoiceAddress = invoiceAddress; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public LocalDateTime getUpdatedDate() { return updatedDate; }
    public void setUpdatedDate(LocalDateTime updatedDate) { this.updatedDate = updatedDate; }
}
