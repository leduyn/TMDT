package com.anhtin.tmdt.backend.modules.guide.repository;

import com.anhtin.tmdt.backend.modules.guide.entity.Guide;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuideRepository extends JpaRepository<Guide, Long> {
    List<Guide> findByIsActiveTrueOrderByCreatedAtAsc();
}
