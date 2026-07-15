package com.anhtin.tmdt.backend.modules.agency.repository;

import com.anhtin.tmdt.backend.modules.agency.entity.AgencyCategorySelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AgencyCategorySelectionRepository extends JpaRepository<AgencyCategorySelection, Long> {
    List<AgencyCategorySelection> findByAgencyId(Long agencyId);
    List<AgencyCategorySelection> findByCategoryId(Long categoryId);
    void deleteByAgencyId(Long agencyId);
}
