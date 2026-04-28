package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.AgencyReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface AgencyReviewRepository extends JpaRepository<AgencyReview, Long> {
    Page<AgencyReview> findByAgencyIdOrderByCreatedAtDesc(Long agencyId, Pageable pageable);
    boolean existsByAgencyIdAndCustomerId(Long agencyId, Long customerId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM AgencyReview r WHERE r.agency.id = :agencyId")
    Double getAverageRatingByAgencyId(Long agencyId);
}
