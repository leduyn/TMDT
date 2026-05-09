package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.dto.response.MessageResponse;
import com.anhtin.tmdt.backend.dto.response.OrderDTO;
import com.anhtin.tmdt.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
/**
 * Controller for managing orders.
 */
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody com.anhtin.tmdt.backend.dto.request.OrderRequest request, Authentication authentication) {
        com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) authentication.getPrincipal();
        
        try {
            Long userId = userDetails.getId();
            if (userId == null) throw new RuntimeException("User ID not found");
            orderService.createOrder(userId, userId, request);
            return ResponseEntity.ok(new MessageResponse("Order placed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/by-employee")
    @PreAuthorize("hasRole('COMPANY') or hasRole('ADMIN')")
    public ResponseEntity<?> createOrderByEmployee(@RequestBody com.anhtin.tmdt.backend.dto.request.OrderRequest request, Authentication authentication) {
        com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) authentication.getPrincipal();
        
        try {
            Long userId = userDetails.getId();
            if (userId == null) throw new RuntimeException("User ID not found");
            orderService.createOrderByEmployee(userId, request);
            return ResponseEntity.ok(new MessageResponse("Order placed successfully by employee"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/by-agency")
    @PreAuthorize("hasRole('AGENCY') or hasRole('COMPANY') or hasRole('ADMIN')")
    public ResponseEntity<?> createOrderByAgency(@RequestBody com.anhtin.tmdt.backend.dto.request.OrderRequest request, Authentication authentication) {
        com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) authentication.getPrincipal();
        
        try {
            Long userId = userDetails.getId();
            if (userId == null) throw new RuntimeException("User ID not found");
            orderService.createOrderByAgency(userId, request);
            return ResponseEntity.ok(new MessageResponse("Order placed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('COMPANY') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('AGENCY') or hasRole('COMPANY') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getMyOrders(Authentication authentication) {
        com.anhtin.tmdt.backend.security.services.UserDetailsImpl userDetails = (com.anhtin.tmdt.backend.security.services.UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId();
        
        boolean isAgency = userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_AGENCY"));
        
        if (isAgency) {
            Long agencyId = userDetails.getAgencyId(); 
            if (agencyId != null) {
                return ResponseEntity.ok(orderService.getOrdersByAgency(agencyId));
            }
        }
        
        return ResponseEntity.ok(orderService.getOrdersByCustomer(userId));
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasRole('COMPANY') or hasRole('ADMIN') or hasRole('AGENCY')")
    public ResponseEntity<List<OrderDTO>> getOrdersByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    @GetMapping("/agency/{agencyId}")
    @PreAuthorize("hasRole('COMPANY') or hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getOrdersByAgency(@PathVariable Long agencyId) {
        return ResponseEntity.ok(orderService.getOrdersByAgency(agencyId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('AGENCY') or hasRole('COMPANY') or hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('COMPANY') or hasRole('ADMIN') or hasRole('AGENCY')")
    public ResponseEntity<OrderDTO> updateStatus(@PathVariable Long id, @RequestBody String status) {
        String cleanStatus = status.replace("\"", "");
        return ResponseEntity.ok(orderService.updateOrderStatus(id, cleanStatus));
    }
}
