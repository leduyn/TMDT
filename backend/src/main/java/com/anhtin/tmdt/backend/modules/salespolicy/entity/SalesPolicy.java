package com.anhtin.tmdt.backend.modules.salespolicy.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@Entity
@Table(name = "sales_policies")
public class SalesPolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    private boolean active = true;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(name = "tags", length = 500)
    private String tags; // e.g. "HOT,HÈ 2026"

    @Column(name = "max_order_count")
    private Integer maxOrderCount; // Số lượng đơn tối đa, null nếu không giới hạn

    @Column(name = "max_application_per_agency")
    private Integer maxApplicationPerAgency; // Lượt áp dụng/đại lý, null nếu không giới hạn

    @Column(name = "target_type")
    private String targetType; // ORDER_VALUE, PRODUCT_QTY, PRODUCT_REVENUE

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_type", length = 50)
    private SalesPolicyConditionType conditionType; // MIN_PRODUCT_QTY, CUSTOM_QTY, PRODUCT_VALUE

    @Column(name = "max_discount_value")
    private Double maxDiscountValue; // Giá trị xét tối đa trên mỗi đơn

    @Column(name = "policy_type", length = 20)
    private String policyType = "SALES_POLICY"; // SALES_POLICY, RETAIL_POLICY, PROMOTION

    @Column(name = "min_order_value")
    private Double minOrderValue;

    @Column(name = "max_discount_per_order")
    private Double maxDiscountPerOrder;

    @Column(name = "max_usage_per_customer")
    private Integer maxUsagePerCustomer;

    @Column(name = "applicable_payment_methods", length = 500)
    private String applicablePaymentMethods;

    @Column(name = "applicable_order_sources", length = 500)
    private String applicableOrderSources;

    @Column(name = "apply_to_all_products")
    private boolean applyToAllProducts = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // 1. Đối tượng đại lý chỉ định & loại trừ
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "sales_policy_included_agencies",
        joinColumns = @JoinColumn(name = "sales_policy_id"),
        inverseJoinColumns = @JoinColumn(name = "agency_id")
    )
    private Set<Agency> includedAgencies = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "sales_policy_excluded_agencies",
        joinColumns = @JoinColumn(name = "sales_policy_id"),
        inverseJoinColumns = @JoinColumn(name = "agency_id")
    )
    private Set<Agency> excludedAgencies = new HashSet<>();

    // 2. Phạm vi nhóm sản phẩm áp dụng & loại trừ
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "sales_policy_target_products",
        joinColumns = @JoinColumn(name = "sales_policy_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Product> targetProducts = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "sales_policy_target_categories",
        joinColumns = @JoinColumn(name = "sales_policy_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> targetCategories = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "sales_policy_excluded_products",
        joinColumns = @JoinColumn(name = "sales_policy_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Product> excludedProducts = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "sales_policy_excluded_categories",
        joinColumns = @JoinColumn(name = "sales_policy_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> excludedCategories = new HashSet<>();

    // 3. Quan hệ One-To-Many với các bộ lọc OR & Tiers
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_policy_id")
    private Set<SalesPolicyAudienceFilter> audienceFilters = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_policy_id")
    @OrderBy("thresholdValue ASC")
    private Set<SalesPolicyTier> tiers = new HashSet<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_policy_id")
    @OrderBy("groupIndex ASC")
    private List<SalesPolicyProductGroup> productGroups = new ArrayList<>();

    public SalesPolicy() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Integer getMaxOrderCount() { return maxOrderCount; }
    public void setMaxOrderCount(Integer maxOrderCount) { this.maxOrderCount = maxOrderCount; }

    public Integer getMaxApplicationPerAgency() { return maxApplicationPerAgency; }
    public void setMaxApplicationPerAgency(Integer maxApplicationPerAgency) { this.maxApplicationPerAgency = maxApplicationPerAgency; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public SalesPolicyConditionType getConditionType() { return conditionType; }
    public void setConditionType(SalesPolicyConditionType conditionType) { this.conditionType = conditionType; }

    public Double getMaxDiscountValue() { return maxDiscountValue; }
    public void setMaxDiscountValue(Double maxDiscountValue) { this.maxDiscountValue = maxDiscountValue; }

    public String getPolicyType() { return policyType; }
    public void setPolicyType(String policyType) { this.policyType = policyType; }

    public Double getMinOrderValue() { return minOrderValue; }
    public void setMinOrderValue(Double minOrderValue) { this.minOrderValue = minOrderValue; }

    public Double getMaxDiscountPerOrder() { return maxDiscountPerOrder; }
    public void setMaxDiscountPerOrder(Double maxDiscountPerOrder) { this.maxDiscountPerOrder = maxDiscountPerOrder; }

    public Integer getMaxUsagePerCustomer() { return maxUsagePerCustomer; }
    public void setMaxUsagePerCustomer(Integer maxUsagePerCustomer) { this.maxUsagePerCustomer = maxUsagePerCustomer; }

    public String getApplicablePaymentMethods() { return applicablePaymentMethods; }
    public void setApplicablePaymentMethods(String applicablePaymentMethods) { this.applicablePaymentMethods = applicablePaymentMethods; }

    public String getApplicableOrderSources() { return applicableOrderSources; }
    public void setApplicableOrderSources(String applicableOrderSources) { this.applicableOrderSources = applicableOrderSources; }

    public boolean isApplyToAllProducts() { return applyToAllProducts; }
    public void setApplyToAllProducts(boolean applyToAllProducts) { this.applyToAllProducts = applyToAllProducts; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Set<Agency> getIncludedAgencies() { return includedAgencies; }
    public void setIncludedAgencies(Set<Agency> includedAgencies) { this.includedAgencies = includedAgencies; }

    public Set<Agency> getExcludedAgencies() { return excludedAgencies; }
    public void setExcludedAgencies(Set<Agency> excludedAgencies) { this.excludedAgencies = excludedAgencies; }

    public Set<Product> getTargetProducts() { return targetProducts; }
    public void setTargetProducts(Set<Product> targetProducts) { this.targetProducts = targetProducts; }

    public Set<Category> getTargetCategories() { return targetCategories; }
    public void setTargetCategories(Set<Category> targetCategories) { this.targetCategories = targetCategories; }

    public Set<Product> getExcludedProducts() { return excludedProducts; }
    public void setExcludedProducts(Set<Product> excludedProducts) { this.excludedProducts = excludedProducts; }

    public Set<Category> getExcludedCategories() { return excludedCategories; }
    public void setExcludedCategories(Set<Category> excludedCategories) { this.excludedCategories = excludedCategories; }

    public Set<SalesPolicyAudienceFilter> getAudienceFilters() { return audienceFilters; }
    public void setAudienceFilters(Set<SalesPolicyAudienceFilter> audienceFilters) { this.audienceFilters = audienceFilters; }

    public Set<SalesPolicyTier> getTiers() { return tiers; }
    public void setTiers(Set<SalesPolicyTier> tiers) { this.tiers = tiers; }

    public List<SalesPolicyProductGroup> getProductGroups() { return productGroups; }
    public void setProductGroups(List<SalesPolicyProductGroup> productGroups) { this.productGroups = productGroups; }
}
