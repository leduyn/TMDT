package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.PriceListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceListItemRepository extends JpaRepository<PriceListItem, Long> {

    List<PriceListItem> findByPriceListId(Long priceListId);

    Optional<PriceListItem> findByPriceListIdAndProductId(Long priceListId, Long productId);

    boolean existsByPriceListIdAndProductId(Long priceListId, Long productId);

    @Modifying
    @Query("DELETE FROM PriceListItem p WHERE p.priceList.id = :priceListId")
    void deleteByPriceListId(@Param("priceListId") Long priceListId);

    /** Đếm số sản phẩm trong bảng giá (dùng cho thống kê) */
    long countByPriceListId(Long priceListId);
}
