package com.anhtin.tmdt.backend.modules.salespolicy.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyRanking;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRankingRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicy;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyAudienceFilter;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyTier;
import com.anhtin.tmdt.backend.modules.salespolicy.repository.SalesPolicyRepository;

@SpringBootTest
public class SalesPolicyServiceTest {

    @Autowired
    private SalesPolicyService salesPolicyService;

    @MockBean
    private SalesPolicyRepository salesPolicyRepository;

    @MockBean
    private AgencyRankingRepository agencyRankingRepository;

    @Test
    public void testApplySalesPolicy_MinProductQty_NotMet() {
        // Setup Active Policy: targetType = PRODUCT_QTY, tier: >= 5.0, discount -10%
        SalesPolicy policy = new SalesPolicy();
        policy.setId(1L);
        policy.setName("Min Qty Promo");
        policy.setActive(true);
        policy.setTargetType("PRODUCT_QTY");
        policy.setApplyToAllProducts(true);

        SalesPolicyTier tier = new SalesPolicyTier();
        tier.setTierIndex(1);
        tier.setOperator("GTE");
        tier.setThresholdValue(5.0);
        tier.setAdjustmentType("PERCENTAGE");
        tier.setAdjustmentValue(-10.0);
        policy.getTiers().add(tier);

        when(salesPolicyRepository.findByActiveTrueOrderByIdDesc())
                .thenReturn(Collections.singletonList(policy));

        Product product = new Product();
        product.setId(10L);

        Agency agency = new Agency();
        agency.setId(100L);

        // Buy qty = 3 (less than tier threshold of 5)
        Double finalPrice = salesPolicyService.applySalesPolicy(product, agency, 3, 100000.0);

        // Assert: price is unchanged
        assertEquals(100000.0, finalPrice);
    }

    @Test
    public void testApplySalesPolicy_MinProductQty_Met() {
        // Setup Active Policy: targetType = PRODUCT_QTY, tier: >= 5.0, discount -10%
        SalesPolicy policy = new SalesPolicy();
        policy.setId(1L);
        policy.setName("Min Qty Promo");
        policy.setActive(true);
        policy.setTargetType("PRODUCT_QTY");
        policy.setApplyToAllProducts(true);

        SalesPolicyTier tier = new SalesPolicyTier();
        tier.setTierIndex(1);
        tier.setOperator("GTE");
        tier.setThresholdValue(5.0);
        tier.setAdjustmentType("PERCENTAGE");
        tier.setAdjustmentValue(-10.0);
        policy.getTiers().add(tier);

        when(salesPolicyRepository.findByActiveTrueOrderByIdDesc())
                .thenReturn(Collections.singletonList(policy));

        Product product = new Product();
        product.setId(10L);

        Agency agency = new Agency();
        agency.setId(100L);

        // Buy qty = 5 (exactly equal to tier threshold of 5)
        Double finalPrice = salesPolicyService.applySalesPolicy(product, agency, 5, 100000.0);

        // Assert: 10% discount applied -> 90000.0
        assertEquals(90000.0, finalPrice);
    }

    @Test
    public void testApplySalesPolicy_CustomQty_Met() {
        // Setup Active Policy: targetType = PRODUCT_QTY, tier: >= 10.0, discount -15%
        SalesPolicy policy = new SalesPolicy();
        policy.setId(1L);
        policy.setName("Custom Qty Promo");
        policy.setActive(true);
        policy.setTargetType("PRODUCT_QTY");
        policy.setApplyToAllProducts(true);

        SalesPolicyTier tier = new SalesPolicyTier();
        tier.setTierIndex(1);
        tier.setOperator("GTE");
        tier.setThresholdValue(10.0);
        tier.setAdjustmentType("PERCENTAGE");
        tier.setAdjustmentValue(-15.0);
        policy.getTiers().add(tier);

        when(salesPolicyRepository.findByActiveTrueOrderByIdDesc())
                .thenReturn(Collections.singletonList(policy));

        Product product = new Product();
        product.setId(10L);

        Agency agency = new Agency();
        agency.setId(100L);

        // Buy qty = 12 (meets >= 10 limit)
        Double finalPrice = salesPolicyService.applySalesPolicy(product, agency, 12, 100000.0);

        // Assert: 15% discount applied -> 85000.0
        assertEquals(85000.0, finalPrice);
    }

    @Test
    public void testApplySalesPolicy_ProductValue_Met() {
        // Setup Active Policy: targetType = ORDER_VALUE, tier: > 100000.0, fixed adjustment -20000.0
        SalesPolicy policy = new SalesPolicy();
        policy.setId(1L);
        policy.setName("Premium Product Discount");
        policy.setActive(true);
        policy.setTargetType("ORDER_VALUE");
        policy.setApplyToAllProducts(true);

        SalesPolicyTier tier = new SalesPolicyTier();
        tier.setTierIndex(1);
        tier.setOperator("GT");
        tier.setThresholdValue(100000.0);
        tier.setAdjustmentType("FIXED_AMOUNT");
        tier.setAdjustmentValue(-20000.0);
        policy.getTiers().add(tier);

        when(salesPolicyRepository.findByActiveTrueOrderByIdDesc())
                .thenReturn(Collections.singletonList(policy));

        Product product = new Product();
        product.setId(10L);

        Agency agency = new Agency();
        agency.setId(100L);

        // Original price 150000.0 > 100000.0 limit
        Double finalPrice = salesPolicyService.applySalesPolicy(product, agency, 1, 150000.0);

        // Assert: fixed discount applied -> 130000.0
        assertEquals(130000.0, finalPrice);
    }

    @Test
    public void testApplySalesPolicy_RankAndProvinceFilter_Matched() {
        // Setup Active Policy: Filter rank = GOLD, filter province = Hồ Chí Minh, tier: >= 1, Specific Price = 50000.0
        SalesPolicy policy = new SalesPolicy();
        policy.setId(1L);
        policy.setName("HCM Gold VIP Promo");
        policy.setActive(true);
        policy.setTargetType("PRODUCT_QTY");
        policy.setApplyToAllProducts(true);

        SalesPolicyTier tier = new SalesPolicyTier();
        tier.setTierIndex(1);
        tier.setOperator("GTE");
        tier.setThresholdValue(1.0);
        tier.setAdjustmentType("SPECIFIC_PRICE");
        tier.setAdjustmentValue(50000.0); // SPECIFIC_PRICE overrides to adjustmentValue
        policy.getTiers().add(tier);

        SalesPolicyAudienceFilter filter = new SalesPolicyAudienceFilter();
        filter.setRankLevels("GOLD");
        filter.setProvinces("Hồ Chí Minh");
        policy.getAudienceFilters().add(filter);

        when(salesPolicyRepository.findByActiveTrueOrderByIdDesc())
                .thenReturn(Collections.singletonList(policy));

        // Mock ranking to return GOLD rank
        AgencyRanking ranking = new AgencyRanking();
        ranking.setRankLevel("GOLD");
        when(agencyRankingRepository.findFirstByAgencyIdOrderByYearDescMonthDesc(100L))
                .thenReturn(Optional.of(ranking));

        Product product = new Product();
        product.setId(10L);

        Agency agency = new Agency();
        agency.setId(100L);
        agency.setAddress("123 Nguyễn Huệ, Tp. Hồ Chí Minh");

        Double finalPrice = salesPolicyService.applySalesPolicy(product, agency, 1, 100000.0);

        // Assert: specific price applied -> 50000.0
        assertEquals(50000.0, finalPrice);
    }

    @Test
    public void testApplySalesPolicy_ExcludedAgency() {
        // Setup Policy
        SalesPolicy policy = new SalesPolicy();
        policy.setId(1L);
        policy.setName("Global Promo");
        policy.setActive(true);
        policy.setTargetType("PRODUCT_QTY");
        policy.setApplyToAllProducts(true);

        SalesPolicyTier tier = new SalesPolicyTier();
        tier.setTierIndex(1);
        tier.setOperator("GTE");
        tier.setThresholdValue(1.0);
        tier.setAdjustmentType("PERCENTAGE");
        tier.setAdjustmentValue(-10.0);
        policy.getTiers().add(tier);

        // Add excluded agency
        Agency agency = new Agency();
        agency.setId(100L);
        policy.setExcludedAgencies(Collections.singleton(agency));

        when(salesPolicyRepository.findByActiveTrueOrderByIdDesc())
                .thenReturn(Collections.singletonList(policy));

        Product product = new Product();
        product.setId(10L);

        Double finalPrice = salesPolicyService.applySalesPolicy(product, agency, 1, 100000.0);

        // Assert: Excluded, so price remains original
        assertEquals(100000.0, finalPrice);
    }

    @Test
    public void testApplySalesPolicy_TargetCategory() {
        // Setup Category and Product
        Category category = new Category();
        category.setId(2L);
        category.setName("Electronics");

        Product product = new Product();
        product.setId(10L);
        product.setCategory(category);

        // Setup Policy: applies only to Category id = 2L
        SalesPolicy policy = new SalesPolicy();
        policy.setId(1L);
        policy.setName("Electronics Promo");
        policy.setActive(true);
        policy.setTargetType("PRODUCT_QTY");
        policy.setApplyToAllProducts(false);
        policy.setTargetCategories(Collections.singleton(category));

        SalesPolicyTier tier = new SalesPolicyTier();
        tier.setTierIndex(1);
        tier.setOperator("GTE");
        tier.setThresholdValue(1.0);
        tier.setAdjustmentType("PERCENTAGE");
        tier.setAdjustmentValue(-10.0);
        policy.getTiers().add(tier);

        when(salesPolicyRepository.findByActiveTrueOrderByIdDesc())
                .thenReturn(Collections.singletonList(policy));

        Agency agency = new Agency();
        agency.setId(100L);

        Double finalPrice = salesPolicyService.applySalesPolicy(product, agency, 1, 100000.0);

        // Assert: matches category -> discount applied -> 90000.0
        assertEquals(90000.0, finalPrice);
    }

    @Test
    public void testApplySalesPolicy_MultiplePolicies_SelectsBestPrice() {
        // Policy 1: Giảm 10% (100k -> 90k)
        SalesPolicy policy1 = new SalesPolicy();
        policy1.setId(1L);
        policy1.setName("10% Off");
        policy1.setActive(true);
        policy1.setTargetType("PRODUCT_QTY");
        policy1.setApplyToAllProducts(true);

        SalesPolicyTier tier1 = new SalesPolicyTier();
        tier1.setTierIndex(1);
        tier1.setOperator("GTE");
        tier1.setThresholdValue(1.0);
        tier1.setAdjustmentType("PERCENTAGE");
        tier1.setAdjustmentValue(-10.0);
        policy1.getTiers().add(tier1);

        // Policy 2: Giảm 20.000đ cố định (100k -> 80k)
        SalesPolicy policy2 = new SalesPolicy();
        policy2.setId(2L);
        policy2.setName("20k Off");
        policy2.setActive(true);
        policy2.setTargetType("PRODUCT_QTY");
        policy2.setApplyToAllProducts(true);

        SalesPolicyTier tier2 = new SalesPolicyTier();
        tier2.setTierIndex(1);
        tier2.setOperator("GTE");
        tier2.setThresholdValue(1.0);
        tier2.setAdjustmentType("FIXED_AMOUNT");
        tier2.setAdjustmentValue(-20000.0);
        policy2.getTiers().add(tier2);

        when(salesPolicyRepository.findByActiveTrueOrderByIdDesc())
                .thenReturn(Arrays.asList(policy1, policy2));

        Product product = new Product();
        product.setId(10L);

        Agency agency = new Agency();
        agency.setId(100L);

        Double finalPrice = salesPolicyService.applySalesPolicy(product, agency, 1, 100000.0);

        // Assert: Chọn giá tốt nhất cho đại lý (thấp nhất) -> 80000.0
        assertEquals(80000.0, finalPrice);
    }

    @Test
    public void testCalculateProductPolicyFlows_WholesaleAndRetailRules() {
        // Setup RETAIL_POLICY (Phase 0: Tăng 20% khi mua lẻ)
        SalesPolicy retailPolicy = new SalesPolicy();
        retailPolicy.setId(10L);
        retailPolicy.setName("Retail Policy +20%");
        retailPolicy.setActive(true);
        retailPolicy.setPolicyType("RETAIL_POLICY");
        retailPolicy.setTargetType("PRODUCT_QTY");
        retailPolicy.setApplyToAllProducts(true);
        
        SalesPolicyTier tierRetail = new SalesPolicyTier();
        tierRetail.setTierIndex(1);
        tierRetail.setOperator("LT");
        tierRetail.setThresholdValue(5.0); // min purchase qty is 5
        tierRetail.setAdjustmentType("PERCENTAGE");
        tierRetail.setAdjustmentValue(20.0); // +20%
        retailPolicy.getTiers().add(tierRetail);

        // Setup SALES_POLICY (CSBH: Giảm 10% theo số lượng >= 5)
        SalesPolicy salesPolicyQty = new SalesPolicy();
        salesPolicyQty.setId(11L);
        salesPolicyQty.setName("CSBH Qty GTE 5");
        salesPolicyQty.setActive(true);
        salesPolicyQty.setPolicyType("SALES_POLICY");
        salesPolicyQty.setTargetType("PRODUCT_QTY");
        salesPolicyQty.setApplyToAllProducts(true);

        SalesPolicyTier tierQty = new SalesPolicyTier();
        tierQty.setTierIndex(1);
        tierQty.setOperator("GTE");
        tierQty.setThresholdValue(5.0); // GTE 5 (>= minPurchaseQuantity) -> Only Wholesale flow gets this!
        tierQty.setAdjustmentType("PERCENTAGE");
        tierQty.setAdjustmentValue(-10.0); // -10%
        salesPolicyQty.getTiers().add(tierQty);

        // Setup SALES_POLICY (CSBH: Giảm 5% theo số lượng >= 2)
        SalesPolicy salesPolicyQty2 = new SalesPolicy();
        salesPolicyQty2.setId(12L);
        salesPolicyQty2.setName("CSBH Qty GTE 2");
        salesPolicyQty2.setActive(true);
        salesPolicyQty2.setPolicyType("SALES_POLICY");
        salesPolicyQty2.setTargetType("PRODUCT_QTY");
        salesPolicyQty2.setApplyToAllProducts(true);

        SalesPolicyTier tierQty2 = new SalesPolicyTier();
        tierQty2.setTierIndex(1);
        tierQty2.setOperator("GTE");
        tierQty2.setThresholdValue(2.0); // GTE 2 (< minPurchaseQuantity) -> BOTH flows get this!
        tierQty2.setAdjustmentType("PERCENTAGE");
        tierQty2.setAdjustmentValue(-5.0); // -5%
        salesPolicyQty2.getTiers().add(tierQty2);

        // Setup PROMOTION (CTKM: Giảm 1000đ fixed value)
        SalesPolicy promotion = new SalesPolicy();
        promotion.setId(13L);
        promotion.setName("CTKM Fixed");
        promotion.setActive(true);
        promotion.setPolicyType("PROMOTION");
        promotion.setTargetType("ORDER_VALUE"); // Order value condition -> BOTH flows get this!
        promotion.setApplyToAllProducts(true);

        SalesPolicyTier tierPromo = new SalesPolicyTier();
        tierPromo.setTierIndex(1);
        tierPromo.setOperator("GTE");
        tierPromo.setThresholdValue(0.0);
        tierPromo.setAdjustmentType("FIXED_AMOUNT");
        tierPromo.setAdjustmentValue(-1000.0); // -1000 VND
        promotion.getTiers().add(tierPromo);

        when(salesPolicyRepository.findByActiveTrueOrderByIdDesc())
                .thenReturn(Arrays.asList(retailPolicy, salesPolicyQty, salesPolicyQty2, promotion));

        Product product = new Product();
        product.setId(10L);
        product.setBasePrice(10000.0);
        product.setMinPurchaseQuantity(5); // Q_min = 5

        Agency agency = new Agency();
        agency.setId(100L);

        // Case A: Buy quantity = 2 (quantity < Q_min)
        com.anhtin.tmdt.backend.modules.salespolicy.dto.ProductPolicyPreviewDTO details = 
                salesPolicyService.calculateProductPolicyFlows(product, agency, 2, 10000.0, null, null, null, null, null);

        assertNotNull(details);
        assertEquals(5.0, details.getMinPurchaseQuantity());
        
        // Retail Flow checks
        assertEquals(12000.0, details.getRetailFlow().getOriginalPrice());
        assertEquals(600.0, details.getRetailFlow().getPolicyDiscount());
        assertEquals(11400.0, details.getRetailFlow().getPriceAfterPolicy());
        assertEquals(1000.0, details.getRetailFlow().getPromotionDiscount());
        assertEquals(10400.0, details.getRetailFlow().getFinalPrice());

        // Wholesale Flow checks
        assertEquals(10000.0, details.getWholesaleFlow().getOriginalPrice());
        assertEquals(500.0, details.getWholesaleFlow().getPolicyDiscount());
        assertEquals(9500.0, details.getWholesaleFlow().getPriceAfterPolicy());
        assertEquals(1000.0, details.getWholesaleFlow().getPromotionDiscount());
        assertEquals(8500.0, details.getWholesaleFlow().getFinalPrice());

        // Since quantity = 2 < 5, final price should be retail final price (10400.0)
        assertEquals(10400.0, details.getFinalPrice());

        // Case B: Buy quantity = 5 (quantity >= Q_min)
        com.anhtin.tmdt.backend.modules.salespolicy.dto.ProductPolicyPreviewDTO detailsB = 
                salesPolicyService.calculateProductPolicyFlows(product, agency, 5, 10000.0, null, null, null, null, null);
        
        assertEquals(9000.0, detailsB.getWholesaleFlow().getPriceAfterPolicy());
        assertEquals(8000.0, detailsB.getWholesaleFlow().getFinalPrice());
        assertEquals(8000.0, detailsB.getFinalPrice()); // quantity = 5 >= 5
    }
}
