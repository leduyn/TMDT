package com.anhtin.tmdt.backend.modules.product.repository;

import com.anhtin.tmdt.backend.modules.product.entity.ProductReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;

@Repository
public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {
    Page<ProductReview> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);
    Page<ProductReview> findByProductIdAndRatingOrderByCreatedAtDesc(Long productId, Integer rating, Pageable pageable);
    boolean existsByProductIdAndCustomerId(Long productId, Long customerId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM ProductReview r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(Long productId);
}
