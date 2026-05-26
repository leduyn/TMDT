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

    public SalesPolicyProductGroupItem() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getGroupId() {
        return groupId;
    }

    public void setGroupId(Long groupId) {
        this.groupId = groupId;
    }

    public String getItemType() {
        return itemType;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public Long getItemId() {
        return itemId;
    }

    public void setItemId(Long itemId) {
        this.itemId = itemId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
