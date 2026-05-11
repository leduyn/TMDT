package com.anhtin.tmdt.backend.service;

import com.anhtin.tmdt.backend.dto.request.OrderRequest;
import com.anhtin.tmdt.backend.dto.request.OrderItemRequest;
import com.anhtin.tmdt.backend.dto.response.OrderDTO;
import com.anhtin.tmdt.backend.dto.response.OrderItemDTO;
import com.anhtin.tmdt.backend.entity.*;
import com.anhtin.tmdt.backend.repository.*;
import com.anhtin.tmdt.backend.credit.service.CreditService;
import com.anhtin.tmdt.backend.credit.service.AgencyDebtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
    private CreditService creditService;

    @Autowired
    private AgencyDebtService agencyDebtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public Order createOrder(Long customerId, Long createdByUserId, OrderRequest request) {
        if (createdByUserId == null) throw new RuntimeException("Creator ID is required");
        User creator = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("Creator user not found"));
        Long agencyId = request.getAgencyId();
        
        if (agencyId == null) {
            // Try to find the agency assigned to this customer
            agencyId = agencyCustomerAssignmentRepository.findByCustomerId(customerId).stream()
                    .findFirst()
                    .map(a -> a.getAgency().getId())
                    .orElse(null);
        }

        if (agencyId == null) {
            throw new RuntimeException("Agency ID is required. Please select an agency.");
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
        order.setCreatedBy(creator);
        order.setUpdatedDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : receiver.getShippingAddress());
        order.setPriceListId(priceListId);
        order.setReceiverType(receiverType);
        order.setDebtTermDays(request.getDebtTermDays());

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
        order.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 0.0);
        order.setTotalAmount(Math.max(0, totalAmount - discountAmount) + order.getDeliveryFee());

        Order savedOrder = orderRepository.save(order);

        commissionService.createTransaction(savedOrder);

        // Trừ hạn mức tín dụng của đại lý
        try {
            creditService.createCreditOrder(agencyId, savedOrder.getId(), savedOrder.getTotalAmount());
        } catch (Exception e) {
            throw new RuntimeException("Hạn mức tín dụng không đủ: " + e.getMessage());
        }

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
        order.setCreatedBy(createdByUser);
        order.setUpdatedDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : receiver.getShippingAddress());
        order.setPriceListId(priceListId);
        order.setReceiverType(receiverType);
        order.setDebtTermDays(request.getDebtTermDays());

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
        order.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 0.0);
        order.setTotalAmount(Math.max(0, totalAmount - discountAmount) + order.getDeliveryFee());

        Order savedOrder = orderRepository.save(order);

        commissionService.createTransaction(savedOrder);

        // Trừ hạn mức tín dụng của đại lý
        try {
            creditService.createCreditOrder(agencyId, savedOrder.getId(), savedOrder.getTotalAmount());
        } catch (Exception e) {
            throw new RuntimeException("Hạn mức tín dụng không đủ: " + e.getMessage());
        }

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

        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Creator user not found"));

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
        order.setCreatedBy(creator);
        order.setUpdatedDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : receiver.getShippingAddress());
        order.setPriceListId(priceListId);
        order.setReceiverType(receiverType);
        order.setDebtTermDays(request.getDebtTermDays());

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
        order.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 0.0);
        order.setTotalAmount(Math.max(0, totalAmount - discountAmount) + order.getDeliveryFee());

        Order savedOrder = orderRepository.save(order);

        commissionService.createTransaction(savedOrder);

        // Trừ hạn mức tín dụng của đại lý
        try {
            creditService.createCreditOrder(agencyId, savedOrder.getId(), savedOrder.getTotalAmount());
        } catch (Exception e) {
            throw new RuntimeException("Hạn mức tín dụng không đủ: " + e.getMessage());
        }

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

    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByAgency(Long agencyId) {
        return orderRepository.findByAgencyId(agencyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        String oldStatus = order.getStatus();
        order.setStatus(status);
        order.setUpdatedDate(LocalDateTime.now());
        
        Order savedOrder = orderRepository.save(order);
        
        // Khi đơn hàng có trạng thái hoàn thành thì cập nhật dư nợ
        if ("COMPLETED".equalsIgnoreCase(status) && !"COMPLETED".equalsIgnoreCase(oldStatus)) {
            // Cập nhật dư nợ cho khách hàng (nếu có assignment)
            if (order.getCustomer() != null && order.getAgency() != null) {
                agencyCustomerAssignmentRepository.findByAgencyIdAndCustomerId(
                        order.getAgency().getId(), order.getCustomer().getId())
                    .ifPresent(assignment -> {
                        assignment.setTotalDebt(assignment.getTotalDebt() + order.getTotalAmount());
                        agencyCustomerAssignmentRepository.save(assignment);
                    });
            }
            // Sinh 2 dòng công nợ Đại lý
            agencyDebtService.createDebtsForOrder(savedOrder);
        }
        
        return convertToDTO(savedOrder);
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setCustomerId(order.getCustomer().getId());
        dto.setCustomerName(order.getCustomer().getOrganizationName() != null ? 
                order.getCustomer().getOrganizationName() : order.getCustomer().getUsername());
        
        if (order.getAgency() != null) {
            dto.setAgencyId(order.getAgency().getId());
            dto.setAgencyName(order.getAgency().getName());
        }
        
        dto.setTotalAmount(order.getTotalAmount());
        dto.setDiscountAmount(order.getDiscountAmount());
        dto.setDeliveryFee(order.getDeliveryFee());
        dto.setStatus(order.getStatus());
        dto.setOrderType(order.getOrderType() != null ? order.getOrderType().name() : null);
        dto.setShippingAddress(order.getShippingAddress());
        dto.setPromotionCode(order.getPromotionCode());
        dto.setPointsRedeemed(order.getPointsRedeemed());
        dto.setOrderDate(order.getOrderDate());
        dto.setPriceListId(order.getPriceListId());
        dto.setReceiverType(order.getReceiverType());
        dto.setDebtTermDays(order.getDebtTermDays());
        
        if (order.getCreatedBy() != null) {
            dto.setCreatedByName(order.getCreatedBy().getOrganizationName() != null ? 
                    order.getCreatedBy().getOrganizationName() : order.getCreatedBy().getUsername());
        }
        dto.setUpdatedDate(order.getUpdatedDate());
        
        dto.setItems(order.getItems().stream()
                .map(this::convertToItemDTO)
                .collect(Collectors.toList()));
        
        return dto;
    }

    private OrderItemDTO convertToItemDTO(OrderItem item) {
        OrderItemDTO dto = new OrderItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setProductImageUrl(item.getProduct().getImageUrl());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());
        return dto;
    }

}