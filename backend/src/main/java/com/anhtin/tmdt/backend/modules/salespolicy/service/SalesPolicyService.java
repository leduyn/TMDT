package com.anhtin.tmdt.backend.modules.salespolicy.service;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyRanking;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRankingRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.salespolicy.dto.ProductPolicyPreviewDTO;
import com.anhtin.tmdt.backend.modules.salespolicy.dto.ProductPolicyPreviewDTO.PolicyEffectDTO;
import com.anhtin.tmdt.backend.modules.salespolicy.dto.SalesPolicyDTO;
import com.anhtin.tmdt.backend.modules.salespolicy.dto.SalesPolicyRequest;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicy;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyAudienceFilter;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyConditionType;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyProductGroup;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyProductGroupItem;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyTier;
import com.anhtin.tmdt.backend.modules.order.entity.PromotionUsage;
import com.anhtin.tmdt.backend.modules.order.repository.PromotionUsageRepository;
import com.anhtin.tmdt.backend.modules.salespolicy.repository.SalesPolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SalesPolicyService {

    @Autowired
    private SalesPolicyRepository salesPolicyRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AgencyRankingRepository agencyRankingRepository;

    @Autowired
    private PromotionUsageRepository promotionUsageRepository;

    private SalesPolicyDTO enrichDTO(SalesPolicyDTO dto) {
        if (dto != null && dto.getProductGroups() != null) {
            for (SalesPolicyDTO.ProductGroupResponse group : dto.getProductGroups()) {
                if (group.getItems() != null) {
                    for (SalesPolicyDTO.ProductGroupItemResponse item : group.getItems()) {
                        if ("PRODUCT".equalsIgnoreCase(item.getItemType())) {
                            productRepository.findById(item.getItemId())
                                    .ifPresent(p -> {
                                        item.setItemName(p.getName());
                                        if (item.getGiftProductId() != null) {
                                            productRepository.findById(item.getGiftProductId())
                                                    .ifPresent(gp -> item.setGiftProductName(gp.getName()));
                                        }
                                    });
                        } else if ("CATEGORY".equalsIgnoreCase(item.getItemType())) {
                            categoryRepository.findById(item.getItemId())
                                    .ifPresent(c -> item.setItemName(c.getName()));
                        }
                    }
                }
            }
        }
        return dto;
    }

    public List<SalesPolicyDTO> getAllPolicies() {
        return salesPolicyRepository.findAll().stream()
                .map(SalesPolicyDTO::new)
                .map(this::enrichDTO)
                .collect(Collectors.toList());
    }

    public SalesPolicyDTO getPolicyById(Long id) {
        SalesPolicy policy = salesPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chính sách bán hàng không tồn tại"));
        return enrichDTO(new SalesPolicyDTO(policy));
    }

    @Transactional
    public SalesPolicyDTO createPolicy(SalesPolicyRequest request) {
        SalesPolicy policy = new SalesPolicy();
        updateEntityFromRequest(policy, request);
        SalesPolicy saved = salesPolicyRepository.save(policy);
        return enrichDTO(new SalesPolicyDTO(saved));
    }

    @Transactional
    public SalesPolicyDTO updatePolicy(Long id, SalesPolicyRequest request) {
        SalesPolicy policy = salesPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chính sách bán hàng không tồn tại"));
        updateEntityFromRequest(policy, request);
        SalesPolicy saved = salesPolicyRepository.save(policy);
        return enrichDTO(new SalesPolicyDTO(saved));
    }

    @Transactional
    public void deletePolicy(Long id) {
        SalesPolicy policy = salesPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chính sách bán hàng không tồn tại"));
        salesPolicyRepository.delete(policy);
    }

    private void updateEntityFromRequest(SalesPolicy policy, SalesPolicyRequest request) {
        policy.setName(request.getName());
        policy.setActive(request.getActive() != null ? request.getActive() : true);
        policy.setDescription(request.getDescription());
        policy.setTags(request.getTags());
        policy.setMaxOrderCount(request.getMaxOrderCount());
        policy.setMaxApplicationPerAgency(request.getMaxApplicationPerAgency());
        policy.setTargetType(request.getTargetType() != null ? request.getTargetType() : "ORDER_VALUE");
        if (request.getConditionType() != null) {
            policy.setConditionType(SalesPolicyConditionType.valueOf(request.getConditionType()));
        } else {
            policy.setConditionType(null);
        }
        policy.setMaxDiscountValue(request.getMaxDiscountValue());
        policy.setPolicyType(request.getPolicyType() != null ? request.getPolicyType() : "SALES_POLICY");
        policy.setMinOrderValue(request.getMinOrderValue());
        policy.setMaxDiscountPerOrder(request.getMaxDiscountPerOrder());
        policy.setMaxUsagePerCustomer(request.getMaxUsagePerCustomer());
        policy.setApplicablePaymentMethods(request.getApplicablePaymentMethods());
        policy.setApplicableOrderSources(request.getApplicableOrderSources());
        policy.setApplyToAllProducts(request.getApplyToAllProducts() != null ? request.getApplyToAllProducts() : true);

        // Date time parsing
        if (request.getStartDate() != null && !request.getStartDate().isBlank()) {
            policy.setStartDate(parseDateTime(request.getStartDate()));
        } else {
            policy.setStartDate(null);
        }

        if (request.getEndDate() != null && !request.getEndDate().isBlank()) {
            policy.setEndDate(parseDateTime(request.getEndDate()));
        } else {
            policy.setEndDate(null);
        }

        // Map included agencies
        if (request.getIncludedAgencyIds() != null) {
            List<Agency> agencies = agencyRepository.findAllById(request.getIncludedAgencyIds());
            policy.setIncludedAgencies(new HashSet<>(agencies));
        } else {
            policy.setIncludedAgencies(new HashSet<>());
        }

        // Map excluded agencies
        if (request.getExcludedAgencyIds() != null) {
            List<Agency> agencies = agencyRepository.findAllById(request.getExcludedAgencyIds());
            policy.setExcludedAgencies(new HashSet<>(agencies));
        } else {
            policy.setExcludedAgencies(new HashSet<>());
        }

        // Map target products & categories (if not apply to all)
        if (!policy.isApplyToAllProducts()) {
            Set<Long> finalTargetProductIds = new HashSet<>();
            Set<Long> finalTargetCategoryIds = new HashSet<>();

            if (request.getProductGroups() != null) {
                for (SalesPolicyRequest.ProductGroupRequest gReq : request.getProductGroups()) {
                    if (gReq.getItems() != null) {
                        for (SalesPolicyRequest.ProductGroupItemRequest iReq : gReq.getItems()) {
                            if ("PRODUCT".equalsIgnoreCase(iReq.getItemType())) {
                                finalTargetProductIds.add(iReq.getItemId());
                            } else if ("CATEGORY".equalsIgnoreCase(iReq.getItemType())) {
                                finalTargetCategoryIds.add(iReq.getItemId());
                            }
                        }
                    }
                }
            }

            if (request.getTargetProductIds() != null) {
                finalTargetProductIds.addAll(request.getTargetProductIds());
            }
            if (request.getTargetCategoryIds() != null) {
                finalTargetCategoryIds.addAll(request.getTargetCategoryIds());
            }

            if (!finalTargetProductIds.isEmpty()) {
                List<Product> products = productRepository.findAllById(finalTargetProductIds);
                policy.setTargetProducts(new HashSet<>(products));
            } else {
                policy.setTargetProducts(new HashSet<>());
            }

            if (!finalTargetCategoryIds.isEmpty()) {
                List<Category> categories = categoryRepository.findAllById(finalTargetCategoryIds);
                policy.setTargetCategories(new HashSet<>(categories));
            } else {
                policy.setTargetCategories(new HashSet<>());
            }
        } else {
            policy.setTargetProducts(new HashSet<>());
            policy.setTargetCategories(new HashSet<>());
        }

        // Map product groups
        policy.getProductGroups().clear();
        if (!policy.isApplyToAllProducts() && request.getProductGroups() != null) {
            int gIndex = 0;
            for (SalesPolicyRequest.ProductGroupRequest groupReq : request.getProductGroups()) {
                SalesPolicyProductGroup group = new SalesPolicyProductGroup();
                group.setGroupName(groupReq.getGroupName());
                group.setGroupIndex(gIndex++);
                group.setSalesPolicyId(policy.getId());
                
                if (groupReq.getItems() != null) {
                    for (SalesPolicyRequest.ProductGroupItemRequest itemReq : groupReq.getItems()) {
                        SalesPolicyProductGroupItem item = new SalesPolicyProductGroupItem();
                        item.setItemType(itemReq.getItemType());
                        item.setItemId(itemReq.getItemId());
                        item.setDescription(itemReq.getDescription());
                        item.setOperator(itemReq.getOperator());
                        item.setAdjustmentType(itemReq.getAdjustmentType());
                        item.setAdjustmentValue(itemReq.getAdjustmentValue());
                        item.setGiftProductId(itemReq.getGiftProductId());
                        item.setGiftQuantity(itemReq.getGiftQuantity());
                        item.setGiftNote(itemReq.getGiftNote());
                        group.getItems().add(item);
                    }
                }
                policy.getProductGroups().add(group);
            }
        }

        // Map excluded products & categories
        if (request.getExcludedProductIds() != null) {
            List<Product> products = productRepository.findAllById(request.getExcludedProductIds());
            policy.setExcludedProducts(new HashSet<>(products));
        } else {
            policy.setExcludedProducts(new HashSet<>());
        }

        if (request.getExcludedCategoryIds() != null) {
            List<Category> categories = categoryRepository.findAllById(request.getExcludedCategoryIds());
            policy.setExcludedCategories(new HashSet<>(categories));
        } else {
            policy.setExcludedCategories(new HashSet<>());
        }

        // Map audience filters
        policy.getAudienceFilters().clear();
        if (request.getAudienceFilters() != null) {
            for (SalesPolicyRequest.AudienceFilterRequest filterReq : request.getAudienceFilters()) {
                SalesPolicyAudienceFilter filter = new SalesPolicyAudienceFilter();
                filter.setRankLevels(filterReq.getRankLevels());
                filter.setProvinces(filterReq.getProvinces());
                filter.setSalesPolicyId(policy.getId());
                policy.getAudienceFilters().add(filter);
            }
        }

        // Map tiers
        policy.getTiers().clear();
        if (request.getTiers() != null) {
            for (SalesPolicyRequest.TierRequest tierReq : request.getTiers()) {
                SalesPolicyTier tier = new SalesPolicyTier();
                tier.setTierIndex(tierReq.getTierIndex());
                tier.setOperator(tierReq.getOperator());
                tier.setThresholdValue(tierReq.getThresholdValue());
                tier.setAdjustmentType(tierReq.getAdjustmentType());
                tier.setAdjustmentValue(tierReq.getAdjustmentValue());
                tier.setGiftNote(tierReq.getGiftNote());
                tier.setGiftQuantity(tierReq.getGiftQuantity());
                tier.setSalesPolicyId(policy.getId());

                if (tierReq.getGiftProductId() != null) {
                    Product giftProd = productRepository.findById(tierReq.getGiftProductId()).orElse(null);
                    tier.setGiftProduct(giftProd);
                } else {
                    tier.setGiftProduct(null);
                }

                policy.getTiers().add(tier);
            }
        }
    }

    private LocalDateTime parseDateTime(String isoStr) {
        try {
            // Support both ISO format with and without offset
            if (isoStr.contains("Z")) {
                return LocalDateTime.parse(isoStr, DateTimeFormatter.ISO_DATE_TIME);
            }
            if (isoStr.length() == 10) { // e.g. "2026-05-26"
                return LocalDateTime.parse(isoStr + "T00:00:00");
            }
            return LocalDateTime.parse(isoStr);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }

    private String getAgencyRank(Long agencyId) {
        if (agencyId == null) return "BRONZE";
        return agencyRankingRepository.findFirstByAgencyIdOrderByYearDescMonthDesc(agencyId)
                .map(AgencyRanking::getRankLevel)
                .orElse("BRONZE");
    }

    private boolean compareQuantity(double actual, double threshold, String operator) {
        if (operator == null) return false;
        switch (operator.toUpperCase()) {
            case "LT":
            case "<":
                return actual < threshold;
            case "GT":
            case ">":
                return actual > threshold;
            case "LTE":
            case "<=":
                return actual <= threshold;
            case "GTE":
            case ">=":
                return actual >= threshold;
            case "EQ":
            case "=":
                return actual == threshold;
            default:
                return false;
        }
    }

    public Double applySalesPolicy(Product product, Agency agency, int quantity, Double currentPrice) {
        return applySalesPolicy(product, agency, quantity, currentPrice, null, null, null, null, null, null);
    }

    public Double applySalesPolicy(Product product, Agency agency, int quantity, Double currentPrice,
            Double totalOrderValue, String paymentMethod, String orderSource, Long customerId, Double currentDiscountAmount) {
        return applySalesPolicy(product, agency, quantity, currentPrice, totalOrderValue, paymentMethod, orderSource, customerId, currentDiscountAmount, null);
    }

    public Double applySalesPolicy(Product product, Agency agency, int quantity, Double currentPrice,
            Double totalOrderValue, String paymentMethod, String orderSource, Long customerId, Double currentDiscountAmount,
            Set<Long> appliedPromotionIds) {
        if (agency == null || product == null || currentPrice == null) {
            return currentPrice;
        }

        LocalDateTime now = LocalDateTime.now();
        List<SalesPolicy> activePolicies = salesPolicyRepository.findByActiveTrueOrderByIdDesc().stream()
                .filter(p -> (p.getStartDate() == null || p.getStartDate().isBefore(now)) &&
                             (p.getEndDate() == null || p.getEndDate().isAfter(now)))
                .collect(Collectors.toList());

        // Phase 0: RETAIL_POLICY - ưu tiên áp dụng trước nhất (nếu qty < minPurchaseQuantity)
        for (SalesPolicy policy : activePolicies) {
            if (!"RETAIL_POLICY".equalsIgnoreCase(policy.getPolicyType())) continue;
            if (!isPolicyApplicable(policy, product, agency, quantity, currentPrice)) continue;

            double retailPrice = calculateRetailPrice(policy, product, quantity, currentPrice);
            if (retailPrice != currentPrice) {
                currentPrice = retailPrice;
                // Chỉ áp dụng 1 chính sách bán lẻ đầu tiên
                break;
            }
        }

        // Phase 1: SALES_POLICY - logic cũ (pick lowest price)
        Double bestPrice = null;
        List<SalesPolicy> promotions = new java.util.ArrayList<>();

        for (SalesPolicy policy : activePolicies) {
            if ("PROMOTION".equalsIgnoreCase(policy.getPolicyType())) {
                promotions.add(policy);
                continue;
            }

            if (!isPolicyApplicable(policy, product, agency, quantity, currentPrice)) continue;

            double adjustedPrice = calculateAdjustedPrice(policy, product, quantity, currentPrice);
            if (adjustedPrice == currentPrice) continue;

            if (bestPrice == null || adjustedPrice < bestPrice) {
                bestPrice = adjustedPrice;
            }
        }

        // Phase 2: PROMOTION - áp dụng cộng dồn
        double promoBasePrice = bestPrice != null ? bestPrice : currentPrice;
        double runningPrice = promoBasePrice;

        for (SalesPolicy promotion : promotions) {
            if (!isPolicyApplicable(promotion, product, agency, quantity, currentPrice)) continue;

            // Kiểm tra các điều kiện bổ sung của KM
            if (!isPromotionConditionMet(promotion, quantity, currentPrice, totalOrderValue, paymentMethod, orderSource, customerId, currentDiscountAmount)) continue;

            double promoAdjusted = calculateAdjustedPrice(promotion, product, quantity, runningPrice);
            if (promoAdjusted == runningPrice) continue;

            // Giới hạn maxDiscountPerOrder
            if (promotion.getMaxDiscountPerOrder() != null) {
                double addDiscount = (runningPrice - promoAdjusted) * quantity;
                if (addDiscount > promotion.getMaxDiscountPerOrder()) {
                    double allowedDiscountPerItem = promotion.getMaxDiscountPerOrder() / quantity;
                    promoAdjusted = runningPrice - allowedDiscountPerItem;
                }
            }

            // Theo dõi promotion đã áp dụng
            if (appliedPromotionIds != null) {
                appliedPromotionIds.add(promotion.getId());
            }

            runningPrice = Math.min(runningPrice, promoAdjusted);
            runningPrice = Math.max(0.0, runningPrice);
        }

        return runningPrice;
    }

    private boolean isPolicyApplicable(SalesPolicy policy, Product product, Agency agency, int quantity, Double currentPrice) {
        // A. Kiểm tra phạm vi sản phẩm
        boolean isApplicable = false;
        if (policy.isApplyToAllProducts()) {
            isApplicable = true;
        } else {
            boolean matchesProduct = policy.getTargetProducts().stream().anyMatch(p -> p.getId().equals(product.getId()));
            boolean matchesCategory = product.getCategory() != null &&
                    policy.getTargetCategories().stream().anyMatch(c -> c.getId().equals(product.getCategory().getId()));
            isApplicable = matchesProduct || matchesCategory;
        }

        // B. Kiểm tra sản phẩm bị loại trừ
        if (isApplicable) {
            boolean isProductExcluded = policy.getExcludedProducts().stream().anyMatch(p -> p.getId().equals(product.getId()));
            boolean isCategoryExcluded = product.getCategory() != null &&
                    policy.getExcludedCategories().stream().anyMatch(c -> c.getId().equals(product.getCategory().getId()));
            if (isProductExcluded || isCategoryExcluded) {
                isApplicable = false;
            }
        }

        if (!isApplicable) return false;

        // C. Kiểm tra đối tượng đại lý
        if (agency == null) return true;

        boolean isExcluded = policy.getExcludedAgencies().stream().anyMatch(a -> a.getId().equals(agency.getId()));
        if (isExcluded) return false;

        boolean isIncluded = policy.getIncludedAgencies().stream().anyMatch(a -> a.getId().equals(agency.getId()));
        boolean matchesFilter = false;

        if (!isIncluded && !policy.getAudienceFilters().isEmpty()) {
            String agencyRank = getAgencyRank(agency.getId());
            String address = agency.getAddress() != null ? agency.getAddress().toLowerCase() : "";

            for (SalesPolicyAudienceFilter filter : policy.getAudienceFilters()) {
                boolean rankMatch = false;
                boolean provinceMatch = false;

                if (filter.getRankLevels() == null || filter.getRankLevels().isBlank()) {
                    rankMatch = true;
                } else {
                    for (String r : filter.getRankLevels().split(",")) {
                        if (r.trim().equalsIgnoreCase(agencyRank)) {
                            rankMatch = true;
                            break;
                        }
                    }
                }

                if (filter.getProvinces() == null || filter.getProvinces().isBlank() || filter.getProvinces().equalsIgnoreCase("ALL")) {
                    provinceMatch = true;
                } else {
                    for (String p : filter.getProvinces().split(",")) {
                        if (address.contains(p.trim().toLowerCase())) {
                            provinceMatch = true;
                            break;
                        }
                    }
                }

                if (rankMatch && provinceMatch) {
                    matchesFilter = true;
                    break;
                }
            }
        } else if (!isIncluded) {
            matchesFilter = policy.getIncludedAgencies().isEmpty();
        }

        return isIncluded || matchesFilter;
    }

    private boolean isPromotionConditionMet(SalesPolicy promotion, int quantity, Double currentPrice,
            Double totalOrderValue, String paymentMethod, String orderSource, Long customerId, Double currentDiscountAmount) {
        // Kiểm tra minOrderValue
        if (promotion.getMinOrderValue() != null && totalOrderValue != null) {
            if (totalOrderValue < promotion.getMinOrderValue()) return false;
        }

        // Kiểm tra applicablePaymentMethods
        if (promotion.getApplicablePaymentMethods() != null && !promotion.getApplicablePaymentMethods().isBlank()) {
            if (paymentMethod == null) return false;
            boolean matched = false;
            for (String pm : promotion.getApplicablePaymentMethods().split(",")) {
                if (pm.trim().equalsIgnoreCase(paymentMethod)) {
                    matched = true;
                    break;
                }
            }
            if (!matched) return false;
        }

        // Kiểm tra applicableOrderSources
        if (promotion.getApplicableOrderSources() != null && !promotion.getApplicableOrderSources().isBlank()) {
            if (orderSource == null) return false;
            boolean matched = false;
            for (String os : promotion.getApplicableOrderSources().split(",")) {
                if (os.trim().equalsIgnoreCase(orderSource)) {
                    matched = true;
                    break;
                }
            }
            if (!matched) return false;
        }

        // Kiểm tra maxUsagePerCustomer
        if (promotion.getMaxUsagePerCustomer() != null && customerId != null) {
            int usageCount = promotionUsageRepository.countBySalesPolicyIdAndCustomerId(promotion.getId(), customerId);
            if (usageCount >= promotion.getMaxUsagePerCustomer()) return false;
        }

        return true;
    }

    private double calculateAdjustedPrice(SalesPolicy policy, Product product, int quantity, Double currentPrice) {
        boolean matched = false;
        String adjType = null;
        Double adjValue = null;

        if ("PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())
                && policy.getConditionType() == SalesPolicyConditionType.MIN_PRODUCT_QTY) {
            double minQty = product.getMinPurchaseQuantity() != null
                ? product.getMinPurchaseQuantity().doubleValue() : 1.0;
            SalesPolicyTier firstTier = policy.getTiers().stream().findFirst().orElse(null);
            if (firstTier != null && compareQuantity(quantity, minQty, firstTier.getOperator())) {
                matched = true;
                if (policy.isApplyToAllProducts()) {
                    adjType = firstTier.getAdjustmentType();
                    adjValue = firstTier.getAdjustmentValue();
                } else {
                    SalesPolicyProductGroupItem matchedItem = findGroupItemForProduct(policy, product.getId());
                    if (matchedItem != null && matchedItem.getAdjustmentType() != null) {
                        adjType = matchedItem.getAdjustmentType();
                        adjValue = matchedItem.getAdjustmentValue();
                    } else {
                        adjType = firstTier.getAdjustmentType();
                        adjValue = firstTier.getAdjustmentValue();
                    }
                }
            }
        } else {
            double evaluationValue = "PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())
                ? quantity
                : currentPrice * quantity;

            SalesPolicyTier matchedTier = null;
            for (SalesPolicyTier tier : policy.getTiers()) {
                if (compareQuantity(evaluationValue, tier.getThresholdValue(), tier.getOperator())) {
                    matchedTier = tier;
                }
            }
            if (matchedTier != null) {
                matched = true;
                adjType = matchedTier.getAdjustmentType();
                adjValue = matchedTier.getAdjustmentValue();
            }
        }

        if (!matched) return currentPrice;

        double adjustedPrice = currentPrice;
        if ("PERCENTAGE".equalsIgnoreCase(adjType)) {
            adjustedPrice = currentPrice + (currentPrice * adjValue / 100.0);
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(adjType)) {
            adjustedPrice = currentPrice + adjValue;
        } else if ("SPECIFIC_PRICE".equalsIgnoreCase(adjType)) {
            adjustedPrice = adjValue;
        }

        adjustedPrice = Math.max(0.0, adjustedPrice);

        // Giới hạn maxDiscountValue
        if (policy.getMaxDiscountValue() != null && !"PROMOTION".equalsIgnoreCase(policy.getPolicyType())) {
            double totalDiscount = (currentPrice - adjustedPrice) * quantity;
            if (totalDiscount > policy.getMaxDiscountValue()) {
                double allowedDiscountPerItem = policy.getMaxDiscountValue() / quantity;
                adjustedPrice = currentPrice - allowedDiscountPerItem;
            }
        }

        return adjustedPrice;
    }

    private double calculateRetailPrice(SalesPolicy policy, Product product, int quantity, Double currentPrice) {
        double minQty = product.getMinPurchaseQuantity() != null
            ? product.getMinPurchaseQuantity().doubleValue() : 1.0;

        // Chỉ áp dụng khi số lượng mua < số lượng tối thiểu
        if (quantity >= minQty) return currentPrice;

        String adjType = null;
        Double adjValue = null;

        SalesPolicyTier firstTier = policy.getTiers().stream().findFirst().orElse(null);
        if (firstTier == null) return currentPrice;

        if (policy.isApplyToAllProducts()) {
            adjType = firstTier.getAdjustmentType();
            adjValue = firstTier.getAdjustmentValue();
        } else {
            SalesPolicyProductGroupItem matchedItem = findGroupItemForProduct(policy, product.getId());
            if (matchedItem != null && matchedItem.getAdjustmentType() != null) {
                adjType = matchedItem.getAdjustmentType();
                adjValue = matchedItem.getAdjustmentValue();
            } else {
                adjType = firstTier.getAdjustmentType();
                adjValue = firstTier.getAdjustmentValue();
            }
        }

        if (adjType == null) return currentPrice;

        double adjustedPrice = currentPrice;
        if ("PERCENTAGE".equalsIgnoreCase(adjType)) {
            adjustedPrice = currentPrice + (currentPrice * adjValue / 100.0);
        } else if ("FIXED_AMOUNT".equalsIgnoreCase(adjType)) {
            adjustedPrice = currentPrice + adjValue;
        } else if ("SPECIFIC_PRICE".equalsIgnoreCase(adjType)) {
            adjustedPrice = adjValue;
        }

        return Math.max(0.0, adjustedPrice);
    }

    private SalesPolicyProductGroupItem findGroupItemForProduct(SalesPolicy policy, Long productId) {
        if (policy.getProductGroups() != null) {
            for (SalesPolicyProductGroup group : policy.getProductGroups()) {
                if (group.getItems() != null) {
                    for (SalesPolicyProductGroupItem item : group.getItems()) {
                        if ("PRODUCT".equalsIgnoreCase(item.getItemType())
                                && productId.equals(item.getItemId())
                                && item.getAdjustmentType() != null) {
                            return item;
                        }
                    }
                }
            }
        }
        return null;
    }

    public SalesPolicyTier getMatchedTierForOrder(Product product, Agency agency, int quantity, Double currentPrice) {
        if (agency == null || product == null || currentPrice == null) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        List<SalesPolicy> activePolicies = salesPolicyRepository.findByActiveTrueOrderByIdDesc().stream()
                .filter(p -> (p.getStartDate() == null || p.getStartDate().isBefore(now)) &&
                             (p.getEndDate() == null || p.getEndDate().isAfter(now)))
                .collect(Collectors.toList());

        SalesPolicyTier bestTier = null;
        Double lowestPrice = null;

        for (SalesPolicy policy : activePolicies) {
            boolean isApplicable = false;
            if (policy.isApplyToAllProducts()) {
                isApplicable = true;
            } else {
                boolean matchesProduct = policy.getTargetProducts().stream().anyMatch(p -> p.getId().equals(product.getId()));
                boolean matchesCategory = product.getCategory() != null &&
                        policy.getTargetCategories().stream().anyMatch(c -> c.getId().equals(product.getCategory().getId()));
                isApplicable = matchesProduct || matchesCategory;
            }

            if (isApplicable) {
                boolean isProductExcluded = policy.getExcludedProducts().stream().anyMatch(p -> p.getId().equals(product.getId()));
                boolean isCategoryExcluded = product.getCategory() != null &&
                        policy.getExcludedCategories().stream().anyMatch(c -> c.getId().equals(product.getCategory().getId()));
                if (isProductExcluded || isCategoryExcluded) {
                    isApplicable = false;
                }
            }

            if (!isApplicable) continue;

            boolean isExcluded = policy.getExcludedAgencies().stream().anyMatch(a -> a.getId().equals(agency.getId()));
            if (isExcluded) continue;

            boolean isIncluded = policy.getIncludedAgencies().stream().anyMatch(a -> a.getId().equals(agency.getId()));
            boolean matchesFilter = false;

            if (!isIncluded && !policy.getAudienceFilters().isEmpty()) {
                String agencyRank = getAgencyRank(agency.getId());
                String address = agency.getAddress() != null ? agency.getAddress().toLowerCase() : "";

                for (SalesPolicyAudienceFilter filter : policy.getAudienceFilters()) {
                    boolean rankMatch = false;
                    boolean provinceMatch = false;

                    if (filter.getRankLevels() == null || filter.getRankLevels().isBlank()) {
                        rankMatch = true;
                    } else {
                        for (String r : filter.getRankLevels().split(",")) {
                            if (r.trim().equalsIgnoreCase(agencyRank)) {
                                rankMatch = true;
                                break;
                            }
                        }
                    }

                    if (filter.getProvinces() == null || filter.getProvinces().isBlank() || filter.getProvinces().equalsIgnoreCase("ALL")) {
                        provinceMatch = true;
                    } else {
                        for (String p : filter.getProvinces().split(",")) {
                            if (address.contains(p.trim().toLowerCase())) {
                                provinceMatch = true;
                                break;
                            }
                        }
                    }

                    if (rankMatch && provinceMatch) {
                        matchesFilter = true;
                        break;
                    }
                }
            } else if (!isIncluded) {
                matchesFilter = policy.getIncludedAgencies().isEmpty();
            }

            if (!isIncluded && !matchesFilter) continue;

            // Xác định matched tier dựa trên targetType
            SalesPolicyTier resultTier = null;

            if ("PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())
                    && policy.getConditionType() == SalesPolicyConditionType.MIN_PRODUCT_QTY) {
                // MIN_PRODUCT_QTY: So sánh số lượng mua với minPurchaseQuantity
                double minQty = product.getMinPurchaseQuantity() != null
                    ? product.getMinPurchaseQuantity().doubleValue() : 1.0;
                SalesPolicyTier firstTier = policy.getTiers().stream().findFirst().orElse(null);
                if (firstTier != null && compareQuantity(quantity, minQty, firstTier.getOperator())) {
                    if (policy.isApplyToAllProducts()) {
                        resultTier = firstTier;
                    } else {
                        // Tìm item-level adjustment cho sản phẩm này
                        SalesPolicyProductGroupItem matchedItem = findGroupItemForProduct(policy, product.getId());
                        if (matchedItem != null && matchedItem.getAdjustmentType() != null) {
                            // Tạo tier ảo với adjustment từ item
                            resultTier = new SalesPolicyTier();
                            resultTier.setOperator(firstTier.getOperator());
                            resultTier.setThresholdValue(minQty);
                            resultTier.setAdjustmentType(matchedItem.getAdjustmentType());
                            resultTier.setAdjustmentValue(matchedItem.getAdjustmentValue());
                            resultTier.setGiftQuantity(matchedItem.getGiftQuantity());
                            resultTier.setGiftNote(matchedItem.getGiftNote());
                            if (matchedItem.getGiftProductId() != null) {
                                productRepository.findById(matchedItem.getGiftProductId())
                                    .ifPresent(resultTier::setGiftProduct);
                            }
                        } else {
                            resultTier = firstTier;
                        }
                    }
                }
            } else {
                // CUSTOM_QTY, ORDER_VALUE, hoặc các targetType khác
                double evaluationValue = "PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())
                    ? quantity
                    : currentPrice * quantity;

                SalesPolicyTier matchedTier = null;
                for (SalesPolicyTier tier : policy.getTiers()) {
                    if (compareQuantity(evaluationValue, tier.getThresholdValue(), tier.getOperator())) {
                        matchedTier = tier;
                    }
                }
                resultTier = matchedTier;
            }

            if (resultTier == null) continue;

            double adjustedPrice = currentPrice;
            if ("PERCENTAGE".equalsIgnoreCase(resultTier.getAdjustmentType())) {
                adjustedPrice = currentPrice + (currentPrice * resultTier.getAdjustmentValue() / 100.0);
            } else if ("FIXED_AMOUNT".equalsIgnoreCase(resultTier.getAdjustmentType())) {
                adjustedPrice = currentPrice + resultTier.getAdjustmentValue();
            } else if ("SPECIFIC_PRICE".equalsIgnoreCase(resultTier.getAdjustmentType())) {
                adjustedPrice = resultTier.getAdjustmentValue();
            }
            adjustedPrice = Math.max(0.0, adjustedPrice);

            if (lowestPrice == null || adjustedPrice < lowestPrice) {
                lowestPrice = adjustedPrice;
                bestTier = resultTier;
            }
        }

        return bestTier;
    }

    private int getWholesaleQuantity(SalesPolicy policy, Product product, Double basePrice) {
        double minQtyVal = product.getMinPurchaseQuantity() != null ? product.getMinPurchaseQuantity().doubleValue() : 1.0;
        int minQty = (int) Math.ceil(minQtyVal);
        if ("PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())) {
            if (policy.getConditionType() == SalesPolicyConditionType.MIN_PRODUCT_QTY) {
                return minQty;
            } else {
                // CUSTOM_QTY
                if (policy.getTiers() != null && !policy.getTiers().isEmpty()) {
                    double minThreshold = policy.getTiers().stream()
                        .mapToDouble(t -> t.getThresholdValue() != null ? t.getThresholdValue() : 0.0)
                        .min()
                        .orElse(minQtyVal);
                    return (int) Math.ceil(minThreshold);
                }
                return minQty;
            }
        } else if ("ORDER_VALUE".equalsIgnoreCase(policy.getTargetType())) {
            // Với ORDER_VALUE: evaluationValue = price * qty phải đạt thresholdValue của tier
            // Tính số lượng tối thiểu để đạt threshold thấp nhất
            int baseQty = Math.max(1, minQty - 1);
            if (basePrice != null && basePrice > 0 && policy.getTiers() != null && !policy.getTiers().isEmpty()) {
                double lowestThreshold = policy.getTiers().stream()
                    .mapToDouble(t -> t.getThresholdValue() != null ? t.getThresholdValue() : 0.0)
                    .min()
                    .orElse(0.0);
                if (lowestThreshold > 0) {
                    int qtyNeeded = (int) Math.ceil(lowestThreshold / basePrice);
                    // Dùng qty lớn hơn để đảm bảo đạt threshold
                    baseQty = Math.max(baseQty, qtyNeeded);
                }
            }
            return baseQty;
        }
        return minQty;
    }

    public ProductPolicyPreviewDTO previewProductPolicies(Product product, int quantity, Agency agency, Double basePrice) {
        ProductPolicyPreviewDTO result = new ProductPolicyPreviewDTO();
        result.setBasePrice(basePrice);
        result.setRetailPolicies(new ArrayList<>());
        result.setSalesPolicies(new ArrayList<>());
        result.setPromotions(new ArrayList<>());

        LocalDateTime now = LocalDateTime.now();
        List<SalesPolicy> activePolicies = salesPolicyRepository.findByActiveTrueOrderByIdDesc().stream()
                .filter(p -> (p.getStartDate() == null || p.getStartDate().isBefore(now)) &&
                             (p.getEndDate() == null || p.getEndDate().isAfter(now)))
                .collect(Collectors.toList());

        // Separate promotions from other policies first
        List<SalesPolicy> promotions = new ArrayList<>();
        for (SalesPolicy policy : activePolicies) {
            if ("PROMOTION".equalsIgnoreCase(policy.getPolicyType())) {
                promotions.add(policy);
            }
        }

        // Determine quantities for previewing
        double minQtyVal = product.getMinPurchaseQuantity() != null ? product.getMinPurchaseQuantity().doubleValue() : 1.0;
        int minQty = (int) Math.ceil(minQtyVal);
        int retailQty = Math.max(0, minQty - 1);

        // Phase 0: RETAIL_POLICY (always computed from basePrice independently)
        Double retailPrice = basePrice;
        for (SalesPolicy policy : activePolicies) {
            if (!"RETAIL_POLICY".equalsIgnoreCase(policy.getPolicyType())) continue;
            if (!isPolicyApplicable(policy, product, agency, retailQty, basePrice)) continue;
            double retPrice = calculateRetailPrice(policy, product, retailQty, basePrice);
            if (retPrice != basePrice) {
                PolicyEffectDTO eff = new PolicyEffectDTO();
                eff.setId(policy.getId());
                eff.setName(policy.getName());
                eff.setPolicyType("RETAIL_POLICY");
                eff.setOriginalPrice(basePrice);
                eff.setAdjustedPrice(retPrice);
                eff.setAdjustmentType(policy.getTiers().stream().findFirst().map(SalesPolicyTier::getAdjustmentType).orElse(null));
                eff.setAdjustmentValue(policy.getTiers().stream().findFirst().map(SalesPolicyTier::getAdjustmentValue).orElse(null));
                eff.setConditionText("SL mua < SL tối thiểu (" + minQty + " SP)");
                SalesPolicyTier tier = policy.getTiers().stream().findFirst().orElse(null);
                if (tier != null && tier.getGiftProduct() != null) {
                    eff.setGiftProductName(tier.getGiftProduct().getName());
                    eff.setGiftQuantity(tier.getGiftQuantity());
                }
                result.getRetailPolicies().add(eff);
                retailPrice = retPrice;
                break;
            }
        }

        // Phase 1: SALES_POLICY (always computed from basePrice independently — NOT cascaded from retail)
        Double normalPrice = basePrice;
        for (SalesPolicy policy : activePolicies) {
            if ("PROMOTION".equalsIgnoreCase(policy.getPolicyType())) continue;
            if ("RETAIL_POLICY".equalsIgnoreCase(policy.getPolicyType())) continue;

            int policyWholesaleQty = getWholesaleQuantity(policy, product, basePrice);

            if (!isPolicyApplicable(policy, product, agency, policyWholesaleQty, basePrice)) continue;
            double adjPrice = calculateAdjustedPrice(policy, product, policyWholesaleQty, basePrice);
            if (adjPrice == basePrice) continue;
            PolicyEffectDTO eff = buildPolicyEffect(policy, product, policyWholesaleQty, basePrice, adjPrice);
            result.getSalesPolicies().add(eff);
            if (result.getSalesPolicies().size() == 1 || adjPrice < normalPrice) {
                normalPrice = adjPrice;
            }
        }

        // Final running price is the lower of retail and normal
        Double runningPrice = Math.min(retailPrice, normalPrice);
        result.setFinalPrice(runningPrice);

        // Phase 2: PROMOTION on BOTH normalPrice and retailPrice
        for (SalesPolicy promotion : promotions) {
            int promoWholesaleQty = getWholesaleQuantity(promotion, product, normalPrice);

            // Compute promotion on normalPrice
            if (isPolicyApplicable(promotion, product, agency, promoWholesaleQty, basePrice) &&
                isPromotionConditionMet(promotion, promoWholesaleQty, basePrice, null, null, null, null, null)) {

                double adjNormal = calculateAdjustedPrice(promotion, product, promoWholesaleQty, normalPrice);
                if (adjNormal != normalPrice) {
                    if (promotion.getMaxDiscountPerOrder() != null) {
                        double addDiscount = (normalPrice - adjNormal) * promoWholesaleQty;
                        if (addDiscount > promotion.getMaxDiscountPerOrder()) {
                            double allowedDiscountPerItem = promotion.getMaxDiscountPerOrder() / promoWholesaleQty;
                            adjNormal = normalPrice - allowedDiscountPerItem;
                        }
                    }
                    double finalAdjNormal = Math.max(0.0, adjNormal);
                    PolicyEffectDTO effNormal = buildPolicyEffect(promotion, product, promoWholesaleQty, normalPrice, finalAdjNormal);
                    effNormal.setConditionText("Số lượng mua >= SL tối thiểu (giá bán thường)");
                    result.getPromotions().add(effNormal);
                }
            }

            // Compute promotion on retailPrice (only if different from normalPrice)
            if (!retailPrice.equals(normalPrice)) {
                int promoRetailQty = Math.max(1, retailQty);

                if (isPolicyApplicable(promotion, product, agency, promoRetailQty, basePrice) &&
                    isPromotionConditionMet(promotion, promoRetailQty, basePrice, null, null, null, null, null)) {

                    double adjRetail = calculateAdjustedPrice(promotion, product, promoRetailQty, retailPrice);
                    if (adjRetail != retailPrice) {
                        if (promotion.getMaxDiscountPerOrder() != null) {
                            double addDiscount = (retailPrice - adjRetail) * promoRetailQty;
                            if (addDiscount > promotion.getMaxDiscountPerOrder()) {
                                double allowedDiscountPerItem = promotion.getMaxDiscountPerOrder() / promoRetailQty;
                                adjRetail = retailPrice - allowedDiscountPerItem;
                            }
                        }
                        double finalAdjRetail = Math.max(0.0, adjRetail);
                        PolicyEffectDTO effRetail = buildPolicyEffect(promotion, product, promoRetailQty, retailPrice, finalAdjRetail);
                        effRetail.setConditionText("Số lượng mua < SL tối thiểu (giá bán lẻ)");
                        result.getPromotions().add(effRetail);
                    }
                }
            }
        }

        return result;
    }

    private PolicyEffectDTO buildPolicyEffect(SalesPolicy policy, Product product, int quantity, Double originalPrice, Double adjustedPrice) {
        PolicyEffectDTO eff = new PolicyEffectDTO();
        eff.setId(policy.getId());
        eff.setName(policy.getName());
        eff.setPolicyType(policy.getPolicyType());
        eff.setOriginalPrice(originalPrice);
        eff.setAdjustedPrice(adjustedPrice);
        // Extract tier info for adjustment type/value
        if (policy.getTiers() != null && !policy.getTiers().isEmpty()) {
            SalesPolicyTier firstTier = policy.getTiers().iterator().next();
            eff.setAdjustmentType(firstTier.getAdjustmentType());
            eff.setAdjustmentValue(firstTier.getAdjustmentValue());
            if (firstTier.getGiftProduct() != null) {
                eff.setGiftProductName(firstTier.getGiftProduct().getName());
                eff.setGiftQuantity(firstTier.getGiftQuantity());
            }
        }
        // Build condition text
        eff.setConditionText(buildConditionText(policy, product, quantity));
        return eff;
    }

    private String buildConditionText(SalesPolicy policy, Product product, int quantity) {
        if ("PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())) {
            if (policy.getConditionType() == SalesPolicyConditionType.MIN_PRODUCT_QTY) {
                double minQty = product.getMinPurchaseQuantity() != null ? product.getMinPurchaseQuantity() : 1;
                return "SL mua >= SL tối thiểu (" + (int)minQty + " SP)";
            } else {
                SalesPolicyTier t = policy.getTiers().stream().findFirst().orElse(null);
                if (t != null) {
                    return "SL mua " + formatOperator(t.getOperator()) + " " + t.getThresholdValue().intValue() + " SP";
                }
            }
        } else if ("ORDER_VALUE".equalsIgnoreCase(policy.getTargetType())) {
            SalesPolicyTier t = policy.getTiers().stream().findFirst().orElse(null);
            if (t != null) {
                return "Đơn " + formatOperator(t.getOperator()) + " " + String.format("%,.0f", t.getThresholdValue()) + "đ";
            }
        }
        // Fallback
        if (policy.getTiers() != null && !policy.getTiers().isEmpty()) {
            SalesPolicyTier t = policy.getTiers().iterator().next();
            return "Đơn >= " + String.format("%,.0f", t.getThresholdValue()) + "đ";
        }
        return "Áp dụng cho tất cả";
    }

    private String formatOperator(String op) {
        if (op == null) return "";
        switch (op.toUpperCase()) {
            case "GTE": case ">=": return ">=";
            case "GT": case ">":  return ">";
            case "LTE": case "<=": return "<=";
            case "LT": case "<":  return "<";
            case "EQ": case "=":  return "=";
            default: return op;
        }
    }

    @Transactional
    public void recordPromotionUsage(Long promotionId, Long customerId, Long orderId) {
        if (promotionId == null || customerId == null || orderId == null) return;
        PromotionUsage usage = new PromotionUsage();
        usage.setSalesPolicyId(promotionId);
        usage.setCustomerId(customerId);
        usage.setOrderId(orderId);
        promotionUsageRepository.save(usage);
    }
}
