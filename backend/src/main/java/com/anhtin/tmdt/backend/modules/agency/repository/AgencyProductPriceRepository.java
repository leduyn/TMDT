package com.anhtin.tmdt.backend.modules.agency.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;
import com.anhtin.tmdt.backend.modules.agency.entity.AgencyProductPrice;

@Repository
public interface AgencyProductPriceRepository extends JpaRepository<AgencyProductPrice, Long> {
    Optional<AgencyProductPrice> findByAgencyIdAndProductId(Long agencyId, Long productId);
    List<AgencyProductPrice> findByAgencyId(Long agencyId);
    Page<AgencyProductPrice> findByAgencyId(Long agencyId, Pageable pageable);
    Page<AgencyProductPrice> findByAgencyIdAndProductNameContainingIgnoreCase(Long agencyId, String search, Pageable pageable);
    void deleteByAgencyId(Long agencyId);

    @Query(value = "SELECT p.* FROM agency_product_prices p " +
           "JOIN products pr ON pr.id = p.product_id " +
           "WHERE p.agency_id = :agencyId " +
           "AND (:categoryId IS NULL OR pr.category_id = :categoryId) " +
           "AND (:productTypeId IS NULL OR pr.product_type_id = :productTypeId) " +
           "AND (:isOverride IS NULL OR p.is_override = :isOverride)",
           countQuery = "SELECT COUNT(*) FROM agency_product_prices p " +
                        "JOIN products pr ON pr.id = p.product_id " +
                        "WHERE p.agency_id = :agencyId " +
                        "AND (:categoryId IS NULL OR pr.category_id = :categoryId) " +
                        "AND (:productTypeId IS NULL OR pr.product_type_id = :productTypeId) " +
                        "AND (:isOverride IS NULL OR p.is_override = :isOverride)",
           nativeQuery = true)
    Page<AgencyProductPrice> findFiltered(@Param("agencyId") Long agencyId,
                                           @Param("categoryId") Long categoryId,
                                           @Param("productTypeId") Long productTypeId,
                                           @Param("isOverride") Boolean isOverride,
                                           Pageable pageable);

    @Query(value = "SELECT p.* FROM agency_product_prices p " +
           "JOIN products pr ON pr.id = p.product_id " +
           "WHERE p.agency_id = :agencyId " +
           "AND (:categoryId IS NULL OR pr.category_id = :categoryId) " +
           "AND (:productTypeId IS NULL OR pr.product_type_id = :productTypeId) " +
           "AND (:isOverride IS NULL OR p.is_override = :isOverride) " +
           "AND p.product_id IN (:productIds)",
           countQuery = "SELECT COUNT(*) FROM agency_product_prices p " +
                        "JOIN products pr ON pr.id = p.product_id " +
                        "WHERE p.agency_id = :agencyId " +
                        "AND (:categoryId IS NULL OR pr.category_id = :categoryId) " +
                        "AND (:productTypeId IS NULL OR pr.product_type_id = :productTypeId) " +
                        "AND (:isOverride IS NULL OR p.is_override = :isOverride) " +
                        "AND p.product_id IN (:productIds)",
           nativeQuery = true)
    Page<AgencyProductPrice> findFilteredWithProductIds(@Param("agencyId") Long agencyId,
                                                         @Param("categoryId") Long categoryId,
                                                         @Param("productTypeId") Long productTypeId,
                                                         @Param("isOverride") Boolean isOverride,
                                                         @Param("productIds") List<Long> productIds,
                                                         Pageable pageable);
}
