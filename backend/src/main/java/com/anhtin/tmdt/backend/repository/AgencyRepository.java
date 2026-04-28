package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.Agency;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgencyRepository extends JpaRepository<Agency, Long> {
}
