package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgencyRepository extends JpaRepository<Agency, Long> {
    Optional<Agency> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}
