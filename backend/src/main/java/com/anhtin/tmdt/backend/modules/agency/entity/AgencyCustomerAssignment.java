package com.anhtin.tmdt.backend.modules.agency.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import com.anhtin.tmdt.backend.modules.customer.entity.Customer;

@Entity
@Table(name = "agency_customer_assignments")
@NoArgsConstructor
@AllArgsConstructor
public class AgencyCustomerAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agency_id", nullable = false)
    private Agency agency;

    private String customName;
    private String customShippingAddress;
    private String customPhone;
    private boolean approved = false;

    @Column(name = "total_debt", nullable = false)
    private Double totalDebt = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public Agency getAgency() { return agency; }
    public void setAgency(Agency agency) { this.agency = agency; }
    public String getCustomName() { return customName; }
    public void setCustomName(String customName) { this.customName = customName; }
    public String getCustomShippingAddress() { return customShippingAddress; }
    public void setCustomShippingAddress(String customShippingAddress) { this.customShippingAddress = customShippingAddress; }
    public String getCustomPhone() { return customPhone; }
    public void setCustomPhone(String customPhone) { this.customPhone = customPhone; }
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public Double getTotalDebt() { return totalDebt; }
    public void setTotalDebt(Double totalDebt) { this.totalDebt = totalDebt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
