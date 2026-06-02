package com.anhtin.tmdt.backend.modules.salespolicy.entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_policy_product_groups")
public class SalesPolicyProductGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sales_policy_id")
    private Long salesPolicyId;

    @Column(name = "group_name", nullable = false)
    private String groupName;

    @Column(name = "group_index")
    private Integer groupIndex;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    @OrderBy("id ASC")
    private List<SalesPolicyProductGroupItem> items = new ArrayList<>();

    public SalesPolicyProductGroup() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSalesPolicyId() {
        return salesPolicyId;
    }

    public void setSalesPolicyId(Long salesPolicyId) {
        this.salesPolicyId = salesPolicyId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public Integer getGroupIndex() {
        return groupIndex;
    }

    public void setGroupIndex(Integer groupIndex) {
        this.groupIndex = groupIndex;
    }

    public List<SalesPolicyProductGroupItem> getItems() {
        return items;
    }

    public void setItems(List<SalesPolicyProductGroupItem> items) {
        this.items = items;
    }
}
