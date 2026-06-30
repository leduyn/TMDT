package com.anhtin.tmdt.backend.modules.loyalty.service;

import com.anhtin.tmdt.backend.modules.common.service.SystemConfigService;
import com.anhtin.tmdt.backend.modules.loyalty.entity.*;
import com.anhtin.tmdt.backend.modules.loyalty.repository.*;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
public class GamificationRuleEngineServiceTest {

    @Autowired
    private GamificationRuleEngineService ruleEngineService;

    @MockBean
    private GamificationRuleRepository ruleRepository;

    @MockBean
    private BadgeRepository badgeRepository;

    @MockBean
    private CustomerBadgeRepository customerBadgeRepository;

    @MockBean
    private CustomerTitleRepository customerTitleRepository;

    @MockBean
    private CustomerCertificateRepository customerCertificateRepository;

    @MockBean
    private MembershipLevelRepository membershipLevelRepository;

    @MockBean
    private LoyaltyPointRepository loyaltyPointRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private SystemConfigService systemConfigService;

    @Test
    public void testCalculatePoints_DefaultFormula() {
        // Mock default behavior when config value is missing
        when(systemConfigService.getConfigValue(GamificationRuleEngineService.POINTS_FORMULA_KEY)).thenReturn(null);

        int points = ruleEngineService.calculatePoints(1500000); // 1,500,000 * 0.001 = 1500
        assertEquals(1500, points);
    }

    @Test
    public void testCalculatePoints_CustomFormula() {
        // Mock custom formula: 10% order value in thousands -> #amount * 0.1 / 1000
        // Wait, rule engine uses Double parser. Let's see the formula: "#amount * 0.005"
        when(systemConfigService.getConfigValue(GamificationRuleEngineService.POINTS_FORMULA_KEY)).thenReturn("#amount * 0.005");

        int points = ruleEngineService.calculatePoints(100000); // 100,000 * 0.005 = 500
        assertEquals(500, points);
    }

    @Test
    public void testCalculatePoints_FallbackOnError() {
        // Invalid formula should fallback to default 0.1%
        when(systemConfigService.getConfigValue(GamificationRuleEngineService.POINTS_FORMULA_KEY)).thenReturn("#amount * invalid_token");

        int points = ruleEngineService.calculatePoints(100000); // 100,000 * 0.001 = 100
        assertEquals(100, points);
    }

    @Test
    public void testEvaluate_MatchCondition_AwardBadgeAndCertificate() {
        Long customerId = 1L;
        User user = new User();
        user.setId(customerId);
        user.setUsername("testuser");

        LoyaltyPoint lp = new LoyaltyPoint();
        lp.setCustomer(user);
        lp.setPointsBalance(100);
        lp.setTotalEarned(100);
        lp.setTotalOrders(10);
        lp.setTotalRevenue(10000000.0);
        lp.setLevelNumber(1);

        when(userRepository.findById(customerId)).thenReturn(Optional.of(user));
        when(loyaltyPointRepository.findByCustomerId(customerId)).thenReturn(Optional.of(lp));

        // Setup a rule that matches totalOrders >= 10
        GamificationRule rule = new GamificationRule(
                "rule_10_orders",
                "10 Orders Badge",
                "COMPLETED",
                "#totalOrders >= 10",
                50,
                "badge_pro_buyer",
                "Pro Buyer"
        );
        when(ruleRepository.findByEventTriggerAndActiveTrue("COMPLETED"))
                .thenReturn(Collections.singletonList(rule));

        // Badge Mocking
        Badge badge = new Badge("badge_pro_buyer", "Pro Buyer Badge", "Earned by completing 10 orders", "🏆", "gradient-class");
        when(badgeRepository.findById("badge_pro_buyer")).thenReturn(Optional.of(badge));

        // Not yet earned
        when(customerBadgeRepository.existsByCustomerIdAndBadgeId(customerId, "badge_pro_buyer")).thenReturn(false);
        when(customerTitleRepository.existsByCustomerIdAndTitleName(customerId, "Pro Buyer")).thenReturn(false);

        // Evaluate
        ruleEngineService.evaluate(customerId, "COMPLETED");

        // Verify points updated: 100 initial + 50 reward = 150
        assertEquals(150, lp.getPointsBalance());
        assertEquals(150, lp.getTotalEarned());

        // Verify save of CustomerBadge and CustomerTitle and CustomerCertificate
        verify(customerBadgeRepository, times(1)).save(any(CustomerBadge.class));
        verify(customerTitleRepository, times(1)).save(any(CustomerTitle.class));
        verify(customerCertificateRepository, times(1)).save(any(CustomerCertificate.class));
        verify(loyaltyPointRepository, times(1)).save(lp);
    }

    @Test
    public void testEvaluate_NoMatchCondition() {
        Long customerId = 1L;
        User user = new User();
        user.setId(customerId);

        LoyaltyPoint lp = new LoyaltyPoint();
        lp.setCustomer(user);
        lp.setPointsBalance(100);
        lp.setTotalEarned(100);
        lp.setTotalOrders(5); // less than 10
        lp.setTotalRevenue(5000000.0);
        lp.setLevelNumber(1);

        when(userRepository.findById(customerId)).thenReturn(Optional.of(user));
        when(loyaltyPointRepository.findByCustomerId(customerId)).thenReturn(Optional.of(lp));

        // Setup a rule that matches totalOrders >= 10
        GamificationRule rule = new GamificationRule(
                "rule_10_orders",
                "10 Orders Badge",
                "COMPLETED",
                "#totalOrders >= 10",
                50,
                "badge_pro_buyer",
                "Pro Buyer"
        );
        when(ruleRepository.findByEventTriggerAndActiveTrue("COMPLETED"))
                .thenReturn(Collections.singletonList(rule));

        // Evaluate
        ruleEngineService.evaluate(customerId, "COMPLETED");

        // Verify no points updated
        assertEquals(100, lp.getPointsBalance());
        assertEquals(100, lp.getTotalEarned());

        // Verify no rewards saved
        verify(customerBadgeRepository, never()).save(any(CustomerBadge.class));
        verify(customerTitleRepository, never()).save(any(CustomerTitle.class));
        verify(customerCertificateRepository, never()).save(any(CustomerCertificate.class));
    }

    @Test
    public void testEvaluate_UpdateMembershipLevel() {
        Long customerId = 1L;
        User user = new User();
        user.setId(customerId);

        LoyaltyPoint lp = new LoyaltyPoint();
        lp.setCustomer(user);
        lp.setPointsBalance(1000);
        lp.setTotalEarned(1000);
        lp.setTotalOrders(20);
        lp.setTotalRevenue(25000000.0);
        lp.setLevelNumber(1);

        when(userRepository.findById(customerId)).thenReturn(Optional.of(user));
        when(loyaltyPointRepository.findByCustomerId(customerId)).thenReturn(Optional.of(lp));

        // Set up active rules (empty for this test to focus only on level updates)
        when(ruleRepository.findByEventTriggerAndActiveTrue("PAID")).thenReturn(Collections.emptyList());

        // Set up membership levels
        List<MembershipLevel> levels = new ArrayList<>();
        levels.add(new MembershipLevel(1, "Đồng", 0, 0, 0.0));
        levels.add(new MembershipLevel(2, "Bạc", 500, 5, 5000000.0));
        levels.add(new MembershipLevel(3, "Vàng", 1000, 10, 10000000.0));
        levels.add(new MembershipLevel(4, "Kim Cương", 5000, 50, 50000000.0));

        when(membershipLevelRepository.findByActiveTrueOrderByLevelNumberAsc()).thenReturn(levels);

        // Evaluate
        ruleEngineService.evaluate(customerId, "PAID");

        // Verify level updated to 3 (Vàng) because totalEarned=1000, orders=20, revenue=25M matches min requirement of Vàng
        // but does not reach Kim Cương (requires 5000 points, 50 orders, 50M revenue)
        assertEquals(3, lp.getLevelNumber());
        verify(loyaltyPointRepository, times(1)).save(lp);
    }
}
