package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.AgencyStorePriceList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgencyStorePriceListRepository extends JpaRepository<AgencyStorePriceList, Long> {
    Optional<AgencyStorePriceList> findByAgencyId(Long agencyId);
    void deleteByAgencyId(Long agencyId);
}
