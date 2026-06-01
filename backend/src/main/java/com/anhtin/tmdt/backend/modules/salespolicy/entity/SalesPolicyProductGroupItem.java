package com.anhtin.tmdt.backend.modules.salespolicy.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "sales_policy_product_group_items")
public class SalesPolicyProductGroupItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "group_id")
    private Long groupId;

    @Column(name = "item_type", nullable = false, length = 50)
    private String itemType; // PRODUCT, CATEGORY

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "operator", length = 10)
    private String operator;

    @Column(name = "adjustment_type", length = 50)
    private String adjustmentType;

    @Column(name = "adjustment_value")
    private Double adjustmentValue;

    @Column(name = "gift_product_id")
    private Long giftProductId;

    @Column(name = "gift_quantity")
    private Integer giftQuantity;

    @Column(name = "gift_note", length = 500)
    private String giftNote;

    public SalesPolicyProductGroupItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getGroupId() { return groupId; }
    public void setGroupId(Long groupId) { this.groupId = groupId; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }

    public String getAdjustmentType() { return adjustmentType; }
    public void setAdjustmentType(String adjustmentType) { this.adjustmentType = adjustmentType; }

    public Double getAdjustmentValue() { return adjustmentValue; }
    public void setAdjustmentValue(Double adjustmentValue) { this.adjustmentValue = adjustmentValue; }

    public Long getGiftProductId() { return giftProductId; }
    public void setGiftProductId(Long giftProductId) { this.giftProductId = giftProductId; }

    public Integer getGiftQuantity() { return giftQuantity; }
    public void setGiftQuantity(Integer giftQuantity) { this.giftQuantity = giftQuantity; }

    public String getGiftNote() { return giftNote; }
    public void setGiftNote(String giftNote) { this.giftNote = giftNote; }
}
