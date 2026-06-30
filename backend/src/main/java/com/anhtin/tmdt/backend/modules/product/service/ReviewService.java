package com.anhtin.tmdt.backend.modules.product.service;

import com.anhtin.tmdt.backend.modules.product.dto.ReviewRequest;
import com.anhtin.tmdt.backend.modules.common.dto.ReviewDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.lang.NonNull;
import org.springframework.transaction.annotation.Transactional;
import com.anhtin.tmdt.backend.modules.product.repository.ProductReviewRepository;
import com.anhtin.tmdt.backend.modules.user.entity.User;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyReview;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyRepository;
import com.anhtin.tmdt.backend.modules.product.repository.ProductRepository;
import com.anhtin.tmdt.backend.modules.agency.repository.AgencyReviewRepository;
import com.anhtin.tmdt.backend.modules.product.entity.Product;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;
import com.anhtin.tmdt.backend.modules.user.repository.UserRepository;
import com.anhtin.tmdt.backend.modules.product.entity.ProductReview;
import com.anhtin.tmdt.backend.modules.order.entity.Transaction;

@Service
public class ReviewService {

    @Autowired
    private ProductReviewRepository productReviewRepository;

    @Autowired
    private AgencyReviewRepository agencyReviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AgencyRepository agencyRepository;

    @Autowired
    private UserRepository userRepository;

    // ========== Product Reviews ==========

    @Transactional
    public ReviewDTO createProductReview(@NonNull Long customerId, @NonNull Long productId, ReviewRequest request) {
        if (productReviewRepository.existsByProductIdAndCustomerId(productId, customerId)) {
            throw new RuntimeException("Bạn đã đánh giá sản phẩm này rồi");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));

        ProductReview review = new ProductReview();
        review.setProduct(product);
        review.setCustomer(customer);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        review = productReviewRepository.save(review);

        return new ReviewDTO(review.getId(), productId, customerId,
                customer.getUsername(), review.getRating(), review.getComment(), review.getCreatedAt());
    }

    public Page<ReviewDTO> getProductReviews(Long productId, Integer rating, Pageable pageable) {
        Page<ProductReview> reviews;
        if (rating != null) {
            reviews = productReviewRepository.findByProductIdAndRatingOrderByCreatedAtDesc(productId, rating, pageable);
        } else {
            reviews = productReviewRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
        }

        return reviews.map(r -> new ReviewDTO(
                r.getId(), productId, r.getCustomer().getId(),
                r.getCustomer().getUsername(), r.getRating(), r.getComment(), r.getCreatedAt()
        ));
    }

    public Double getProductAverageRating(Long productId) {
        return productReviewRepository.getAverageRatingByProductId(productId);
    }

    // ========== Agency Reviews ==========

    @Transactional
    public ReviewDTO createAgencyReview(@NonNull Long customerId, @NonNull Long agencyId, ReviewRequest request) {
        if (agencyReviewRepository.existsByAgencyIdAndCustomerId(agencyId, customerId)) {
            throw new RuntimeException("Bạn đã đánh giá đại lý này rồi");
        }

        Agency agency = agencyRepository.findById(agencyId)
                .orElseThrow(() -> new RuntimeException("Đại lý không tồn tại"));
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));

        AgencyReview review = new AgencyReview();
        review.setAgency(agency);
        review.setCustomer(customer);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        review = agencyReviewRepository.save(review);

        return new ReviewDTO(review.getId(), agencyId, customerId,
                customer.getUsername(), review.getRating(), review.getComment(), review.getCreatedAt());
    }

    public Page<ReviewDTO> getAgencyReviews(Long agencyId, Pageable pageable) {
        return agencyReviewRepository.findByAgencyIdOrderByCreatedAtDesc(agencyId, pageable)
                .map(r -> new ReviewDTO(
                        r.getId(), agencyId, r.getCustomer().getId(),
                        r.getCustomer().getUsername(), r.getRating(), r.getComment(), r.getCreatedAt()
                ));
    }

    public Double getAgencyAverageRating(Long agencyId) {
        return agencyReviewRepository.getAverageRatingByAgencyId(agencyId);
    }
}
