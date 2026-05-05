package com.anhtin.tmdt.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

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
@Getter
@Setter
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

    /**
     * Hạng đại lý: BRONZE, SILVER, GOLD, PLATINUM, DIAMOND.
     * Chỉ dùng khi conditionType = AGENCY_RANK.
     */
    @Column(name = "rank_level")
    private String rankLevel;

    /**
     * FK → CustomerGroup.
     * Chỉ dùng khi conditionType = CUSTOMER_GROUP.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_group_id")
    private CustomerGroup customerGroup;

    /**
     * Độ ưu tiên: số lớn hơn = ưu tiên cao hơn.
     */
    @Column(nullable = false)
    private Integer priority = 0;
}
