package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.OrderRequest;
import com.anhtin.tmdt.backend.dto.request.OrderItemRequest;
import com.anhtin.tmdt.backend.entity.*;
import com.anhtin.tmdt.backend.repository.*;
import com.anhtin.tmdt.backend.service.AgencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
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
    private AgencyCustomerAssignmentRepository agencyCustomerAssignmentRepository;

    @Autowired
    private PromotionService promotionService;

    @Autowired
    private LoyaltyService loyaltyService;

    @Autowired
    private CommissionService commissionService;

    @Autowired
    private PriceListService priceListService;

    @Autowired
    private AgencyService agencyService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Order createOrder(@NonNull Long customerId, OrderRequest request) {
        Long agencyId = request.getAgencyId();
        if (agencyId == null) {
            throw new RuntimeException("Agency ID is required");
        }

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        Long customerIdSelected = request.getCustomerId();
        User receiver = null;
        Long priceListId = null;
        String receiverType = "AGENCY";

        if (customerIdSelected != null) {
            if (!agencyCustomerAssignmentRepository.existsByAgencyIdAndCustomerId(agencyId, customerIdSelected)) {
                throw new RuntimeException("Customer does not belong to this agency");
            }
            receiver = userRepository.findById(customerIdSelected)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(customerIdSelected, agencyId).getId();
        } else if (request.getNewCustomerInfo() != null) {
            receiver = createNewCustomer(request.getNewCustomerInfo(), agencyId);
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(receiver.getId(), agencyId).getId();
        } else {
            receiver = agency.getUser();
            priceListId = priceListService.resolveForAgency(agencyId).getId();
        }

        Order order = new Order();
        order.setCustomer(receiver);
        order.setAgency(agency);
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : receiver.getShippingAddress());
        order.setPriceListId(priceListId);
        order.setReceiverType(receiverType);

        OrderType orderType = request.getOrderType() != null
                ? OrderType.valueOf(request.getOrderType())
                : OrderType.DROPSHIP;
        order.setOrderType(orderType);

        double totalAmount = 0.0;

        for (OrderItemRequest itemReq : request.getItems()) {
            Long productId = itemReq.getProductId();
            if (productId == null) throw new RuntimeException("Product ID is required");
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Double price = priceListService.getResolvedPrice(productId, agencyId, customerIdSelected);
            if (price == null || price < 0) {
                price = product.getBasePrice();
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(price);
            orderItem.setPriceListId(priceListId);
            order.getItems().add(orderItem);

            totalAmount += price * itemReq.getQuantity();

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);
        }

        double discountAmount = 0.0;

        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            discountAmount = promotionService.validateAndCalculateDiscount(
                    request.getPromotionCode(), totalAmount);
            order.setPromotionCode(request.getPromotionCode().toUpperCase());
            promotionService.incrementUsage(request.getPromotionCode());
        }

        if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0) {
            double pointDiscount = loyaltyService.redeemPoints(receiver.getId(), request.getPointsToRedeem(), order);
            discountAmount += pointDiscount;
            order.setPointsRedeemed(request.getPointsToRedeem());
        }

        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(Math.max(0, totalAmount - discountAmount));

        Order savedOrder = orderRepository.save(order);

        commissionService.createTransaction(savedOrder);

        return savedOrder;
    }

    @Transactional
    public Order createOrderByEmployee(Long createdByUserId, OrderRequest request) {
        Long agencyId = request.getAgencyId();
        if (agencyId == null) {
            throw new RuntimeException("Agency ID is required");
        }

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        Long customerIdSelected = request.getCustomerId();
        User receiver = null;
        Long priceListId = null;
        String receiverType = "AGENCY";

        if (customerIdSelected != null) {
            if (!agencyCustomerAssignmentRepository.existsByAgencyIdAndCustomerId(agencyId, customerIdSelected)) {
                throw new RuntimeException("Customer does not belong to this agency");
            }
            receiver = userRepository.findById(customerIdSelected)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(customerIdSelected, agencyId).getId();
        } else if (request.getNewCustomerInfo() != null) {
            receiver = createNewCustomer(request.getNewCustomerInfo(), agencyId);
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(receiver.getId(), agencyId).getId();
        } else {
            receiver = agency.getUser();
            priceListId = priceListService.resolveForAgency(agencyId).getId();
        }

        User createdByUser = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setCustomer(receiver);
        order.setAgency(agency);
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : receiver.getShippingAddress());
        order.setPriceListId(priceListId);
        order.setReceiverType(receiverType);

        OrderType orderType = request.getOrderType() != null
                ? OrderType.valueOf(request.getOrderType())
                : OrderType.DROPSHIP;
        order.setOrderType(orderType);

        double totalAmount = 0.0;

        for (OrderItemRequest itemReq : request.getItems()) {
            Long productId = itemReq.getProductId();
            if (productId == null) throw new RuntimeException("Product ID is required");
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Double price = priceListService.getResolvedPrice(productId, agencyId, customerIdSelected);
            if (price == null || price < 0) {
                price = product.getBasePrice();
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(price);
            orderItem.setPriceListId(priceListId);
            order.getItems().add(orderItem);

            totalAmount += price * itemReq.getQuantity();

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);
        }

        double discountAmount = 0.0;

        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            discountAmount = promotionService.validateAndCalculateDiscount(
                    request.getPromotionCode(), totalAmount);
            order.setPromotionCode(request.getPromotionCode().toUpperCase());
            promotionService.incrementUsage(request.getPromotionCode());
        }

        if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0) {
            double pointDiscount = loyaltyService.redeemPoints(receiver.getId(), request.getPointsToRedeem(), order);
            discountAmount += pointDiscount;
            order.setPointsRedeemed(request.getPointsToRedeem());
        }

        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(Math.max(0, totalAmount - discountAmount));

        Order savedOrder = orderRepository.save(order);

        commissionService.createTransaction(savedOrder);

        return savedOrder;
    }

    @Transactional
    public Order createOrderByAgency(Long userId, OrderRequest request) {
        com.anhtin.tmdt.backend.dto.response.AgencyDTO agencyDTO = agencyService.getAgencyByUserId(userId);
        Long agencyId = agencyDTO.getId();

        if (request.getAgencyId() != null && !request.getAgencyId().equals(agencyId)) {
            throw new RuntimeException("You can only create orders for your own agency");
        }

        request.setAgencyId(agencyId);

        if (agencyId == null) {
            throw new RuntimeException("Agency ID is required");
        }

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Agency not found"));

        Long customerIdSelected = request.getCustomerId();
        User receiver = null;
        Long priceListId = null;
        String receiverType = "AGENCY";

        if (customerIdSelected != null) {
            if (!agencyCustomerAssignmentRepository.existsByAgencyIdAndCustomerId(agencyId, customerIdSelected)) {
                throw new RuntimeException("Customer does not belong to this agency");
            }
            receiver = userRepository.findById(customerIdSelected)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(customerIdSelected, agencyId).getId();
        } else if (request.getNewCustomerInfo() != null) {
            receiver = createNewCustomer(request.getNewCustomerInfo(), agencyId);
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(receiver.getId(), agencyId).getId();
        } else {
            receiver = agency.getUser();
            priceListId = priceListService.resolveForAgency(agencyId).getId();
        }

        Order order = new Order();
        order.setCustomer(receiver);
        order.setAgency(agency);
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : receiver.getShippingAddress());
        order.setPriceListId(priceListId);
        order.setReceiverType(receiverType);

        OrderType orderType = request.getOrderType() != null
                ? OrderType.valueOf(request.getOrderType())
                : OrderType.DROPSHIP;
        order.setOrderType(orderType);

        double totalAmount = 0.0;

        for (OrderItemRequest itemReq : request.getItems()) {
            Long productId = itemReq.getProductId();
            if (productId == null) throw new RuntimeException("Product ID is required");
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Double price = priceListService.getResolvedPrice(productId, agencyId, customerIdSelected);
            if (price == null || price < 0) {
                price = product.getBasePrice();
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setPrice(price);
            orderItem.setPriceListId(priceListId);
            order.getItems().add(orderItem);

            totalAmount += price * itemReq.getQuantity();

            if (product.getStockQuantity() < itemReq.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - itemReq.getQuantity());
            productRepository.save(product);
        }

        double discountAmount = 0.0;

        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            discountAmount = promotionService.validateAndCalculateDiscount(
                    request.getPromotionCode(), totalAmount);
            order.setPromotionCode(request.getPromotionCode().toUpperCase());
            promotionService.incrementUsage(request.getPromotionCode());
        }

        if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0) {
            double pointDiscount = loyaltyService.redeemPoints(receiver.getId(), request.getPointsToRedeem(), order);
            discountAmount += pointDiscount;
            order.setPointsRedeemed(request.getPointsToRedeem());
        }

        order.setDiscountAmount(discountAmount);
        order.setTotalAmount(Math.max(0, totalAmount - discountAmount));

        Order savedOrder = orderRepository.save(order);

        commissionService.createTransaction(savedOrder);

        return savedOrder;
    }

    private User createNewCustomer(OrderRequest.NewCustomerInfo newCustomerInfo, Long agencyId) {
        String username = "KH_" + System.currentTimeMillis();
        String phone = newCustomerInfo.getPhone();
        String email = username + "@temp.local";

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode("Temp@123"));
        newUser.setPhone(phone);
        newUser.setOrganizationName(newCustomerInfo.getName());
        newUser.setShippingAddress(newCustomerInfo.getShippingAddress());
        newUser.setBillingAddress(newCustomerInfo.getInvoiceAddress());
        newUser.setTaxCode(newCustomerInfo.getInvoiceTaxCode());
        newUser.setRole(Role.CUSTOMER);
        newUser.setActive(false);
        User savedUser = userRepository.save(newUser);

        AgencyCustomerAssignment assignment = new AgencyCustomerAssignment();
        assignment.setCustomer(savedUser);
        assignment.setAgency(agencyRepository.getReferenceById(agencyId));
        assignment.setCustomName(newCustomerInfo.getName());
        assignment.setCustomShippingAddress(newCustomerInfo.getShippingAddress());
        assignment.setCustomPhone(phone);
        assignment.setApproved(false);
        agencyCustomerAssignmentRepository.save(assignment);

        return savedUser;
    }
}