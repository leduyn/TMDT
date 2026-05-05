package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.PriceUpdateVoucherItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceUpdateVoucherItemRepository extends JpaRepository<PriceUpdateVoucherItem, Long> {
    List<PriceUpdateVoucherItem> findByVoucherId(Long voucherId);
    void deleteByVoucherId(Long voucherId);
}
