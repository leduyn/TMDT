package com.anhtin.tmdt.backend.modules.salespolicy.entity;

import jakarta.persistence.*;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@Entity
@Table(name = "sales_policy_tiers")
public class SalesPolicyTier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sales_policy_id")
    private Long salesPolicyId;

    @Column(name = "tier_index")
    private Integer tierIndex; // Số thứ tự bậc

    @Column(name = "operator", length = 10)
    private String operator; // GTE (>=), LTE (<=), GT (>), LT (<), EQ (=)

    @Column(name = "threshold_value")
    private Double thresholdValue; // Ngưỡng xét duyệt (VND hoặc Số lượng)

    @Column(name = "adjustment_type", length = 50)
    private String adjustmentType; // PERCENTAGE (Chiết khấu %), FIXED_AMOUNT (Trừ tiền), SPECIFIC_PRICE (Giá chỉ định)

    @Column(name = "adjustment_value")
    private Double adjustmentValue; // Giá trị chiết khấu

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gift_product_id")
    private Product giftProduct; // Sản phẩm quà tặng đi kèm (để chèn vào order_items với giá giảm 100%)

    @Column(name = "gift_quantity")
    private Integer giftQuantity; // Số lượng quà tặng

    @Column(name = "gift_note", length = 500)
    private String giftNote; // Ghi chú quà tặng kèm (Text mô tả bổ sung)

    public SalesPolicyTier() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSalesPolicyId() { return salesPolicyId; }
    public void setSalesPolicyId(Long salesPolicyId) { this.salesPolicyId = salesPolicyId; }

    public Integer getTierIndex() { return tierIndex; }
    public void setTierIndex(Integer tierIndex) { this.tierIndex = tierIndex; }

    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }

    public Double getThresholdValue() { return thresholdValue; }
    public void setThresholdValue(Double thresholdValue) { this.thresholdValue = thresholdValue; }

    public String getAdjustmentType() { return adjustmentType; }
    public void setAdjustmentType(String adjustmentType) { this.adjustmentType = adjustmentType; }

    public Double getAdjustmentValue() { return adjustmentValue; }
    public void setAdjustmentValue(Double adjustmentValue) { this.adjustmentValue = adjustmentValue; }

    public Product getGiftProduct() { return giftProduct; }
    public void setGiftProduct(Product giftProduct) { this.giftProduct = giftProduct; }

    public Integer getGiftQuantity() { return giftQuantity; }
    public void setGiftQuantity(Integer giftQuantity) { this.giftQuantity = giftQuantity; }

    public String getGiftNote() { return giftNote; }
    public void setGiftNote(String giftNote) { this.giftNote = giftNote; }
}
