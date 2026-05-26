package com.anhtin.tmdt.backend.modules.price.repository;

import com.anhtin.tmdt.backend.modules.price.entity.PriceUpdateVoucherPriceList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PriceUpdateVoucherPriceListRepository extends JpaRepository<PriceUpdateVoucherPriceList, Long> {
    List<PriceUpdateVoucherPriceList> findByVoucherId(Long voucherId);
    List<PriceUpdateVoucherPriceList> findByPriceListId(Long priceListId);
    void deleteByVoucherId(Long voucherId);
}
