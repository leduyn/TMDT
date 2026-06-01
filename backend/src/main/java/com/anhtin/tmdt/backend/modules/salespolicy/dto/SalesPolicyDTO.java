package com.anhtin.tmdt.backend.modules.salespolicy.dto;

import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicy;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyProductGroup;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyProductGroupItem;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class SalesPolicyDTO {
    private Long id;
    private String name;
    private boolean active;
    private String description;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String tags;
    private Integer maxOrderCount;
    private Integer maxApplicationPerAgency;
    private String targetType;
    private String conditionType;
    private Double maxDiscountValue;
    private String policyType;
    private Double minOrderValue;
    private Double maxDiscountPerOrder;
    private Integer maxUsagePerCustomer;
    private String applicablePaymentMethods;
    private String applicableOrderSources;
    private boolean applyToAllProducts;
    private LocalDateTime createdAt;

    private Set<Long> includedAgencyIds = new HashSet<>();
    private List<String> includedAgencyNames = new ArrayList<>();

    private Set<Long> excludedAgencyIds = new HashSet<>();
    private List<String> excludedAgencyNames = new ArrayList<>();

    private Set<Long> targetProductIds = new HashSet<>();
    private List<String> targetProductNames = new ArrayList<>();

    private Set<Long> targetCategoryIds = new HashSet<>();
    private List<String> targetCategoryNames = new ArrayList<>();

    private Set<Long> excludedProductIds = new HashSet<>();
    private List<String> excludedProductNames = new ArrayList<>();

    private Set<Long> excludedCategoryIds = new HashSet<>();
    private List<String> excludedCategoryNames = new ArrayList<>();

    private List<AudienceFilterResponse> audienceFilters = new ArrayList<>();
    private List<TierResponse> tiers = new ArrayList<>();
    private List<ProductGroupResponse> productGroups = new ArrayList<>();

    public static class AudienceFilterResponse {
        private Long id;
        private String rankLevels;
        private String provinces;

        public AudienceFilterResponse() {}

        public AudienceFilterResponse(Long id, String rankLevels, String provinces) {
            this.id = id;
            this.rankLevels = rankLevels;
            this.provinces = provinces;
        }

        public Long getId() { return id; }
        public String getRankLevels() { return rankLevels; }
        public String getProvinces() { return provinces; }
    }

    public static class TierResponse {
        private Long id;
        private Integer tierIndex;
        private String operator;
        private Double thresholdValue;
        private String adjustmentType;
        private Double adjustmentValue;
        private Long giftProductId;
        private String giftProductName;
        private Integer giftQuantity;
        private String giftNote;

        public TierResponse() {}

        public TierResponse(Long id, Integer tierIndex, String operator, Double thresholdValue, 
                            String adjustmentType, Double adjustmentValue, Long giftProductId, 
                            String giftProductName, Integer giftQuantity, String giftNote) {
            this.id = id;
            this.tierIndex = tierIndex;
            this.operator = operator;
            this.thresholdValue = thresholdValue;
            this.adjustmentType = adjustmentType;
            this.adjustmentValue = adjustmentValue;
            this.giftProductId = giftProductId;
            this.giftProductName = giftProductName;
            this.giftQuantity = giftQuantity;
            this.giftNote = giftNote;
        }

        public Long getId() { return id; }
        public Integer getTierIndex() { return tierIndex; }
        public String getOperator() { return operator; }
        public Double getThresholdValue() { return thresholdValue; }
        public String getAdjustmentType() { return adjustmentType; }
        public Double getAdjustmentValue() { return adjustmentValue; }
        public Long getGiftProductId() { return giftProductId; }
        public String getGiftProductName() { return giftProductName; }
        public Integer getGiftQuantity() { return giftQuantity; }
        public String getGiftNote() { return giftNote; }
    }

    public SalesPolicyDTO() {}

    public SalesPolicyDTO(SalesPolicy policy) {
        this.id = policy.getId();
        this.name = policy.getName();
        this.active = policy.isActive();
        this.description = policy.getDescription();
        this.startDate = policy.getStartDate();
        this.endDate = policy.getEndDate();
        this.tags = policy.getTags();
        this.maxOrderCount = policy.getMaxOrderCount();
        this.maxApplicationPerAgency = policy.getMaxApplicationPerAgency();
        this.targetType = policy.getTargetType();
        this.conditionType = policy.getConditionType() != null ? policy.getConditionType().name() : null;
        this.maxDiscountValue = policy.getMaxDiscountValue();
        this.policyType = policy.getPolicyType();
        this.minOrderValue = policy.getMinOrderValue();
        this.maxDiscountPerOrder = policy.getMaxDiscountPerOrder();
        this.maxUsagePerCustomer = policy.getMaxUsagePerCustomer();
        this.applicablePaymentMethods = policy.getApplicablePaymentMethods();
        this.applicableOrderSources = policy.getApplicableOrderSources();
        this.applyToAllProducts = policy.isApplyToAllProducts();
        this.createdAt = policy.getCreatedAt();

        if (policy.getIncludedAgencies() != null) {
            this.includedAgencyIds = policy.getIncludedAgencies().stream().map(a -> a.getId()).collect(Collectors.toSet());
            this.includedAgencyNames = policy.getIncludedAgencies().stream().map(a -> a.getName()).collect(Collectors.toList());
        }
        if (policy.getExcludedAgencies() != null) {
            this.excludedAgencyIds = policy.getExcludedAgencies().stream().map(a -> a.getId()).collect(Collectors.toSet());
            this.excludedAgencyNames = policy.getExcludedAgencies().stream().map(a -> a.getName()).collect(Collectors.toList());
        }
        if (policy.getTargetProducts() != null) {
            this.targetProductIds = policy.getTargetProducts().stream().map(p -> p.getId()).collect(Collectors.toSet());
            this.targetProductNames = policy.getTargetProducts().stream().map(p -> p.getName()).collect(Collectors.toList());
        }
        if (policy.getTargetCategories() != null) {
            this.targetCategoryIds = policy.getTargetCategories().stream().map(c -> c.getId()).collect(Collectors.toSet());
            this.targetCategoryNames = policy.getTargetCategories().stream().map(c -> c.getName()).collect(Collectors.toList());
        }
        if (policy.getExcludedProducts() != null) {
            this.excludedProductIds = policy.getExcludedProducts().stream().map(p -> p.getId()).collect(Collectors.toSet());
            this.excludedProductNames = policy.getExcludedProducts().stream().map(p -> p.getName()).collect(Collectors.toList());
        }
        if (policy.getExcludedCategories() != null) {
            this.excludedCategoryIds = policy.getExcludedCategories().stream().map(c -> c.getId()).collect(Collectors.toSet());
            this.excludedCategoryNames = policy.getExcludedCategories().stream().map(c -> c.getName()).collect(Collectors.toList());
        }

        if (policy.getAudienceFilters() != null) {
            this.audienceFilters = policy.getAudienceFilters().stream()
                .map(f -> new AudienceFilterResponse(f.getId(), f.getRankLevels(), f.getProvinces()))
                .collect(Collectors.toList());
        }

        if (policy.getTiers() != null) {
            this.tiers = policy.getTiers().stream()
                .map(t -> new TierResponse(
                    t.getId(), 
                    t.getTierIndex(), 
                    t.getOperator(), 
                    t.getThresholdValue(), 
                    t.getAdjustmentType(), 
                    t.getAdjustmentValue(),
                    t.getGiftProduct() != null ? t.getGiftProduct().getId() : null,
                    t.getGiftProduct() != null ? t.getGiftProduct().getName() : null,
                    t.getGiftQuantity(),
                    t.getGiftNote()
                ))
                .collect(Collectors.toList());
        }

        if (policy.getProductGroups() != null) {
            this.productGroups = policy.getProductGroups().stream()
                .map(ProductGroupResponse::new)
                .collect(Collectors.toList());
        }
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public boolean isActive() { return active; }
    public String getDescription() { return description; }
    public LocalDateTime getStartDate() { return startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public String getTags() { return tags; }
    public Integer getMaxOrderCount() { return maxOrderCount; }
    public Integer getMaxApplicationPerAgency() { return maxApplicationPerAgency; }
    public String getTargetType() { return targetType; }
    public String getConditionType() { return conditionType; }
    public Double getMaxDiscountValue() { return maxDiscountValue; }

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
    public LocalDateTime getCreatedAt() { return createdAt; }

    public Set<Long> getIncludedAgencyIds() { return includedAgencyIds; }
    public List<String> getIncludedAgencyNames() { return includedAgencyNames; }

    public Set<Long> getExcludedAgencyIds() { return excludedAgencyIds; }
    public List<String> getExcludedAgencyNames() { return excludedAgencyNames; }

    public Set<Long> getTargetProductIds() { return targetProductIds; }
    public List<String> getTargetProductNames() { return targetProductNames; }

    public Set<Long> getTargetCategoryIds() { return targetCategoryIds; }
    public List<String> getTargetCategoryNames() { return targetCategoryNames; }

    public Set<Long> getExcludedProductIds() { return excludedProductIds; }
    public List<String> getExcludedProductNames() { return excludedProductNames; }

    public Set<Long> getExcludedCategoryIds() { return excludedCategoryIds; }
    public List<String> getExcludedCategoryNames() { return excludedCategoryNames; }

    public List<AudienceFilterResponse> getAudienceFilters() { return audienceFilters; }
    public List<TierResponse> getTiers() { return tiers; }

    public List<ProductGroupResponse> getProductGroups() { return productGroups; }
    public void setProductGroups(List<ProductGroupResponse> productGroups) { this.productGroups = productGroups; }

    public static class ProductGroupResponse {
        private Long id;
        private String groupName;
        private Integer groupIndex;
        private List<ProductGroupItemResponse> items = new ArrayList<>();

        public ProductGroupResponse() {}

        public ProductGroupResponse(SalesPolicyProductGroup group) {
            this.id = group.getId();
            this.groupName = group.getGroupName();
            this.groupIndex = group.getGroupIndex();
            if (group.getItems() != null) {
                this.items = group.getItems().stream()
                    .map(ProductGroupItemResponse::new)
                    .collect(Collectors.toList());
            }
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getGroupName() { return groupName; }
        public void setGroupName(String groupName) { this.groupName = groupName; }

        public Integer getGroupIndex() { return groupIndex; }
        public void setGroupIndex(Integer groupIndex) { this.groupIndex = groupIndex; }

        public List<ProductGroupItemResponse> getItems() { return items; }
        public void setItems(List<ProductGroupItemResponse> items) { this.items = items; }
    }

    public static class ProductGroupItemResponse {
        private Long id;
        private String itemType; // PRODUCT, CATEGORY
        private Long itemId;
        private String itemName;
        private String description;
        private String operator;
        private String adjustmentType;
        private Double adjustmentValue;
        private Long giftProductId;
        private String giftProductName;
        private Integer giftQuantity;
        private String giftNote;

        public ProductGroupItemResponse() {}

        public ProductGroupItemResponse(SalesPolicyProductGroupItem item) {
            this.id = item.getId();
            this.itemType = item.getItemType();
            this.itemId = item.getItemId();
            this.description = item.getDescription();
            this.operator = item.getOperator();
            this.adjustmentType = item.getAdjustmentType();
            this.adjustmentValue = item.getAdjustmentValue();
            this.giftProductId = item.getGiftProductId();
            this.giftQuantity = item.getGiftQuantity();
            this.giftNote = item.getGiftNote();
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getItemType() { return itemType; }
        public void setItemType(String itemType) { this.itemType = itemType; }

        public Long getItemId() { return itemId; }
        public void setItemId(Long itemId) { this.itemId = itemId; }

        public String getItemName() { return itemName; }
        public void setItemName(String itemName) { this.itemName = itemName; }

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

        public String getGiftProductName() { return giftProductName; }
        public void setGiftProductName(String giftProductName) { this.giftProductName = giftProductName; }

        public Integer getGiftQuantity() { return giftQuantity; }
        public void setGiftQuantity(Integer giftQuantity) { this.giftQuantity = giftQuantity; }

        public String getGiftNote() { return giftNote; }
        public void setGiftNote(String giftNote) { this.giftNote = giftNote; }
    }
}
