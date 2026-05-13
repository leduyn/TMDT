package com.anhtin.tmdt.backend.modules.agency.repository;

import com.anhtin.tmdt.backend.modules.agency.entity.AgencyStorePriceList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import com.anhtin.tmdt.backend.modules.agency.entity.Agency;

@Repository
public interface AgencyStorePriceListRepository extends JpaRepository<AgencyStorePriceList, Long> {
    Optional<AgencyStorePriceList> findByAgencyId(Long agencyId);
    void deleteByAgencyId(Long agencyId);
}
