package com.anhtin.tmdt.backend.modules.dashboard.dto;

import java.util.List;
import java.util.Map;

public class DashboardDTO {
    private String role;
    private Stats stats;
    private List<RecentOrder> recentOrders;
    private List<StatusCount> orderStatusCounts;

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public Stats getStats() { return stats; }
    public void setStats(Stats stats) { this.stats = stats; }
    public List<RecentOrder> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<RecentOrder> recentOrders) { this.recentOrders = recentOrders; }
    public List<StatusCount> getOrderStatusCounts() { return orderStatusCounts; }
    public void setOrderStatusCounts(List<StatusCount> orderStatusCounts) { this.orderStatusCounts = orderStatusCounts; }

    public static class Stats {
        private long totalOrders;
        private double totalRevenue;
        private long totalProducts;
        private long totalAgencies;
        private long totalCustomers;
        private int loyaltyPoints;
        private double averageRating;

        public long getTotalOrders() { return totalOrders; }
        public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }
        public double getTotalRevenue() { return totalRevenue; }
        public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
        public long getTotalProducts() { return totalProducts; }
        public void setTotalProducts(long totalProducts) { this.totalProducts = totalProducts; }
        public long getTotalAgencies() { return totalAgencies; }
        public void setTotalAgencies(long totalAgencies) { this.totalAgencies = totalAgencies; }
        public long getTotalCustomers() { return totalCustomers; }
        public void setTotalCustomers(long totalCustomers) { this.totalCustomers = totalCustomers; }
        public int getLoyaltyPoints() { return loyaltyPoints; }
        public void setLoyaltyPoints(int loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }
        public double getAverageRating() { return averageRating; }
        public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
    }

    public static class RecentOrder {
        private Long id;
        private String customerName;
        private Double totalAmount;
        private String status;
        private String orderDate;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }
        public Double getTotalAmount() { return totalAmount; }
        public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getOrderDate() { return orderDate; }
        public void setOrderDate(String orderDate) { this.orderDate = orderDate; }
    }

    public static class StatusCount {
        private String status;
        private long count;

        public StatusCount() {}
        public StatusCount(String status, long count) { this.status = status; this.count = count; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
}
