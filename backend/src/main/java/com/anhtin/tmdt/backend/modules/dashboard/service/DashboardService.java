package com.anhtin.tmdt.backend.modules.dashboard.service;

import com.anhtin.tmdt.backend.modules.dashboard.dto.DashboardDTO;
import com.anhtin.tmdt.backend.modules.dashboard.dto.DashboardDTO.RecentOrder;
import com.anhtin.tmdt.backend.modules.dashboard.dto.DashboardDTO.Stats;
import com.anhtin.tmdt.backend.modules.dashboard.dto.DashboardDTO.StatusCount;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.order.repository.OrderRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyProductRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyReviewRepository;
import com.anhtin.tmdt.backend.modules.loyalty.repository.LoyaltyPointRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private AgencyProductRepository agencyProductRepository;

    @Autowired
    private AgencyReviewRepository agencyReviewRepository;

    @Autowired
    private LoyaltyPointRepository loyaltyPointRepository;

    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public DashboardDTO getCompanyDashboard() {
        DashboardDTO dto = new DashboardDTO();
        dto.setRole("COMPANY");

        Stats stats = new Stats();
        stats.setTotalOrders(orderRepository.count());
        stats.setTotalRevenue(orderRepository.sumTotalAmountByStatusCompleted());
        stats.setTotalProducts(productRepository.count());
        stats.setTotalAgencies(agencyRepository.count());
        stats.setTotalCustomers(userRepository.countByRole(Role.CUSTOMER));
        dto.setStats(stats);

        List<Order> recentOrders = orderRepository.findTop5ByOrderByOrderDateDesc();
        dto.setRecentOrders(mapOrders(recentOrders));

        List<Object[]> statusCounts = orderRepository.countByStatusGrouped();
        dto.setOrderStatusCounts(mapStatusCounts(statusCounts));

        return dto;
    }

    public DashboardDTO getAgencyDashboard(Long agencyId) {
        DashboardDTO dto = new DashboardDTO();
        dto.setRole("AGENCY");

        Stats stats = new Stats();
        stats.setTotalOrders(orderRepository.countByAgencyId(agencyId));
        stats.setTotalRevenue(orderRepository.sumTotalAmountByAgencyIdAndStatusCompleted(agencyId));
        stats.setTotalProducts(agencyProductRepository.findByAgencyId(agencyId).size());
        stats.setAverageRating(agencyReviewRepository.getAverageRatingByAgencyId(agencyId));
        dto.setStats(stats);

        List<Order> recentOrders = orderRepository.findTop5ByAgencyIdOrderByOrderDateDesc(agencyId);
        dto.setRecentOrders(mapOrders(recentOrders));

        List<Object[]> statusCounts = orderRepository.countByStatusGrouped();
        dto.setOrderStatusCounts(mapStatusCounts(statusCounts));

        return dto;
    }

    public DashboardDTO getCustomerDashboard(Long customerId) {
        DashboardDTO dto = new DashboardDTO();
        dto.setRole("CUSTOMER");

        Stats stats = new Stats();
        stats.setTotalOrders(orderRepository.countByCustomerId(customerId));
        stats.setTotalRevenue(orderRepository.sumTotalAmountByCustomerIdAndStatusCompleted(customerId));
        loyaltyPointRepository.findByCustomerId(customerId)
            .ifPresent(lp -> stats.setLoyaltyPoints(lp.getPointsBalance()));
        dto.setStats(stats);

        List<Order> recentOrders = orderRepository.findTop5ByCustomerIdOrderByOrderDateDesc(customerId);
        dto.setRecentOrders(mapOrders(recentOrders));

        return dto;
    }

    private List<RecentOrder> mapOrders(List<Order> orders) {
        return orders.stream().map(o -> {
            RecentOrder ro = new RecentOrder();
            ro.setId(o.getId());
            ro.setCustomerName(o.getCustomer() != null ? (o.getCustomer().getOrganizationName() != null ? o.getCustomer().getOrganizationName() : "N/A") : "N/A");
            ro.setTotalAmount(o.getTotalAmount());
            ro.setStatus(o.getStatus());
            ro.setOrderDate(o.getOrderDate() != null ? o.getOrderDate().format(DTF) : "");
            return ro;
        }).collect(Collectors.toList());
    }

    private List<StatusCount> mapStatusCounts(List<Object[]> raw) {
        List<StatusCount> result = new ArrayList<>();
        if (raw != null) {
            for (Object[] row : raw) {
                result.add(new StatusCount((String) row[0], (long) row[1]));
            }
        }
        return result;
    }
}
