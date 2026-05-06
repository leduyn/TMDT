package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.AgencyPriceList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AgencyPriceListRepository extends JpaRepository<AgencyPriceList, Long> {
    List<AgencyPriceList> findByAgencyIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(Long agencyId, java.time.LocalDateTime now);
    Optional<AgencyPriceList> findFirstByAgencyIdAndEffectiveFromLessThanEqualOrderByEffectiveFromDesc(Long agencyId, java.time.LocalDateTime now);
    List<AgencyPriceList> findByPriceListId(Long priceListId);
    void deleteByAgencyId(Long agencyId);
}
