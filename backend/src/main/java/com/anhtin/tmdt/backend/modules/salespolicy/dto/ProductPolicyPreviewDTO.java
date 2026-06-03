package com.anhtin.tmdt.backend.modules.salespolicy.dto;

import java.util.List;

public class ProductPolicyPreviewDTO {
    private Double basePrice;
    private Double minPurchaseQuantity;
    private Double finalPrice;
    private List<PolicyEffectDTO> retailPolicies;
    private List<PolicyEffectDTO> salesPolicies;
    private List<PolicyEffectDTO> promotions;
    private PriceFlowDetailsDTO wholesaleFlow;
    private PriceFlowDetailsDTO retailFlow;

    public Double getBasePrice() { return basePrice; }
    public void setBasePrice(Double v) { this.basePrice = v; }
    public Double getMinPurchaseQuantity() { return minPurchaseQuantity; }
    public void setMinPurchaseQuantity(Double v) { this.minPurchaseQuantity = v; }
    public Double getFinalPrice() { return finalPrice; }
    public void setFinalPrice(Double v) { this.finalPrice = v; }
    public List<PolicyEffectDTO> getRetailPolicies() { return retailPolicies; }
    public void setRetailPolicies(List<PolicyEffectDTO> v) { this.retailPolicies = v; }
    public List<PolicyEffectDTO> getSalesPolicies() { return salesPolicies; }
    public void setSalesPolicies(List<PolicyEffectDTO> v) { this.salesPolicies = v; }
    public List<PolicyEffectDTO> getPromotions() { return promotions; }
    public void setPromotions(List<PolicyEffectDTO> v) { this.promotions = v; }
    public PriceFlowDetailsDTO getWholesaleFlow() { return wholesaleFlow; }
    public void setWholesaleFlow(PriceFlowDetailsDTO v) { this.wholesaleFlow = v; }
    public PriceFlowDetailsDTO getRetailFlow() { return retailFlow; }
    public void setRetailFlow(PriceFlowDetailsDTO v) { this.retailFlow = v; }

    public static class PriceFlowDetailsDTO {
        private Double originalPrice;
        private Double policyDiscount;
        private Double priceAfterPolicy;
        private Double promotionDiscount;
        private Double finalPrice;
        private List<PolicyEffectDTO> appliedPolicies = new java.util.ArrayList<>();
        private List<PolicyEffectDTO> appliedPromotions = new java.util.ArrayList<>();

        public Double getOriginalPrice() { return originalPrice; }
        public void setOriginalPrice(Double v) { this.originalPrice = v; }
        public Double getPolicyDiscount() { return policyDiscount; }
        public void setPolicyDiscount(Double v) { this.policyDiscount = v; }
        public Double getPriceAfterPolicy() { return priceAfterPolicy; }
        public void setPriceAfterPolicy(Double v) { this.priceAfterPolicy = v; }
        public Double getPromotionDiscount() { return promotionDiscount; }
        public void setPromotionDiscount(Double v) { this.promotionDiscount = v; }
        public Double getFinalPrice() { return finalPrice; }
        public void setFinalPrice(Double v) { this.finalPrice = v; }
        public List<PolicyEffectDTO> getAppliedPolicies() { return appliedPolicies; }
        public void setAppliedPolicies(List<PolicyEffectDTO> v) { this.appliedPolicies = v; }
        public List<PolicyEffectDTO> getAppliedPromotions() { return appliedPromotions; }
        public void setAppliedPromotions(List<PolicyEffectDTO> v) { this.appliedPromotions = v; }
    }

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
        private Boolean conditionMet;
        private String conditionNote;

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
        public Boolean getConditionMet() { return conditionMet; }
        public void setConditionMet(Boolean v) { this.conditionMet = v; }
        public String getConditionNote() { return conditionNote; }
        public void setConditionNote(String v) { this.conditionNote = v; }
    }
}
