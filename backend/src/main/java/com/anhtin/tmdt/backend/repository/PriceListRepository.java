package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.PriceList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PriceListRepository extends JpaRepository<PriceList, Long> {
    List<PriceList> findByActiveTrue();
    Optional<PriceList> findByIsDefaultTrue();
    boolean existsByIsDefaultTrue();
}
