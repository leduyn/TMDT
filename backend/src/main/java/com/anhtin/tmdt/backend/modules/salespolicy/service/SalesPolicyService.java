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
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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

    // Map miền → danh sách tỉnh thành
    private static final Map<String, List<String>> REGION_PROVINCE_MAP = new HashMap<>();
    static {
        REGION_PROVINCE_MAP.put("miền bắc", Arrays.asList(
            "hà nội", "hải phòng", "quảng ninh", "bắc giang", "bắc kạn", "bắc ninh",
            "cao bằng", "điện biên", "hà giang", "hà nam", "hải dương", "hòa bình",
            "hưng yên", "lai châu", "lạng sơn", "lào cai", "nam định", "ninh bình",
            "phú thọ", "sơn la", "thái bình", "thái nguyên", "tuyên quang",
            "vĩnh phúc", "yên bái"
        ));
        REGION_PROVINCE_MAP.put("miền trung", Arrays.asList(
            "đà nẵng", "huế", "thừa thiên", "bình định", "bình thuận", "đắk lắk",
            "đắk nông", "gia lai", "hà tĩnh", "khánh hòa", "kon tum", "lâm đồng",
            "nghệ an", "ninh thuận", "phú yên", "quảng bình", "quảng nam",
            "quảng ngãi", "quảng trị", "thanh hóa"
        ));
        REGION_PROVINCE_MAP.put("miền nam", Arrays.asList(
            "hồ chí minh", "bà rịa", "vũng tàu", "bình dương", "bình phước",
            "đồng nai", "tây ninh", "an giang", "bạc liêu", "bến tre", "cà mau",
            "cần thơ", "đồng tháp", "hậu giang", "kiên giang", "long an",
            "sóc trăng", "tiền giang", "trà vinh", "vĩnh long"
        ));
    }

    private LocalDateTime parseDateTime(String isoStr) {
        try {
            // Xử lý ISO string có timezone (Z hoặc +07:00, v.v.)
            if (isoStr.endsWith("Z") || isoStr.matches(".*[+-]\\d{2}:\\d{2}$")) {
                return ZonedDateTime.parse(isoStr, DateTimeFormatter.ISO_DATE_TIME)
                        .toLocalDateTime();
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

        ProductPolicyPreviewDTO details = calculateProductPolicyFlows(product, agency, quantity, currentPrice,
                totalOrderValue, paymentMethod, orderSource, customerId, appliedPromotionIds);

        double minQtyVal = product.getMinPurchaseQuantity() != null ? product.getMinPurchaseQuantity().doubleValue() : 1.0;
        int minQty = (int) Math.ceil(minQtyVal);

        if (quantity < minQty) {
            return details.getRetailFlow().getFinalPrice();
        } else {
            return details.getWholesaleFlow().getFinalPrice();
        }
    }

    public Double getOriginalRetailPrice(Product product, Agency agency, Double basePrice) {
        LocalDateTime now = LocalDateTime.now();
        List<SalesPolicy> activePolicies = salesPolicyRepository.findByActiveTrueOrderByIdDesc().stream()
                .filter(p -> (p.getStartDate() == null || p.getStartDate().isBefore(now)) &&
                             (p.getEndDate() == null || p.getEndDate().isAfter(now)))
                .collect(Collectors.toList());

        double minQtyVal = product.getMinPurchaseQuantity() != null ? product.getMinPurchaseQuantity().doubleValue() : 1.0;
        int minQty = (int) Math.ceil(minQtyVal);
        int retailQty = Math.max(1, minQty - 1);

        for (SalesPolicy policy : activePolicies) {
            if (!"RETAIL_POLICY".equalsIgnoreCase(policy.getPolicyType())) continue;
            if (!isPolicyApplicable(policy, product, agency, retailQty, basePrice)) continue;

            double retailPrice = calculateRetailPrice(policy, product, basePrice);
            if (retailPrice != basePrice) {
                return retailPrice;
            }
        }
        return basePrice;
    }

    public ProductPolicyPreviewDTO calculateProductPolicyFlows(Product product, Agency agency, int quantity, Double basePrice,
            Double totalOrderValue, String paymentMethod, String orderSource, Long customerId, Set<Long> appliedPromotionIds) {
        
        ProductPolicyPreviewDTO dto = new ProductPolicyPreviewDTO();
        dto.setBasePrice(basePrice);
        
        double minQtyVal = product.getMinPurchaseQuantity() != null ? product.getMinPurchaseQuantity().doubleValue() : 1.0;
        int minQty = (int) Math.ceil(minQtyVal);
        dto.setMinPurchaseQuantity((double) minQty);
        
        LocalDateTime now = LocalDateTime.now();
        List<SalesPolicy> activePolicies = salesPolicyRepository.findByActiveTrueOrderByIdDesc().stream()
                .filter(p -> (p.getStartDate() == null || p.getStartDate().isBefore(now)) &&
                             (p.getEndDate() == null || p.getEndDate().isAfter(now)))
                .collect(Collectors.toList());
        
        // ----------------------------------------------------
        // WHOLESALE FLOW
        // ----------------------------------------------------
        ProductPolicyPreviewDTO.PriceFlowDetailsDTO wholesale = new ProductPolicyPreviewDTO.PriceFlowDetailsDTO();
        wholesale.setOriginalPrice(basePrice);
        
        // A. Sales Policy (CSBH) on Wholesale Price
        Double wholesalePriceAfterPolicy = basePrice;
        Double bestWholesalePolicyPrice = null;
        ProductPolicyPreviewDTO.PolicyEffectDTO matchedWholesalePolicyEffect = null;
        
        for (SalesPolicy policy : activePolicies) {
            if ("PROMOTION".equalsIgnoreCase(policy.getPolicyType())) continue;
            if ("RETAIL_POLICY".equalsIgnoreCase(policy.getPolicyType())) continue;
            
            if (!isPolicyApplicable(policy, product, agency, quantity, basePrice)) continue;
            
            double adjustedPrice = calculateAdjustedPrice(policy, product, quantity, basePrice, false, minQty);
            if (adjustedPrice == basePrice) continue;
            
            if (bestWholesalePolicyPrice == null || adjustedPrice < bestWholesalePolicyPrice) {
                bestWholesalePolicyPrice = adjustedPrice;
                matchedWholesalePolicyEffect = buildPolicyEffect(policy, product, quantity, basePrice, adjustedPrice, false);
            }
        }
        
        if (bestWholesalePolicyPrice != null) {
            wholesalePriceAfterPolicy = bestWholesalePolicyPrice;
            wholesale.getAppliedPolicies().add(matchedWholesalePolicyEffect);
            wholesale.setPolicyDiscount(basePrice - wholesalePriceAfterPolicy);
        } else {
            wholesale.setPolicyDiscount(0.0);
        }
        wholesale.setPriceAfterPolicy(wholesalePriceAfterPolicy);
        
        // B. Promotion (CTKM) on Wholesale Price
        Double runningWholesalePrice = wholesalePriceAfterPolicy;
        for (SalesPolicy promotion : activePolicies) {
            if (!"PROMOTION".equalsIgnoreCase(promotion.getPolicyType())) continue;
            
            if (!isPolicyApplicable(promotion, product, agency, quantity, basePrice)) continue;
            if (!isPromotionConditionMet(promotion, quantity, basePrice, totalOrderValue, paymentMethod, orderSource, customerId, null)) continue;
            
            double adjustedPromoPrice = calculateAdjustedPrice(promotion, product, quantity, runningWholesalePrice, false, minQty);
            if (adjustedPromoPrice == runningWholesalePrice) continue;
            
            if (promotion.getMaxDiscountPerOrder() != null) {
                double addDiscount = (runningWholesalePrice - adjustedPromoPrice) * quantity;
                if (addDiscount > promotion.getMaxDiscountPerOrder()) {
                    double allowedDiscountPerItem = promotion.getMaxDiscountPerOrder() / quantity;
                    adjustedPromoPrice = runningWholesalePrice - allowedDiscountPerItem;
                }
            }
            
            double finalPromoPrice = Math.max(0.0, adjustedPromoPrice);
            ProductPolicyPreviewDTO.PolicyEffectDTO promoEffect = buildPolicyEffect(promotion, product, quantity, runningWholesalePrice, finalPromoPrice, false);
            wholesale.getAppliedPromotions().add(promoEffect);
            
            runningWholesalePrice = finalPromoPrice;
            if (appliedPromotionIds != null) {
                appliedPromotionIds.add(promotion.getId());
            }
        }
        wholesale.setPromotionDiscount(wholesalePriceAfterPolicy - runningWholesalePrice);
        wholesale.setFinalPrice(runningWholesalePrice);
        dto.setWholesaleFlow(wholesale);
        
        // ----------------------------------------------------
        // RETAIL FLOW
        // ----------------------------------------------------
        ProductPolicyPreviewDTO.PriceFlowDetailsDTO retail = new ProductPolicyPreviewDTO.PriceFlowDetailsDTO();
        
        Double retailPrice = getOriginalRetailPrice(product, agency, basePrice);
        retail.setOriginalPrice(retailPrice);
        
        // A. Sales Policy (CSBH) on Retail Price
        Double retailPriceAfterPolicy = retailPrice;
        Double bestRetailPolicyPrice = null;
        ProductPolicyPreviewDTO.PolicyEffectDTO matchedRetailPolicyEffect = null;
        
        for (SalesPolicy policy : activePolicies) {
            if ("PROMOTION".equalsIgnoreCase(policy.getPolicyType())) continue;
            if ("RETAIL_POLICY".equalsIgnoreCase(policy.getPolicyType())) continue;
            
            boolean isQuantityApplied = "PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType());
            if (isQuantityApplied) {
                SalesPolicyTier tier = policy.getTiers().stream().findFirst().orElse(null);
                if (tier != null && tier.getThresholdValue() != null) {
                    if (tier.getThresholdValue() >= minQty) {
                        continue;
                    }
                }
            }
            
            if (!isPolicyApplicable(policy, product, agency, quantity, retailPrice)) continue;
            
            double adjustedPrice = calculateAdjustedPrice(policy, product, quantity, retailPrice, true, minQty);
            if (adjustedPrice == retailPrice) continue;
            
            if (bestRetailPolicyPrice == null || adjustedPrice < bestRetailPolicyPrice) {
                bestRetailPolicyPrice = adjustedPrice;
                matchedRetailPolicyEffect = buildPolicyEffect(policy, product, quantity, retailPrice, adjustedPrice, true);
            }
        }
        
        if (bestRetailPolicyPrice != null) {
            retailPriceAfterPolicy = bestRetailPolicyPrice;
            retail.getAppliedPolicies().add(matchedRetailPolicyEffect);
            retail.setPolicyDiscount(retailPrice - retailPriceAfterPolicy);
        } else {
            retail.setPolicyDiscount(0.0);
        }
        retail.setPriceAfterPolicy(retailPriceAfterPolicy);
        
        // B. Promotion (CTKM) on Retail Price
        Double runningRetailPrice = retailPriceAfterPolicy;
        for (SalesPolicy promotion : activePolicies) {
            if (!"PROMOTION".equalsIgnoreCase(promotion.getPolicyType())) continue;
            
            boolean isQuantityApplied = "PRODUCT_QTY".equalsIgnoreCase(promotion.getTargetType());
            if (isQuantityApplied) {
                SalesPolicyTier tier = promotion.getTiers().stream().findFirst().orElse(null);
                if (tier != null && tier.getThresholdValue() != null) {
                    if (tier.getThresholdValue() >= minQty) {
                        continue;
                    }
                }
            }
            
            if (!isPolicyApplicable(promotion, product, agency, quantity, retailPrice)) continue;
            if (!isPromotionConditionMet(promotion, quantity, retailPrice, totalOrderValue, paymentMethod, orderSource, customerId, null)) continue;
            
            double adjustedPromoPrice = calculateAdjustedPrice(promotion, product, quantity, runningRetailPrice, true, minQty);
            if (adjustedPromoPrice == runningRetailPrice) continue;
            
            if (promotion.getMaxDiscountPerOrder() != null) {
                double addDiscount = (runningRetailPrice - adjustedPromoPrice) * quantity;
                if (addDiscount > promotion.getMaxDiscountPerOrder()) {
                    double allowedDiscountPerItem = promotion.getMaxDiscountPerOrder() / quantity;
                    adjustedPromoPrice = runningRetailPrice - allowedDiscountPerItem;
                }
            }
            
            double finalPromoPrice = Math.max(0.0, adjustedPromoPrice);
            ProductPolicyPreviewDTO.PolicyEffectDTO promoEffect = buildPolicyEffect(promotion, product, quantity, runningRetailPrice, finalPromoPrice, true);
            retail.getAppliedPromotions().add(promoEffect);
            
            runningRetailPrice = finalPromoPrice;
            if (appliedPromotionIds != null) {
                appliedPromotionIds.add(promotion.getId());
            }
        }
        retail.setPromotionDiscount(retailPriceAfterPolicy - runningRetailPrice);
        retail.setFinalPrice(runningRetailPrice);
        dto.setRetailFlow(retail);
        
        // 3. Set the final selection price
        if (quantity < minQty) {
            dto.setFinalPrice(runningRetailPrice);
        } else {
            dto.setFinalPrice(runningWholesalePrice);
        }
        
        // Backward compatibility
        dto.setRetailPolicies(new ArrayList<>());
        int retailQty = Math.max(1, minQty - 1);
        for (SalesPolicy policy : activePolicies) {
            if (!"RETAIL_POLICY".equalsIgnoreCase(policy.getPolicyType())) continue;
            if (!isPolicyApplicable(policy, product, agency, retailQty, basePrice)) continue;
            double adjustedPrice = calculateRetailPrice(policy, product, basePrice);
            if (adjustedPrice != basePrice) {
                ProductPolicyPreviewDTO.PolicyEffectDTO eff = new ProductPolicyPreviewDTO.PolicyEffectDTO();
                eff.setId(policy.getId());
                eff.setName(policy.getName());
                eff.setPolicyType("RETAIL_POLICY");
                eff.setOriginalPrice(basePrice);
                eff.setAdjustedPrice(adjustedPrice);
                eff.setAdjustmentType(policy.getTiers().stream().findFirst().map(SalesPolicyTier::getAdjustmentType).orElse(null));
                eff.setAdjustmentValue(policy.getTiers().stream().findFirst().map(SalesPolicyTier::getAdjustmentValue).orElse(null));
                eff.setConditionText("SL mua < SL tối thiểu (" + minQty + " SP)");
                SalesPolicyTier tier = policy.getTiers().stream().findFirst().orElse(null);
                if (tier != null && tier.getGiftProduct() != null) {
                    eff.setGiftProductName(tier.getGiftProduct().getName());
                    eff.setGiftQuantity(tier.getGiftQuantity());
                }
                dto.getRetailPolicies().add(eff);
                break;
            }
        }
        
        dto.setSalesPolicies(new ArrayList<>());
        dto.getSalesPolicies().addAll(wholesale.getAppliedPolicies());
        
        dto.setPromotions(new ArrayList<>());
        dto.getPromotions().addAll(wholesale.getAppliedPromotions());
        for (ProductPolicyPreviewDTO.PolicyEffectDTO eff : retail.getAppliedPromotions()) {
            boolean alreadyAdded = false;
            for (ProductPolicyPreviewDTO.PolicyEffectDTO existing : dto.getPromotions()) {
                if (existing.getId().equals(eff.getId())) {
                    alreadyAdded = true;
                    break;
                }
            }
            if (!alreadyAdded) {
                dto.getPromotions().add(eff);
            }
        }
        
        return dto;
    }

    private boolean isPolicyApplicable(SalesPolicy policy, Product product, Agency agency, int quantity, Double currentPrice) {
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

        if (!isApplicable) return false;

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
                        String pTrimLower = p.trim().toLowerCase();
                        // Kiểm tra trực tiếp (khớp tên tỉnh đúng hoặc tên miền đúng)
                        if (address.contains(pTrimLower)) {
                            provinceMatch = true;
                            break;
                        }
                        // Kiểm tra theo map miền (Miền Bắc / Miền Trung / Miền Nam)
                        List<String> regionProvinces = REGION_PROVINCE_MAP.get(pTrimLower);
                        if (regionProvinces != null) {
                            for (String rp : regionProvinces) {
                                if (address.contains(rp)) {
                                    provinceMatch = true;
                                    break;
                                }
                            }
                        }
                        if (provinceMatch) break;
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
        if (promotion.getMinOrderValue() != null && totalOrderValue != null) {
            if (totalOrderValue < promotion.getMinOrderValue()) return false;
        }

        if (promotion.getApplicablePaymentMethods() != null && !promotion.getApplicablePaymentMethods().isBlank()) {
            if (paymentMethod != null) {
                boolean matched = false;
                for (String pm : promotion.getApplicablePaymentMethods().split(",")) {
                    if (pm.trim().equalsIgnoreCase(paymentMethod)) {
                        matched = true;
                        break;
                    }
                }
                if (!matched) return false;
            }
        }

        if (promotion.getApplicableOrderSources() != null && !promotion.getApplicableOrderSources().isBlank()) {
            if (orderSource != null) {
                boolean matched = false;
                for (String os : promotion.getApplicableOrderSources().split(",")) {
                    if (os.trim().equalsIgnoreCase(orderSource)) {
                        matched = true;
                        break;
                    }
                }
                if (!matched) return false;
            }
        }

        if (promotion.getMaxUsagePerCustomer() != null && customerId != null) {
            int usageCount = promotionUsageRepository.countBySalesPolicyIdAndCustomerId(promotion.getId(), customerId);
            if (usageCount >= promotion.getMaxUsagePerCustomer()) return false;
        }

        return true;
    }

    private double calculateAdjustedPrice(SalesPolicy policy, Product product, int quantity, Double currentPrice, boolean isRetailFlow, int minQty) {
        boolean matched = false;
        String adjType = null;
        Double adjValue = null;

        // MIN_PRODUCT_QTY conditionType: chỉ dành cho SALES_POLICY, block retail flow.
        // PROMOTION với bất kỳ conditionType nào đều dùng tier threshold thực tế (nánh else).
        boolean isSalesPolicyMinQty = "PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())
                && policy.getConditionType() == SalesPolicyConditionType.MIN_PRODUCT_QTY
                && !"PROMOTION".equalsIgnoreCase(policy.getPolicyType());

        if (isSalesPolicyMinQty) {
            if (isRetailFlow) {
                // CSBH dựa trên SL tối thiểu của sản phẩm: không áp dụng cho giá bán lẻ
                return currentPrice;
            }
            double minQtyVal = product.getMinPurchaseQuantity() != null
                ? product.getMinPurchaseQuantity().doubleValue() : 1.0;
            SalesPolicyTier firstTier = policy.getTiers().stream().findFirst().orElse(null);
            if (firstTier != null && compareQuantity(quantity, minQtyVal, firstTier.getOperator())) {
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
            // Thường: CTKM hoặc CSBH theo giá trị đơn hàng / số lượng tùy chỉnh
            double evaluationValue = "PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())
                ? quantity
                : currentPrice * quantity;

            SalesPolicyTier matchedTier = null;
            for (SalesPolicyTier tier : policy.getTiers()) {
                // Với retail flow và PRODUCT_QTY: bỏ qua tier có threshold >= minQty
                // (chỉ áp dụng với CSBH; CTKM cũng cần lọc nếu yêu cầu SL buôn)
                if (isRetailFlow && "PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())) {
                    if (tier.getThresholdValue() != null && tier.getThresholdValue() >= minQty) {
                        continue;
                    }
                }
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

        if (policy.getMaxDiscountValue() != null && !"PROMOTION".equalsIgnoreCase(policy.getPolicyType())) {
            double totalDiscount = (currentPrice - adjustedPrice) * quantity;
            if (totalDiscount > policy.getMaxDiscountValue()) {
                double allowedDiscountPerItem = policy.getMaxDiscountValue() / quantity;
                adjustedPrice = currentPrice - allowedDiscountPerItem;
            }
        }

        return adjustedPrice;
    }

    private double calculateAdjustedPrice(SalesPolicy policy, Product product, int quantity, Double currentPrice) {
        double minQtyVal = product.getMinPurchaseQuantity() != null ? product.getMinPurchaseQuantity().doubleValue() : 1.0;
        int minQty = (int) Math.ceil(minQtyVal);
        return calculateAdjustedPrice(policy, product, quantity, currentPrice, false, minQty);
    }

    private double calculateRetailPrice(SalesPolicy policy, Product product, Double currentPrice) {
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

    public SalesPolicyTier getMatchedTierForOrder(Product product, Agency agency, int quantity, Double basePrice) {
        if (agency == null || product == null || basePrice == null) {
            return null;
        }

        double minQtyVal = product.getMinPurchaseQuantity() != null ? product.getMinPurchaseQuantity().doubleValue() : 1.0;
        int minQty = (int) Math.ceil(minQtyVal);
        boolean isRetail = quantity < minQty;

        LocalDateTime now = LocalDateTime.now();
        List<SalesPolicy> activePolicies = salesPolicyRepository.findByActiveTrueOrderByIdDesc().stream()
                .filter(p -> (p.getStartDate() == null || p.getStartDate().isBefore(now)) &&
                             (p.getEndDate() == null || p.getEndDate().isAfter(now)))
                .collect(Collectors.toList());

        SalesPolicyTier bestTier = null;
        Double lowestPrice = null;

        Double priceToUse = basePrice;
        if (isRetail) {
            priceToUse = getOriginalRetailPrice(product, agency, basePrice);
        }

        for (SalesPolicy policy : activePolicies) {
            if ("PROMOTION".equalsIgnoreCase(policy.getPolicyType())) continue;
            if ("RETAIL_POLICY".equalsIgnoreCase(policy.getPolicyType())) continue;

            if (isRetail) {
                if ("PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())) {
                    SalesPolicyTier tier = policy.getTiers().stream().findFirst().orElse(null);
                    if (tier != null && tier.getThresholdValue() != null && tier.getThresholdValue() >= minQty) {
                        continue;
                    }
                }
            }

            if (!isPolicyApplicable(policy, product, agency, quantity, priceToUse)) continue;

            SalesPolicyTier resultTier = null;

            if ("PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())
                    && policy.getConditionType() == SalesPolicyConditionType.MIN_PRODUCT_QTY
                    && !"PROMOTION".equalsIgnoreCase(policy.getPolicyType())) {
                if (isRetail) continue;

                SalesPolicyTier firstTier = policy.getTiers().stream().findFirst().orElse(null);
                if (firstTier != null && compareQuantity(quantity, minQtyVal, firstTier.getOperator())) {
                    if (policy.isApplyToAllProducts()) {
                        resultTier = firstTier;
                    } else {
                        SalesPolicyProductGroupItem matchedItem = findGroupItemForProduct(policy, product.getId());
                        if (matchedItem != null && matchedItem.getAdjustmentType() != null) {
                            resultTier = new SalesPolicyTier();
                            resultTier.setOperator(firstTier.getOperator());
                            resultTier.setThresholdValue(minQtyVal);
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
                double evaluationValue = "PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())
                    ? quantity
                    : priceToUse * quantity;

                SalesPolicyTier matchedTier = null;
                for (SalesPolicyTier tier : policy.getTiers()) {
                    if (isRetail && "PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())) {
                        if (tier.getThresholdValue() != null && tier.getThresholdValue() >= minQty) {
                            continue;
                        }
                    }
                    if (compareQuantity(evaluationValue, tier.getThresholdValue(), tier.getOperator())) {
                        matchedTier = tier;
                    }
                }
                resultTier = matchedTier;
            }

            if (resultTier == null) continue;

            double adjustedPrice = priceToUse;
            if ("PERCENTAGE".equalsIgnoreCase(resultTier.getAdjustmentType())) {
                adjustedPrice = priceToUse + (priceToUse * resultTier.getAdjustmentValue() / 100.0);
            } else if ("FIXED_AMOUNT".equalsIgnoreCase(resultTier.getAdjustmentType())) {
                adjustedPrice = priceToUse + resultTier.getAdjustmentValue();
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
            if (policy.getConditionType() == SalesPolicyConditionType.MIN_PRODUCT_QTY
                    && !"PROMOTION".equalsIgnoreCase(policy.getPolicyType())) {
                return minQty;
            } else {
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
            int baseQty = Math.max(1, minQty - 1);
            if (basePrice != null && basePrice > 0 && policy.getTiers() != null && !policy.getTiers().isEmpty()) {
                double lowestThreshold = policy.getTiers().stream()
                    .mapToDouble(t -> t.getThresholdValue() != null ? t.getThresholdValue() : 0.0)
                    .min()
                    .orElse(0.0);
                if (lowestThreshold > 0) {
                    int qtyNeeded = (int) Math.ceil(lowestThreshold / basePrice);
                    baseQty = Math.max(baseQty, qtyNeeded);
                }
            }
            return baseQty;
        }
        return minQty;
    }

    public ProductPolicyPreviewDTO previewProductPolicies(Product product, int quantity, Agency agency, Double basePrice) {
        return calculateProductPolicyFlows(product, agency, quantity, basePrice, null, null, null, null, null);
    }

    private PolicyEffectDTO buildPolicyEffect(SalesPolicy policy, Product product, int quantity, Double originalPrice, Double adjustedPrice, boolean isRetailFlow) {
        PolicyEffectDTO eff = new PolicyEffectDTO();
        eff.setId(policy.getId());
        eff.setName(policy.getName());
        eff.setPolicyType(policy.getPolicyType());
        eff.setOriginalPrice(originalPrice);
        eff.setAdjustedPrice(adjustedPrice);
        if (policy.getTiers() != null && !policy.getTiers().isEmpty()) {
            SalesPolicyTier firstTier = policy.getTiers().iterator().next();
            eff.setAdjustmentType(firstTier.getAdjustmentType());
            eff.setAdjustmentValue(firstTier.getAdjustmentValue());
            if (firstTier.getGiftProduct() != null) {
                eff.setGiftProductName(firstTier.getGiftProduct().getName());
                eff.setGiftQuantity(firstTier.getGiftQuantity());
            }
        }
        
        String cond = buildConditionText(policy, product, quantity);
        if ("PROMOTION".equalsIgnoreCase(policy.getPolicyType())) {
            if (isRetailFlow) {
                cond += " (giá bán lẻ)";
            } else {
                cond += " (giá bán buôn)";
            }
        }
        eff.setConditionText(cond);
        return eff;
    }

    private PolicyEffectDTO buildPolicyEffect(SalesPolicy policy, Product product, int quantity, Double originalPrice, Double adjustedPrice) {
        return buildPolicyEffect(policy, product, quantity, originalPrice, adjustedPrice, false);
    }

    private String buildConditionText(SalesPolicy policy, Product product, int quantity) {
        if ("PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())) {
            if (policy.getConditionType() == SalesPolicyConditionType.MIN_PRODUCT_QTY
                    && !"PROMOTION".equalsIgnoreCase(policy.getPolicyType())) {
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
