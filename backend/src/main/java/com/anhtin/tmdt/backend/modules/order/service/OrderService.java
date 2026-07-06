package com.anhtin.tmdt.backend.modules.order.service;

import com.anhtin.tmdt.backend.modules.order.dto.OrderRequest;
import com.anhtin.tmdt.backend.modules.order.dto.OrderItemRequest;
import com.anhtin.tmdt.backend.modules.order.dto.OrderDTO;
import com.anhtin.tmdt.backend.modules.order.dto.OrderItemDTO;
import com.anhtin.tmdt.backend.modules.credit.service.CreditService;
import com.anhtin.tmdt.backend.modules.credit.service.AgencyDebtService;
import com.anhtin.tmdt.backend.modules.customer.entity.Customer;
import com.anhtin.tmdt.backend.modules.customer.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyCustomerAssignmentRepository;
import com.anhtin.tmdt.backend.modules.agency.service.AgencyService;
import com.anhtin.tmdt.backend.modules.order.entity.Order;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyCustomerAssignment;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.price.service.PriceListService;
import com.anhtin.tmdt.backend.modules.order.entity.OrderType;
import com.anhtin.tmdt.backend.modules.agency.dto.AgencyDTO;
import com.anhtin.tmdt.backend.modules.user.entity.Role;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.order.entity.OrderItem;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.loyalty.service.LoyaltyService;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyType;
import com.anhtin.tmdt.backend.modules.promotion.service.PromotionService;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import com.anhtin.tmdt.backend.modules.price.service.CommissionService;
import com.anhtin.tmdt.backend.modules.order.repository.OrderRepository;
import com.anhtin.tmdt.backend.modules.salespolicy.service.SalesPolicyService;
import com.anhtin.tmdt.backend.modules.salespolicy.entity.SalesPolicyTier;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SalesPolicyService salesPolicyService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private AgencyCustomerAssignmentRepository agencyCustomerAssignmentRepository;

    @Autowired
    private CustomerRepository customerRepository;

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
        Customer orderCustomer = null;
        Long priceListId = null;
        String receiverType = "AGENCY";

        if (customerIdSelected != null) {
            Customer selectedCustomer = customerRepository.findById(customerIdSelected)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            if (!agencyCustomerAssignmentRepository.existsByAgencyIdAndCustomerId(agencyId, customerIdSelected)) {
                AgencyCustomerAssignment assignment = new AgencyCustomerAssignment();
                assignment.setCustomer(selectedCustomer);
                assignment.setAgency(agency);
                assignment.setCustomName(selectedCustomer.getOrganizationName() != null ?
                        selectedCustomer.getOrganizationName() : selectedCustomer.getReceiverName());
                assignment.setCustomShippingAddress(selectedCustomer.getShippingAddress());
                assignment.setCustomPhone(selectedCustomer.getReceiverPhone());
                assignment.setApproved(true);
                agencyCustomerAssignmentRepository.save(assignment);
            }
            Long userId = selectedCustomer.getUserId();
            receiver = userId != null ? userRepository.findById(userId)
                    .orElse(null) : null;
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(userId != null ? userId : agencyId, agencyId).getId();
            orderCustomer = selectedCustomer;
        } else if (request.getNewCustomerInfo() != null) {
            orderCustomer = createNewCustomer(request.getNewCustomerInfo(), agencyId);
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(agencyId, agencyId).getId();
        } else {
            throw new RuntimeException("Vui lòng chọn người mua");
        }

        Order order = new Order();
        order.setCustomer(orderCustomer);
        order.setAgency(agency);
        order.setCreatedBy(creator);
        order.setUpdatedDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : orderCustomer.getShippingAddress());
        order.setPriceListId(priceListId);
        order.setReceiverType(receiverType);
        order.setDebtTermDays(request.getDebtTermDays());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setOrderSource(request.getOrderSource() != null ? request.getOrderSource() : "Web");
        order.setInvoiceName(request.getInvoiceName());
        order.setInvoiceTaxCode(request.getInvoiceTaxCode());
        order.setInvoiceAddress(request.getInvoiceAddress());

        OrderType orderType = request.getOrderType() != null
                ? OrderType.valueOf(request.getOrderType())
                : OrderType.DROPSHIP;
        order.setOrderType(orderType);

        double totalAmount = 0.0;
        Set<Long> appliedPromotionIds = new HashSet<>();

        double preTotal = 0;
        for (OrderItemRequest preItem : request.getItems()) {
            if (preItem.getProductId() == null) continue;
            Product preProduct = productRepository.findById(preItem.getProductId()).orElse(null);
            if (preProduct == null) continue;
            Double bp = priceListService.getResolvedPrice(preItem.getProductId(), agencyId, customerIdSelected);
            if (bp == null || bp < 0) bp = preProduct.getBasePrice();
            preTotal += bp * preItem.getQuantity();
        }

        for (OrderItemRequest itemReq : request.getItems()) {
            Long productId = itemReq.getProductId();
            if (productId == null) throw new RuntimeException("Product ID is required");
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Double baseResolvedPrice = priceListService.getResolvedPrice(productId, agencyId, customerIdSelected);
            if (baseResolvedPrice == null || baseResolvedPrice < 0) {
                baseResolvedPrice = product.getBasePrice();
            }

            Double price = salesPolicyService.applySalesPolicy(product, agency, itemReq.getQuantity(), baseResolvedPrice,
                    preTotal, request.getPaymentMethod(), request.getOrderSource(), receiver != null ? receiver.getId() : null, null, appliedPromotionIds);

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

            // Tự động kiểm tra quà tặng bậc thang (hàng tặng giảm 100% đơn giá)
            SalesPolicyTier matchedTier = salesPolicyService.getMatchedTierForOrder(product, agency, itemReq.getQuantity(), baseResolvedPrice);
            if (matchedTier != null && matchedTier.getGiftProduct() != null && matchedTier.getGiftQuantity() != null && matchedTier.getGiftQuantity() > 0) {
                Product giftProduct = matchedTier.getGiftProduct();
                int giftQty = matchedTier.getGiftQuantity();

                if (giftProduct.getStockQuantity() < giftQty) {
                    throw new RuntimeException("Không đủ tồn kho cho sản phẩm quà tặng: " + giftProduct.getName());
                }
                giftProduct.setStockQuantity(giftProduct.getStockQuantity() - giftQty);
                productRepository.save(giftProduct);

                OrderItem giftOrderItem = new OrderItem();
                giftOrderItem.setOrder(order);
                giftOrderItem.setProduct(giftProduct);
                giftOrderItem.setQuantity(giftQty);
                giftOrderItem.setPrice(0.0); // Giảm 100%
                giftOrderItem.setPriceListId(priceListId);
                order.getItems().add(giftOrderItem);
            }
        }

        double discountAmount = 0.0;

        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            discountAmount = promotionService.validateAndCalculateDiscount(
                    request.getPromotionCode(), totalAmount);
            order.setPromotionCode(request.getPromotionCode().toUpperCase());
            promotionService.incrementUsage(request.getPromotionCode());
        }

        if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0 && receiver != null) {
            double pointDiscount = loyaltyService.redeemPoints(receiver.getId(), request.getPointsToRedeem(), order);
            discountAmount += pointDiscount;
            order.setPointsRedeemed(request.getPointsToRedeem());
        }

        order.setDiscountAmount(discountAmount);
        order.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 0.0);
        order.setTotalAmount(Math.max(0, totalAmount - discountAmount) + order.getDeliveryFee());

        Order savedOrder = orderRepository.save(order);

        // Ghi nhận lượt sử dụng promotion
        for (Long promoId : appliedPromotionIds) {
            salesPolicyService.recordPromotionUsage(promoId, receiver != null ? receiver.getId() : null, savedOrder.getId());
        }

        commissionService.createTransaction(savedOrder);

        boolean creditConsumed = creditService.tryConsumeCredit(agencyId, savedOrder.getId(), savedOrder.getTotalAmount());

        if (!creditConsumed) {
            savedOrder.setStatus("PENDING_PAYMENT");
            orderRepository.save(savedOrder);
        } else {
            agencyDebtService.createDebtsForOrder(savedOrder);
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
        Customer orderCustomer = null;
        Long priceListId = null;
        String receiverType = "AGENCY";

        if (customerIdSelected != null) {
            Customer selectedCustomer = customerRepository.findById(customerIdSelected)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            if (!agencyCustomerAssignmentRepository.existsByAgencyIdAndCustomerId(agencyId, customerIdSelected)) {
                AgencyCustomerAssignment assignment = new AgencyCustomerAssignment();
                assignment.setCustomer(selectedCustomer);
                assignment.setAgency(agency);
                assignment.setCustomName(selectedCustomer.getOrganizationName() != null ?
                        selectedCustomer.getOrganizationName() : selectedCustomer.getReceiverName());
                assignment.setCustomShippingAddress(selectedCustomer.getShippingAddress());
                assignment.setCustomPhone(selectedCustomer.getReceiverPhone());
                assignment.setApproved(true);
                agencyCustomerAssignmentRepository.save(assignment);
            }
            Long userId = selectedCustomer.getUserId();
            receiver = userId != null ? userRepository.findById(userId)
                    .orElse(null) : null;
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(userId != null ? userId : agencyId, agencyId).getId();
            orderCustomer = selectedCustomer;
        } else if (request.getNewCustomerInfo() != null) {
            orderCustomer = createNewCustomer(request.getNewCustomerInfo(), agencyId);
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(agencyId, agencyId).getId();
        } else {
            throw new RuntimeException("Vui lòng chọn người mua");
        }

        User createdByUser = userRepository.findById(createdByUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = new Order();
        order.setCustomer(orderCustomer);
        order.setAgency(agency);
        order.setCreatedBy(createdByUser);
        order.setUpdatedDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : orderCustomer.getShippingAddress());
        order.setPriceListId(priceListId);
        order.setReceiverType(receiverType);
        order.setDebtTermDays(request.getDebtTermDays());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setOrderSource(request.getOrderSource() != null ? request.getOrderSource() : "Web");
        order.setInvoiceName(request.getInvoiceName());
        order.setInvoiceTaxCode(request.getInvoiceTaxCode());
        order.setInvoiceAddress(request.getInvoiceAddress());

        OrderType orderType = request.getOrderType() != null
                ? OrderType.valueOf(request.getOrderType())
                : OrderType.DROPSHIP;
        order.setOrderType(orderType);

        double totalAmount = 0.0;
        Set<Long> appliedPromotionIds = new HashSet<>();

        double preTotal = 0;
        for (OrderItemRequest preItem : request.getItems()) {
            if (preItem.getProductId() == null) continue;
            Product preProduct = productRepository.findById(preItem.getProductId()).orElse(null);
            if (preProduct == null) continue;
            Double bp = priceListService.getResolvedPrice(preItem.getProductId(), agencyId, customerIdSelected);
            if (bp == null || bp < 0) bp = preProduct.getBasePrice();
            preTotal += bp * preItem.getQuantity();
        }

        for (OrderItemRequest itemReq : request.getItems()) {
            Long productId = itemReq.getProductId();
            if (productId == null) throw new RuntimeException("Product ID is required");
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Double baseResolvedPrice = priceListService.getResolvedPrice(productId, agencyId, customerIdSelected);
            if (baseResolvedPrice == null || baseResolvedPrice < 0) {
                baseResolvedPrice = product.getBasePrice();
            }
            
            Double price = salesPolicyService.applySalesPolicy(product, agency, itemReq.getQuantity(), baseResolvedPrice,
                    preTotal, request.getPaymentMethod(), request.getOrderSource(), receiver != null ? receiver.getId() : null, null, appliedPromotionIds);

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

            // Tự động kiểm tra quà tặng bậc thang (hàng tặng giảm 100% đơn giá)
            SalesPolicyTier matchedTier = salesPolicyService.getMatchedTierForOrder(product, agency, itemReq.getQuantity(), baseResolvedPrice);
            if (matchedTier != null && matchedTier.getGiftProduct() != null && matchedTier.getGiftQuantity() != null && matchedTier.getGiftQuantity() > 0) {
                Product giftProduct = matchedTier.getGiftProduct();
                int giftQty = matchedTier.getGiftQuantity();

                if (giftProduct.getStockQuantity() < giftQty) {
                    throw new RuntimeException("Không đủ tồn kho cho sản phẩm quà tặng: " + giftProduct.getName());
                }
                giftProduct.setStockQuantity(giftProduct.getStockQuantity() - giftQty);
                productRepository.save(giftProduct);

                OrderItem giftOrderItem = new OrderItem();
                giftOrderItem.setOrder(order);
                giftOrderItem.setProduct(giftProduct);
                giftOrderItem.setQuantity(giftQty);
                giftOrderItem.setPrice(0.0); // Giảm 100%
                giftOrderItem.setPriceListId(priceListId);
                order.getItems().add(giftOrderItem);
            }
        }

        double discountAmount = 0.0;

        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            discountAmount = promotionService.validateAndCalculateDiscount(
                    request.getPromotionCode(), totalAmount);
            order.setPromotionCode(request.getPromotionCode().toUpperCase());
            promotionService.incrementUsage(request.getPromotionCode());
        }

        if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0 && receiver != null) {
            double pointDiscount = loyaltyService.redeemPoints(receiver.getId(), request.getPointsToRedeem(), order);
            discountAmount += pointDiscount;
            order.setPointsRedeemed(request.getPointsToRedeem());
        }

        order.setDiscountAmount(discountAmount);
        order.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 0.0);
        order.setTotalAmount(Math.max(0, totalAmount - discountAmount) + order.getDeliveryFee());

        Order savedOrder = orderRepository.save(order);

        for (Long promoId : appliedPromotionIds) {
            salesPolicyService.recordPromotionUsage(promoId, receiver != null ? receiver.getId() : null, savedOrder.getId());
        }

        commissionService.createTransaction(savedOrder);

        boolean creditConsumed = creditService.tryConsumeCredit(agencyId, savedOrder.getId(), savedOrder.getTotalAmount());

        if (!creditConsumed) {
            savedOrder.setStatus("PENDING_PAYMENT");
            orderRepository.save(savedOrder);
        } else {
            agencyDebtService.createDebtsForOrder(savedOrder);
        }

        return savedOrder;
    }

    @Transactional
    public Order createOrderByAgency(Long userId, OrderRequest request) {
        AgencyDTO agencyDTO = agencyService.getAgencyById(userId);
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
        Customer orderCustomer = null;
        Long priceListId = null;
        String receiverType = "AGENCY";

        if (customerIdSelected != null) {
            Customer selectedCustomer = customerRepository.findById(customerIdSelected)
                    .orElseThrow(() -> new RuntimeException("Customer not found"));
            if (!agencyCustomerAssignmentRepository.existsByAgencyIdAndCustomerId(agencyId, customerIdSelected)) {
                AgencyCustomerAssignment assignment = new AgencyCustomerAssignment();
                assignment.setCustomer(selectedCustomer);
                assignment.setAgency(agency);
                assignment.setCustomName(selectedCustomer.getOrganizationName() != null ?
                        selectedCustomer.getOrganizationName() : selectedCustomer.getReceiverName());
                assignment.setCustomShippingAddress(selectedCustomer.getShippingAddress());
                assignment.setCustomPhone(selectedCustomer.getReceiverPhone());
                assignment.setApproved(true);
                agencyCustomerAssignmentRepository.save(assignment);
            }
            Long userIdFromCustomer = selectedCustomer.getUserId();
            receiver = userIdFromCustomer != null ? userRepository.findById(userIdFromCustomer)
                    .orElse(null) : null;
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(userIdFromCustomer != null ? userIdFromCustomer : agencyId, agencyId).getId();
            orderCustomer = selectedCustomer;
        } else if (request.getNewCustomerInfo() != null) {
            orderCustomer = createNewCustomer(request.getNewCustomerInfo(), agencyId);
            receiverType = "CUSTOMER";
            priceListId = priceListService.resolveForCustomer(agencyId, agencyId).getId();
        } else {
            throw new RuntimeException("Vui lòng chọn người mua");
        }

        Order order = new Order();
        order.setCustomer(orderCustomer);
        order.setAgency(agency);
        order.setUpdatedDate(LocalDateTime.now());
        order.setStatus("PENDING");
        order.setShippingAddress(request.getShippingAddress() != null ? request.getShippingAddress() : orderCustomer.getShippingAddress());
        order.setPriceListId(priceListId);
        order.setReceiverType(receiverType);
        order.setDebtTermDays(request.getDebtTermDays());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setOrderSource(request.getOrderSource() != null ? request.getOrderSource() : "Web");
        order.setInvoiceName(request.getInvoiceName());
        order.setInvoiceTaxCode(request.getInvoiceTaxCode());
        order.setInvoiceAddress(request.getInvoiceAddress());

        OrderType orderType = request.getOrderType() != null
                ? OrderType.valueOf(request.getOrderType())
                : OrderType.DROPSHIP;
        order.setOrderType(orderType);

        double totalAmount = 0.0;
        Set<Long> appliedPromotionIds = new HashSet<>();

        double preTotal = 0;
        for (OrderItemRequest preItem : request.getItems()) {
            if (preItem.getProductId() == null) continue;
            Product preProduct = productRepository.findById(preItem.getProductId()).orElse(null);
            if (preProduct == null) continue;
            Double bp = priceListService.getResolvedPrice(preItem.getProductId(), agencyId, customerIdSelected);
            if (bp == null || bp < 0) bp = preProduct.getBasePrice();
            preTotal += bp * preItem.getQuantity();
        }

        for (OrderItemRequest itemReq : request.getItems()) {
            Long productId = itemReq.getProductId();
            if (productId == null) throw new RuntimeException("Product ID is required");
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            Double baseResolvedPrice = priceListService.getResolvedPrice(productId, agencyId, customerIdSelected);
            if (baseResolvedPrice == null || baseResolvedPrice < 0) {
                baseResolvedPrice = product.getBasePrice();
            }
            
            Double price = salesPolicyService.applySalesPolicy(product, agency, itemReq.getQuantity(), baseResolvedPrice,
                    preTotal, request.getPaymentMethod(), request.getOrderSource(), receiver != null ? receiver.getId() : null, null, appliedPromotionIds);

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

            // Tự động kiểm tra quà tặng bậc thang (hàng tặng giảm 100% đơn giá)
            SalesPolicyTier matchedTier = salesPolicyService.getMatchedTierForOrder(product, agency, itemReq.getQuantity(), baseResolvedPrice);
            if (matchedTier != null && matchedTier.getGiftProduct() != null && matchedTier.getGiftQuantity() != null && matchedTier.getGiftQuantity() > 0) {
                Product giftProduct = matchedTier.getGiftProduct();
                int giftQty = matchedTier.getGiftQuantity();

                if (giftProduct.getStockQuantity() < giftQty) {
                    throw new RuntimeException("Không đủ tồn kho cho sản phẩm quà tặng: " + giftProduct.getName());
                }
                giftProduct.setStockQuantity(giftProduct.getStockQuantity() - giftQty);
                productRepository.save(giftProduct);

                OrderItem giftOrderItem = new OrderItem();
                giftOrderItem.setOrder(order);
                giftOrderItem.setProduct(giftProduct);
                giftOrderItem.setQuantity(giftQty);
                giftOrderItem.setPrice(0.0); // Giảm 100%
                giftOrderItem.setPriceListId(priceListId);
                order.getItems().add(giftOrderItem);
            }
        }

        double discountAmount = 0.0;

        if (request.getPromotionCode() != null && !request.getPromotionCode().isBlank()) {
            discountAmount = promotionService.validateAndCalculateDiscount(
                    request.getPromotionCode(), totalAmount);
            order.setPromotionCode(request.getPromotionCode().toUpperCase());
            promotionService.incrementUsage(request.getPromotionCode());
        }

        if (request.getPointsToRedeem() != null && request.getPointsToRedeem() > 0 && receiver != null) {
            double pointDiscount = loyaltyService.redeemPoints(receiver.getId(), request.getPointsToRedeem(), order);
            discountAmount += pointDiscount;
            order.setPointsRedeemed(request.getPointsToRedeem());
        }

        order.setDiscountAmount(discountAmount);
        order.setDeliveryFee(request.getDeliveryFee() != null ? request.getDeliveryFee() : 0.0);
        order.setTotalAmount(Math.max(0, totalAmount - discountAmount) + order.getDeliveryFee());

        Order savedOrder = orderRepository.save(order);

        for (Long promoId : appliedPromotionIds) {
            salesPolicyService.recordPromotionUsage(promoId, receiver != null ? receiver.getId() : null, savedOrder.getId());
        }

        commissionService.createTransaction(savedOrder);

        boolean creditConsumed = creditService.tryConsumeCredit(agencyId, savedOrder.getId(), savedOrder.getTotalAmount());

        if (!creditConsumed) {
            savedOrder.setStatus("PENDING_PAYMENT");
            orderRepository.save(savedOrder);
        } else {
            agencyDebtService.createDebtsForOrder(savedOrder);
        }

        return savedOrder;
    }

    private Customer createNewCustomer(OrderRequest.NewCustomerInfo newCustomerInfo, Long agencyId) {
        Customer customer = new Customer();
        customer.setOrganizationName(newCustomerInfo.getName());
        customer.setShippingAddress(newCustomerInfo.getShippingAddress());
        customer.setReceiverName(newCustomerInfo.getReceiverName() != null ? newCustomerInfo.getReceiverName() : newCustomerInfo.getName());
        customer.setReceiverPhone(newCustomerInfo.getReceiverPhone() != null ? newCustomerInfo.getReceiverPhone() : newCustomerInfo.getPhone());
        customer.setBillingAddress(newCustomerInfo.getInvoiceAddress());
        customer.setTaxCode(newCustomerInfo.getInvoiceTaxCode());
        Customer savedCustomer = customerRepository.save(customer);

        AgencyCustomerAssignment assignment = new AgencyCustomerAssignment();
        assignment.setCustomer(savedCustomer);
        assignment.setAgency(agencyRepository.getReferenceById(agencyId));
        assignment.setCustomName(newCustomerInfo.getName());
        assignment.setCustomShippingAddress(newCustomerInfo.getShippingAddress());
        assignment.setCustomPhone(newCustomerInfo.getPhone());
        assignment.setApproved(false);
        agencyCustomerAssignmentRepository.save(assignment);

        return savedCustomer;
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
        
        if ("COMPLETED".equalsIgnoreCase(status) && !"COMPLETED".equalsIgnoreCase(oldStatus)) {
            if (order.getCustomer() != null && order.getAgency() != null) {
                agencyCustomerAssignmentRepository.findByAgencyIdAndCustomerId(
                        order.getAgency().getId(), order.getCustomer().getId())
                    .ifPresent(assignment -> {
                        assignment.setTotalDebt(assignment.getTotalDebt() + order.getTotalAmount());
                        agencyCustomerAssignmentRepository.save(assignment);
                    });
            }
        }
        
        return convertToDTO(savedOrder);
    }

    @Transactional
    public void confirmPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"PENDING_PAYMENT".equals(order.getStatus())) {
            throw new RuntimeException("Order is not in PENDING_PAYMENT status");
        }

        boolean creditConsumed = creditService.tryConsumeCredit(
                order.getAgency().getId(), orderId, order.getTotalAmount());

        if (!creditConsumed) {
            throw new RuntimeException("Hạn mức tín dụng không đủ");
        }

        agencyDebtService.createDebtsForOrder(order);
    }

    @Transactional
    public void cancelPendingPaymentOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"PENDING_PAYMENT".equals(order.getStatus())) {
            throw new RuntimeException("Order is not in PENDING_PAYMENT status");
        }

        order.setStatus("CANCELLED");
        order.setUpdatedDate(LocalDateTime.now());

        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
            productRepository.save(product);
        }

        orderRepository.save(order);
    }

    @Transactional
    public void autoCancelExpiredPendingPayments() {
        LocalDateTime expiryTime = LocalDateTime.now().minusMinutes(60);
        List<Order> expiredOrders = orderRepository.findPendingPaymentOrdersBefore(expiryTime);

        for (Order order : expiredOrders) {
            cancelPendingPaymentOrder(order.getId());
        }
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setCustomerId(order.getCustomer().getId());
        Customer c = order.getCustomer();
        dto.setCustomerName(c.getOrganizationName() != null ? 
                c.getOrganizationName() : "");
        
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
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setOrderSource(order.getOrderSource());
        dto.setDebtTermDays(order.getDebtTermDays());
        
        if (order.getCreatedBy() != null) {
            dto.setCreatedByName(order.getCreatedBy().getOrganizationName() != null ? 
                    order.getCreatedBy().getOrganizationName() : order.getCreatedBy().getUsername());
        } else if (order.getAgency() != null) {
            dto.setCreatedByName(order.getAgency().getName());
        }
        dto.setUpdatedDate(order.getUpdatedDate());
        dto.setInvoiceName(order.getInvoiceName());
        dto.setInvoiceTaxCode(order.getInvoiceTaxCode());
        dto.setInvoiceAddress(order.getInvoiceAddress());

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
