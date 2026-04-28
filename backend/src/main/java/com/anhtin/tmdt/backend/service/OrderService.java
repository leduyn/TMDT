package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.OrderRequest;
import com.anhtin.tmdt.backend.dto.request.OrderItemRequest;
import com.anhtin.tmdt.backend.entity.*;
import com.anhtin.tmdt.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private PromotionService promotionService;

    @Autowired
    private LoyaltyService loyaltyService;

    @Autowired
    private CommissionService commissionService;

    @Transactional
    public Order createOrder(@NonNull Long customerId, OrderRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        Order order = new Order();
        order.setCustomer(customer);
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress());

        // Xác định loại đơn (DROPSHIP nếu có agency, mặc định MARKETPLACE)
            Long agencyId = request.getAgencyId();
            if (agencyId != null) {
                Optional<Agency> agencyOpt = agencyRepository.findById(agencyId);
                agencyOpt.ifPresent(order::setAgency);
            }

        // Mặc định: nếu có agency thì check xem là dropship hay marketplace
        OrderType orderType = request.getOrderType() != null
                ? OrderType.valueOf(request.getOrderType())
                : (order.getAgency() != null ? OrderType.DROPSHIP : OrderType.MARKETPLACE);
        order.setOrderType(orderType);

        double totalAmount = 0.0;

        for (OrderItemRequest itemReq : request.getItems()) {
            Long productId = itemReq.getProductId();
            if (productId == null) throw new RuntimeException("Product ID is required");
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            
            // Lấy giá phù hợp (cơ bản hoặc dropship)
            double price = order.getAgency() != null && product.isDropship() 
                    ? product.getDropshipPrice() 
                    : product.getBasePrice();
            
            orderItem.setPrice(price);
            order.getItems().add(orderItem);

            totalAmount += price * itemReq.getQuantity();
            
            // Trừ stock
            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);
        }

        // === Áp dụng Mã Giảm Giá (nếu có) ===
        double discountAmount = 0.0;

        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            discountAmount = promotionService.validateAndCalculateDiscount(
                    request.getPromotionCode(), totalAmount);
            order.setPromotionCode(request.getPromotionCode().toUpperCase());
            promotionService.incrementUsage(request.getPromotionCode());
        }

        // === Đối trừ Điểm Tích Lũy (nếu có) ===
        if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0) {
            double pointDiscount = loyaltyService.redeemPoints(customerId, request.getPointsToRedeem(), order);
            discountAmount += pointDiscount;
            order.setPointsRedeemed(request.getPointsToRedeem());
        }

        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(Math.max(0, totalAmount - discountAmount));

        Order savedOrder = orderRepository.save(order);

        // === Tạo Transaction đối soát ===
        commissionService.createTransaction(savedOrder);

        return savedOrder;
    }
}
