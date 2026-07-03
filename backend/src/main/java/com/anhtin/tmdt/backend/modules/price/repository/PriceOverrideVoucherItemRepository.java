package com.anhtin.tmdt.backend.modules.price.repository;

import com.anhtin.tmdt.backend.modules.price.entity.PriceOverrideVoucherItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceOverrideVoucherItemRepository extends JpaRepository<PriceOverrideVoucherItem, Long> {
    List<PriceOverrideVoucherItem> findByVoucherId(Long voucherId);
}
