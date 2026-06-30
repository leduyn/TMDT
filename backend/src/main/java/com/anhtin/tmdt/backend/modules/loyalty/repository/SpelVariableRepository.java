package com.anhtin.tmdt.backend.modules.loyalty.repository;

import com.anhtin.tmdt.backend.modules.loyalty.entity.SpelVariable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SpelVariableRepository extends JpaRepository<SpelVariable, Long> {
    List<SpelVariable> findByActiveTrue();
    boolean existsByName(String name);
}
