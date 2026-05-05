package com.anhtin.tmdt.backend.repository;

import com.anhtin.tmdt.backend.entity.CustomerGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerGroupRepository extends JpaRepository<CustomerGroup, Long> {
    Optional<CustomerGroup> findByName(String name);
    boolean existsByName(String name);
}
