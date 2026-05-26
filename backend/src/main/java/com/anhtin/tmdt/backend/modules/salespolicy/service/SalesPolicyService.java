package com.anhtin.tmdt.backend.modules.salespolicy.service;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyRanking;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRankingRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.salespolicy.dto.SalesPolicyDTO;
import com.anhtin.tmdt.backend.modules.salespolicy.dto.SalesPolicyRequest;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicy;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyAudienceFilter;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyProductGroup;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyProductGroupItem;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyTier;
import com.anhtin.tmdt.backend.modules.salespolicy.repository.SalesPolicyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

    private SalesPolicyDTO enrichDTO(SalesPolicyDTO dto) {
        if (dto != null && dto.getProductGroups() != null) {
            for (SalesPolicyDTO.ProductGroupResponse group : dto.getProductGroups()) {
                if (group.getItems() != null) {
                    for (SalesPolicyDTO.ProductGroupItemResponse item : group.getItems()) {
                        if ("PRODUCT".equalsIgnoreCase(item.getItemType())) {
                            productRepository.findById(item.getItemId())
                                    .ifPresent(p -> item.setItemName(p.getName()));
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
        policy.setMaxDiscountValue(request.getMaxDiscountValue());
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
        if (agency == null || product == null || currentPrice == null) {
            return currentPrice;
        }

        // 1. Lấy tất cả các chính sách đang hoạt động
        LocalDateTime now = LocalDateTime.now();
        List<SalesPolicy> activePolicies = salesPolicyRepository.findByActiveTrueOrderByIdDesc().stream()
                .filter(p -> (p.getStartDate() == null || p.getStartDate().isBefore(now)) &&
                             (p.getEndDate() == null || p.getEndDate().isAfter(now)))
                .collect(Collectors.toList());

        Double bestPrice = null;

        for (SalesPolicy policy : activePolicies) {
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
                    isApplicable = false; // Bị loại trừ
                }
            }

            if (!isApplicable) continue;

            // C. Kiểm tra đối tượng đại lý
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

                    // Lọc hạng
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

                    // Lọc tỉnh thành
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
                        break; // Thỏa mãn 1 bộ điều kiện OR
                    }
                }
            } else if (!isIncluded) {
                // Nếu không có bộ lọc đối tượng, mặc định áp dụng cho tất cả đại lý không bị loại trừ
                matchesFilter = policy.getIncludedAgencies().isEmpty();
            }

            if (!isIncluded && !matchesFilter) continue;

            // D. Kiểm tra các bậc điều kiện & ưu đãi thỏa mãn
            double evaluationValue = 0.0;
            if ("PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())) {
                evaluationValue = quantity;
            } else {
                evaluationValue = currentPrice * quantity; // Giá trị xét dựa trên số lượng mua * đơn giá resolved gốc
            }

            // Tìm bậc cao nhất thỏa mãn
            SalesPolicyTier matchedTier = null;
            for (SalesPolicyTier tier : policy.getTiers()) {
                boolean tierMet = compareQuantity(evaluationValue, tier.getThresholdValue(), tier.getOperator());
                if (tierMet) {
                    matchedTier = tier; // Bậc sau thỏa mãn sẽ đè lên bậc trước vì đã ORDER BY thresholdValue ASC
                }
            }

            if (matchedTier == null) continue; // Không đạt bậc nào

            // E. Tính toán đơn giá sau ưu đãi
            double adjustedPrice = currentPrice;
            if ("PERCENTAGE".equalsIgnoreCase(matchedTier.getAdjustmentType())) {
                adjustedPrice = currentPrice + (currentPrice * matchedTier.getAdjustmentValue() / 100.0);
            } else if ("FIXED_AMOUNT".equalsIgnoreCase(matchedTier.getAdjustmentType())) {
                adjustedPrice = currentPrice + matchedTier.getAdjustmentValue();
            } else if ("SPECIFIC_PRICE".equalsIgnoreCase(matchedTier.getAdjustmentType())) {
                adjustedPrice = matchedTier.getAdjustmentValue();
            }

            adjustedPrice = Math.max(0.0, adjustedPrice);

            // Áp dụng giới hạn giảm giá tối đa trên đơn hàng nếu có
            if (policy.getMaxDiscountValue() != null) {
                double totalDiscount = (currentPrice - adjustedPrice) * quantity;
                if (totalDiscount > policy.getMaxDiscountValue()) {
                    double allowedDiscountPerItem = policy.getMaxDiscountValue() / quantity;
                    adjustedPrice = currentPrice - allowedDiscountPerItem;
                }
            }

            if (bestPrice == null || adjustedPrice < bestPrice) {
                bestPrice = adjustedPrice;
            }
        }

        return bestPrice != null ? bestPrice : currentPrice;
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

            double evaluationValue = 0.0;
            if ("PRODUCT_QTY".equalsIgnoreCase(policy.getTargetType())) {
                evaluationValue = quantity;
            } else {
                evaluationValue = currentPrice * quantity;
            }

            SalesPolicyTier matchedTier = null;
            for (SalesPolicyTier tier : policy.getTiers()) {
                if (compareQuantity(evaluationValue, tier.getThresholdValue(), tier.getOperator())) {
                    matchedTier = tier;
                }
            }

            if (matchedTier == null) continue;

            double adjustedPrice = currentPrice;
            if ("PERCENTAGE".equalsIgnoreCase(matchedTier.getAdjustmentType())) {
                adjustedPrice = currentPrice + (currentPrice * matchedTier.getAdjustmentValue() / 100.0);
            } else if ("FIXED_AMOUNT".equalsIgnoreCase(matchedTier.getAdjustmentType())) {
                adjustedPrice = currentPrice + matchedTier.getAdjustmentValue();
            } else if ("SPECIFIC_PRICE".equalsIgnoreCase(matchedTier.getAdjustmentType())) {
                adjustedPrice = matchedTier.getAdjustmentValue();
            }
            adjustedPrice = Math.max(0.0, adjustedPrice);

            if (lowestPrice == null || adjustedPrice < lowestPrice) {
                lowestPrice = adjustedPrice;
                bestTier = matchedTier;
            }
        }

        return bestTier;
    }
}
