package com.anhtin.tmdt.backend.modules.price.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.customer.entity.CustomerGroup;

/**
 * Điều kiện áp dụng bảng giá tự động.
 *
 * conditionType = AGENCY_RANK  → áp dụng cho ĐL có hạng = rankLevel
 * conditionType = ALL_AGENCY   → áp dụng cho toàn bộ đại lý
 * conditionType = CUSTOMER_GROUP → áp dụng cho KH trong nhóm customerGroup
 * conditionType = ALL_CUSTOMER → áp dụng cho toàn bộ khách hàng
 *
 * priority: số lớn hơn = ưu tiên cao hơn (trong cùng loại điều kiện).
 */
@Entity
@Table(name = "price_list_conditions")
@NoArgsConstructor
@AllArgsConstructor
public class PriceListCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "price_list_id", nullable = false)
    private PriceList priceList;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_type", nullable = false)
    private PriceListConditionType conditionType;

    @Column(name = "rank_level")
    private String rankLevel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_group_id")
    private CustomerGroup customerGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private Integer priority = 0;

    @Column(name = "effective_from")
    private java.time.LocalDateTime effectiveFrom = java.time.LocalDateTime.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PriceList getPriceList() { return priceList; }
    public void setPriceList(PriceList priceList) { this.priceList = priceList; }
    public PriceListConditionType getConditionType() { return conditionType; }
    public void setConditionType(PriceListConditionType conditionType) { this.conditionType = conditionType; }
    public String getRankLevel() { return rankLevel; }
    public void setRankLevel(String rankLevel) { this.rankLevel = rankLevel; }
    public CustomerGroup getCustomerGroup() { return customerGroup; }
    public void setCustomerGroup(CustomerGroup customerGroup) { this.customerGroup = customerGroup; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
    public java.time.LocalDateTime getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(java.time.LocalDateTime effectiveFrom) { this.effectiveFrom = effectiveFrom; }
}
