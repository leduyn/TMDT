package com.anhtin.tmdt.backend.controller;

import com.anhtin.tmdt.backend.dto.request.OrderRequest;
import com.anhtin.tmdt.backend.dto.response.MessageResponse;
import com.anhtin.tmdt.backend.security.services.UserDetailsImpl;
import com.anhtin.tmdt.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request, Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        try {
            Long userId = userDetails.getId();
            if (userId == null) throw new RuntimeException("User ID not found");
            orderService.createOrder(userId, request);
            return ResponseEntity.ok(new MessageResponse("Order placed successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
