package com.anhtin.tmdt.backend.modules.salespolicy.dto;

import java.util.List;

public class ProductPolicyPreviewDTO {
    private Double basePrice;
    private Double finalPrice;
    private List<PolicyEffectDTO> retailPolicies;
    private List<PolicyEffectDTO> salesPolicies;
    private List<PolicyEffectDTO> promotions;

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double v) { this.basePrice = v; }
    public Double getFinalPrice() { return finalPrice; }
    public void setFinalPrice(Double v) { this.finalPrice = v; }
    public List<PolicyEffectDTO> getRetailPolicies() { return retailPolicies; }
    public void setRetailPolicies(List<PolicyEffectDTO> v) { this.retailPolicies = v; }
    public List<PolicyEffectDTO> getSalesPolicies() { return salesPolicies; }
    public void setSalesPolicies(List<PolicyEffectDTO> v) { this.salesPolicies = v; }
    public List<PolicyEffectDTO> getPromotions() { return promotions; }
    public void setPromotions(List<PolicyEffectDTO> v) { this.promotions = v; }

    public static class PolicyEffectDTO {
        private Long id;
        private String name;
        private String policyType;
        private String conditionText;
        private String adjustmentType;
        private Double adjustmentValue;
        private Double originalPrice;
        private Double adjustedPrice;
        private String giftProductName;
        private Integer giftQuantity;

        public Long getId() { return id; }
        public void setId(Long v) { this.id = v; }
        public String getName() { return name; }
        public void setName(String v) { this.name = v; }
        public String getPolicyType() { return policyType; }
        public void setPolicyType(String v) { this.policyType = v; }
        public String getConditionText() { return conditionText; }
        public void setConditionText(String v) { this.conditionText = v; }
        public String getAdjustmentType() { return adjustmentType; }
        public void setAdjustmentType(String v) { this.adjustmentType = v; }
        public Double getAdjustmentValue() { return adjustmentValue; }
        public void setAdjustmentValue(Double v) { this.adjustmentValue = v; }
        public Double getOriginalPrice() { return originalPrice; }
        public void setOriginalPrice(Double v) { this.originalPrice = v; }
        public Double getAdjustedPrice() { return adjustedPrice; }
        public void setAdjustedPrice(Double v) { this.adjustedPrice = v; }
        public String getGiftProductName() { return giftProductName; }
        public void setGiftProductName(String v) { this.giftProductName = v; }
        public Integer getGiftQuantity() { return giftQuantity; }
        public void setGiftQuantity(Integer v) { this.giftQuantity = v; }
    }
}
