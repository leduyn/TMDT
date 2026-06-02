package com.anhtin.tmdt.backend.modules.salespolicy.dto;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class SalesPolicyRequest {
    private String name;
    private Boolean active;
    private String description;
    private String startDate; // ISO format string
    private String endDate;   // ISO format string
    private String tags;
    private Integer maxOrderCount;
    private Integer maxApplicationPerAgency;
    private String targetType; // ORDER_VALUE, PRODUCT_QTY, PRODUCT_REVENUE
    private String conditionType; // MIN_PRODUCT_QTY, CUSTOM_QTY, PRODUCT_VALUE
    private Double maxDiscountValue;
    private String policyType;
    private Double minOrderValue;
    private Double maxDiscountPerOrder;
    private Integer maxUsagePerCustomer;
    private String applicablePaymentMethods;
    private String applicableOrderSources;
    private Boolean applyToAllProducts;

    private Set<Long> includedAgencyIds = new HashSet<>();
    private Set<Long> excludedAgencyIds = new HashSet<>();
    private Set<Long> targetProductIds = new HashSet<>();
    private Set<Long> targetCategoryIds = new HashSet<>();
    private Set<Long> excludedProductIds = new HashSet<>();
    private Set<Long> excludedCategoryIds = new HashSet<>();

    private List<AudienceFilterRequest> audienceFilters = new ArrayList<>();
    private List<TierRequest> tiers = new ArrayList<>();
    private List<ProductGroupRequest> productGroups = new ArrayList<>();

    public static class AudienceFilterRequest {
        private String rankLevels; // Phân tách bằng dấu phẩy
        private String provinces;   // Phân tách bằng dấu phẩy

        public AudienceFilterRequest() {}

        public String getRankLevels() { return rankLevels; }
        public void setRankLevels(String rankLevels) { this.rankLevels = rankLevels; }

        public String getProvinces() { return provinces; }
        public void setProvinces(String provinces) { this.provinces = provinces; }
    }

    public static class TierRequest {
        private Integer tierIndex;
        private String operator;
        private Double thresholdValue;
        private String adjustmentType;
        private Double adjustmentValue;
        private Long giftProductId; // ID của sản phẩm quà tặng thực tế
        private Integer giftQuantity;
        private String giftNote;

        public TierRequest() {}

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

        public Long getGiftProductId() { return giftProductId; }
        public void setGiftProductId(Long giftProductId) { this.giftProductId = giftProductId; }

        public Integer getGiftQuantity() { return giftQuantity; }
        public void setGiftQuantity(Integer giftQuantity) { this.giftQuantity = giftQuantity; }

        public String getGiftNote() { return giftNote; }
        public void setGiftNote(String giftNote) { this.giftNote = giftNote; }
    }

    public SalesPolicyRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStartDate() { return startDate; }
    public void setStartDate(String startDate) { this.startDate = startDate; }

    public String getEndDate() { return endDate; }
    public void setEndDate(String endDate) { this.endDate = endDate; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public Integer getMaxOrderCount() { return maxOrderCount; }
    public void setMaxOrderCount(Integer maxOrderCount) { this.maxOrderCount = maxOrderCount; }

    public Integer getMaxApplicationPerAgency() { return maxApplicationPerAgency; }
    public void setMaxApplicationPerAgency(Integer maxApplicationPerAgency) { this.maxApplicationPerAgency = maxApplicationPerAgency; }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getConditionType() { return conditionType; }
    public void setConditionType(String conditionType) { this.conditionType = conditionType; }

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

    public Boolean getApplyToAllProducts() { return applyToAllProducts; }
    public void setApplyToAllProducts(Boolean applyToAllProducts) { this.applyToAllProducts = applyToAllProducts; }

    public Set<Long> getIncludedAgencyIds() { return includedAgencyIds; }
    public void setIncludedAgencyIds(Set<Long> includedAgencyIds) { this.includedAgencyIds = includedAgencyIds; }

    public Set<Long> getExcludedAgencyIds() { return excludedAgencyIds; }
    public void setExcludedAgencyIds(Set<Long> excludedAgencyIds) { this.excludedAgencyIds = excludedAgencyIds; }

    public Set<Long> getTargetProductIds() { return targetProductIds; }
    public void setTargetProductIds(Set<Long> targetProductIds) { this.targetProductIds = targetProductIds; }

    public Set<Long> getTargetCategoryIds() { return targetCategoryIds; }
    public void setTargetCategoryIds(Set<Long> targetCategoryIds) { this.targetCategoryIds = targetCategoryIds; }

    public Set<Long> getExcludedProductIds() { return excludedProductIds; }
    public void setExcludedProductIds(Set<Long> excludedProductIds) { this.excludedProductIds = excludedProductIds; }

    public Set<Long> getExcludedCategoryIds() { return excludedCategoryIds; }
    public void setExcludedCategoryIds(Set<Long> excludedCategoryIds) { this.excludedCategoryIds = excludedCategoryIds; }

    public List<AudienceFilterRequest> getAudienceFilters() { return audienceFilters; }
    public void setAudienceFilters(List<AudienceFilterRequest> audienceFilters) { this.audienceFilters = audienceFilters; }

    public List<TierRequest> getTiers() { return tiers; }
    public void setTiers(List<TierRequest> tiers) { this.tiers = tiers; }

    public List<ProductGroupRequest> getProductGroups() { return productGroups; }
    public void setProductGroups(List<ProductGroupRequest> productGroups) { this.productGroups = productGroups; }

    public static class ProductGroupRequest {
        private String groupName;
        private List<ProductGroupItemRequest> items = new ArrayList<>();

        public ProductGroupRequest() {}

        public String getGroupName() { return groupName; }
        public void setGroupName(String groupName) { this.groupName = groupName; }

        public List<ProductGroupItemRequest> getItems() { return items; }
        public void setItems(List<ProductGroupItemRequest> items) { this.items = items; }
    }

    public static class ProductGroupItemRequest {
        private String itemType; // PRODUCT, CATEGORY
        private Long itemId;
        private String description;
        private String operator;
        private String adjustmentType;
        private Double adjustmentValue;
        private Long giftProductId;
        private Integer giftQuantity;
        private String giftNote;

        public ProductGroupItemRequest() {}

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
}
