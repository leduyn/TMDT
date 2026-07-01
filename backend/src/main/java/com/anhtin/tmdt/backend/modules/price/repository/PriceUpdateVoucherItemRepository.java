package com.anhtin.tmdt.backend.modules.price.repository;

import com.anhtin.tmdt.backend.modules.price.entity.PriceUpdateVoucherItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceUpdateVoucherItemRepository extends JpaRepository<PriceUpdateVoucherItem, Long> {
    List<PriceUpdateVoucherItem> findByVoucherId(Long voucherId);
    Page<PriceUpdateVoucherItem> findByVoucherId(Long voucherId, Pageable pageable);
    void deleteByVoucherId(Long voucherId);
}
