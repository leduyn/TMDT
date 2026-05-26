package com.anhtin.tmdt.backend.modules.product.controller;

import com.anhtin.tmdt.backend.modules.product.dto.ReviewRequest;
import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.common.dto.ReviewDTO;
import com.anhtin.tmdt.backend.security.services.UserDetailsImpl;
import com.anhtin.tmdt.backend.modules.product.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.lang.NonNull;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // ========== Product Reviews ==========

    /**
     * Khách hàng đánh giá sản phẩm.
     */
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/products/{productId}")
    public ResponseEntity<?> reviewProduct(
            @PathVariable @NonNull Long productId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        try {
            UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = user.getId();
            if (userId == null) throw new RuntimeException("User ID not found");
            ReviewDTO dto = reviewService.createProductReview(userId, productId, request);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Lấy đánh giá sản phẩm (phân trang, lọc số sao).
     */
    @GetMapping("/products/{productId}")
    public ResponseEntity<Page<ReviewDTO>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                reviewService.getProductReviews(productId, rating, PageRequest.of(page, size)));
    }

    /**
     * Lấy điểm đánh giá trung bình sản phẩm.
     */
    @GetMapping("/products/{productId}/average")
    public ResponseEntity<?> getProductAvgRating(@PathVariable Long productId) {
        Double avg = reviewService.getProductAverageRating(productId);
        return ResponseEntity.ok(Map.of("productId", productId, "averageRating", avg));
    }

    // ========== Agency Reviews ==========

    /**
     * Khách hàng đánh giá Đại lý.
     */
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/agencies/{agencyId}")
    public ResponseEntity<?> reviewAgency(
            @PathVariable @NonNull Long agencyId,
            @Valid @RequestBody ReviewRequest request,
            Authentication authentication) {
        try {
            UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = user.getId();
            if (userId == null) throw new RuntimeException("User ID not found");
            ReviewDTO dto = reviewService.createAgencyReview(userId, agencyId, request);
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Lấy đánh giá Đại lý (phân trang).
     */
    @GetMapping("/agencies/{agencyId}")
    public ResponseEntity<Page<ReviewDTO>> getAgencyReviews(
            @PathVariable Long agencyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(
                reviewService.getAgencyReviews(agencyId, PageRequest.of(page, size)));
    }

    /**
     * Lấy điểm đánh giá trung bình Đại lý.
     */
    @GetMapping("/agencies/{agencyId}/average")
    public ResponseEntity<?> getAgencyAvgRating(@PathVariable Long agencyId) {
        Double avg = reviewService.getAgencyAverageRating(agencyId);
        return ResponseEntity.ok(Map.of("agencyId", agencyId, "averageRating", avg));
    }
}
