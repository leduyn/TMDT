package com.anhtin.tmdt.backend.modules.loyalty.service;

import com.anhtin.tmdt.backend.modules.common.dto.LoyaltyPointDTO;
import com.anhtin.tmdt.backend.modules.loyalty.dto.*;
import com.anhtin.tmdt.backend.modules.loyalty.entity.*;
import com.anhtin.tmdt.backend.modules.loyalty.repository.*;
import com.anhtin.tmdt.backend.modules.customer.entity.Customer;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
public class LoyaltyServiceTest {

    @Autowired
    private LoyaltyService loyaltyService;

    @MockBean
    private LoyaltyPointRepository loyaltyPointRepository;

    @MockBean
    private PointTransactionRepository pointTransactionRepository;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private GamificationRuleEngineService ruleEngineService;

    @MockBean
    private CustomerBadgeRepository customerBadgeRepository;

    @MockBean
    private CustomerTitleRepository customerTitleRepository;

    @MockBean
    private CustomerCertificateRepository customerCertificateRepository;

    @MockBean
    private MembershipLevelRepository membershipLevelRepository;

    @Test
    public void testGetBalance() {
        Long customerId = 1L;
        User user = new User();
        user.setId(customerId);

        LoyaltyPoint lp = new LoyaltyPoint();
        lp.setCustomer(user);
        lp.setPointsBalance(120);
        lp.setTotalEarned(350);

        when(loyaltyPointRepository.findByCustomerId(customerId)).thenReturn(Optional.of(lp));

        LoyaltyPointDTO balance = loyaltyService.getBalance(customerId);
        assertNotNull(balance);
        assertEquals(120, balance.getPointsBalance());
        assertEquals(350, balance.getTotalEarned());
    }

    @Test
    public void testGetHistory() {
        Long customerId = 1L;
        Pageable pageable = PageRequest.of(0, 10);
        PointTransaction transaction = new PointTransaction();
        Page<PointTransaction> page = new PageImpl<>(Collections.singletonList(transaction));

        when(pointTransactionRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, pageable)).thenReturn(page);

        Page<PointTransaction> result = loyaltyService.getHistory(customerId, pageable);
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    public void testEarnPoints() {
        Long customerId = 1L;
        User user = new User();
        user.setId(customerId);
        user.setUsername("testcustomer");

        Customer customer = new Customer();
        customer.setOrganizationName("Test Customer");

        Order order = new Order();
        order.setId(100L);
        order.setCustomer(customer);
        order.setTotalAmount(2000000.0);

        LoyaltyPoint lp = new LoyaltyPoint();
        lp.setCustomer(user);
        lp.setPointsBalance(100);
        lp.setTotalEarned(100);
        lp.setTotalOrders(2);
        lp.setTotalRevenue(5000000.0);

        when(loyaltyPointRepository.findByCustomerId(customerId)).thenReturn(Optional.of(lp));
        when(ruleEngineService.calculatePoints(2000000.0)).thenReturn(2000);

        // Act
        loyaltyService.earnPoints(customerId, order);

        // Assert updates
        assertEquals(2100, lp.getPointsBalance());
        assertEquals(2100, lp.getTotalEarned());
        assertEquals(3, lp.getTotalOrders());
        assertEquals(7000000.0, lp.getTotalRevenue());

        verify(loyaltyPointRepository, times(1)).save(lp);
        verify(pointTransactionRepository, times(1)).save(any(PointTransaction.class));
        verify(ruleEngineService, times(1)).evaluate(customerId, "PAID");
    }

    @Test
    public void testOnOrderCompleted() {
        Long customerId = 1L;

        loyaltyService.onOrderCompleted(customerId);

        verify(ruleEngineService, times(1)).evaluate(customerId, "COMPLETED");
    }

    @Test
    public void testRedeemPoints_Success() {
        Long customerId = 1L;
        User user = new User();
        user.setId(customerId);

        Customer customer = new Customer();
        customer.setOrganizationName("Test Customer");

        Order order = new Order();
        order.setId(100L);
        order.setCustomer(customer);

        LoyaltyPoint lp = new LoyaltyPoint();
        lp.setCustomer(user);
        lp.setPointsBalance(500);

        when(loyaltyPointRepository.findByCustomerId(customerId)).thenReturn(Optional.of(lp));

        double discount = loyaltyService.redeemPoints(customerId, 200, order);

        assertEquals(300, lp.getPointsBalance());
        assertEquals(200000.0, discount); // 200 * 1000.0 = 200,000

        verify(loyaltyPointRepository, times(1)).save(lp);
        verify(pointTransactionRepository, times(1)).save(any(PointTransaction.class));
    }

    @Test
    public void testRedeemPoints_InsufficientPoints() {
        Long customerId = 1L;
        User user = new User();
        user.setId(customerId);

        Customer customer = new Customer();
        customer.setOrganizationName("Test Customer");

        Order order = new Order();
        order.setId(100L);
        order.setCustomer(customer);

        LoyaltyPoint lp = new LoyaltyPoint();
        lp.setCustomer(user);
        lp.setPointsBalance(100);

        when(loyaltyPointRepository.findByCustomerId(customerId)).thenReturn(Optional.of(lp));

        assertThrows(RuntimeException.class, () -> {
            loyaltyService.redeemPoints(customerId, 200, order);
        });

        verify(loyaltyPointRepository, never()).save(any(LoyaltyPoint.class));
        verify(pointTransactionRepository, never()).save(any(PointTransaction.class));
    }

    @Test
    public void testGetProfile() {
        Long customerId = 1L;
        User user = new User();
        user.setId(customerId);
        user.setUsername("testuser");

        LoyaltyPoint lp = new LoyaltyPoint();
        lp.setCustomer(user);
        lp.setPointsBalance(1500);
        lp.setTotalEarned(2000);
        lp.setLevelNumber(2);
        lp.setTotalOrders(12);
        lp.setTotalRevenue(15000000.0);

        when(userRepository.findById(customerId)).thenReturn(Optional.of(user));
        when(loyaltyPointRepository.findByCustomerId(customerId)).thenReturn(Optional.of(lp));

        // MembershipLevel mocking
        MembershipLevel currentLevel = new MembershipLevel(2, "Bạc", 500, 5, 5000000.0);
        MembershipLevel nextLevel = new MembershipLevel(3, "Vàng", 3000, 20, 25000000.0);
        when(membershipLevelRepository.findByLevelNumber(2)).thenReturn(Optional.of(currentLevel));
        when(membershipLevelRepository.findByActiveTrueOrderByLevelNumberAsc())
                .thenReturn(Arrays.asList(new MembershipLevel(1, "Đồng", 0, 0, 0.0), currentLevel, nextLevel));

        // Badge mocking
        Badge badge = new Badge("badge_pro", "Huy hiệu VIP", "Mô tả", "👑", "gradient");
        CustomerBadge cb = new CustomerBadge(user, badge);
        when(customerBadgeRepository.findByCustomerId(customerId)).thenReturn(Collections.singletonList(cb));

        // Title mocking
        CustomerTitle title = new CustomerTitle(user, "Chiến Binh");
        when(customerTitleRepository.findByCustomerId(customerId)).thenReturn(Collections.singletonList(title));

        // Certificate mocking
        CustomerCertificate cert = new CustomerCertificate(user, "Bằng Khen Danh Dự", "Đã đạt cấp Bạc");
        when(customerCertificateRepository.findByCustomerIdOrderByEarnedAtDesc(customerId))
                .thenReturn(Collections.singletonList(cert));

        // Act
        GamificationProfileDTO profile = loyaltyService.getProfile(customerId);

        // Assert
        assertNotNull(profile);
        assertEquals("testuser", profile.getCustomerName());
        assertEquals("Bạc", profile.getLevelName());
        assertEquals("Vàng", profile.getNextLevelName());
        assertEquals(3000, profile.getNextLevelMinPoints());
        assertEquals(1, profile.getEarnedBadges().size());
        assertEquals("Huy hiệu VIP", profile.getEarnedBadges().get(0).getName());
    }

    @Test
    public void testGetLeaderboard() {
        Long customerId1 = 1L;
        User user1 = new User();
        user1.setId(customerId1);
        user1.setUsername("user1");

        Long customerId2 = 2L;
        User user2 = new User();
        user2.setId(customerId2);
        user2.setUsername("user2");

        LoyaltyPoint lp1 = new LoyaltyPoint();
        lp1.setCustomer(user1);
        lp1.setPointsBalance(1000);
        lp1.setTotalEarned(1000);
        lp1.setLevelNumber(2);

        LoyaltyPoint lp2 = new LoyaltyPoint();
        lp2.setCustomer(user2);
        lp2.setPointsBalance(500);
        lp2.setTotalEarned(500);
        lp2.setLevelNumber(1);

        // Page mock of loyaltyPointRepository.findAll
        Page<LoyaltyPoint> page = new PageImpl<>(Arrays.asList(lp1, lp2));
        when(loyaltyPointRepository.findAll(any(PageRequest.class))).thenReturn(page);

        // MembershipLevel mock
        MembershipLevel lvl1 = new MembershipLevel(1, "Đồng", 0, 0, 0.0);
        MembershipLevel lvl2 = new MembershipLevel(2, "Bạc", 500, 5, 5000000.0);
        when(membershipLevelRepository.findByActiveTrueOrderByLevelNumberAsc()).thenReturn(Arrays.asList(lvl1, lvl2));

        // Badges mock
        Badge badge = new Badge("badge_pro", "Huy hiệu VIP", "Mô tả", "👑", "gradient");
        CustomerBadge cb = new CustomerBadge(user1, badge);
        when(customerBadgeRepository.findByCustomerId(customerId1)).thenReturn(Collections.singletonList(cb));
        when(customerBadgeRepository.findByCustomerId(customerId2)).thenReturn(Collections.emptyList());

        // Titles mock
        CustomerTitle title = new CustomerTitle(user1, "Chiến Binh");
        when(customerTitleRepository.findByCustomerId(customerId1)).thenReturn(Collections.singletonList(title));
        when(customerTitleRepository.findByCustomerId(customerId2)).thenReturn(Collections.emptyList());

        // Act
        List<LeaderboardEntryDTO> leaderboard = loyaltyService.getLeaderboard(10);

        // Assert
        assertNotNull(leaderboard);
        assertEquals(2, leaderboard.size());
        assertEquals("user1", leaderboard.get(0).getCustomerName());
        assertEquals("user2", leaderboard.get(1).getCustomerName());
        assertEquals("Bạc", leaderboard.get(0).getLevelName());
        assertEquals("Đồng", leaderboard.get(1).getLevelName());
        assertEquals("👑 Huy hiệu VIP", leaderboard.get(0).getBadges().get(0));
    }
}
