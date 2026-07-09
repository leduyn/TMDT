package com.anhtin.tmdt.backend.modules.guide.repository;

import com.anhtin.tmdt.backend.modules.guide.entity.GuideStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GuideStepRepository extends JpaRepository<GuideStep, Long> {
    List<GuideStep> findByGuideIdOrderByStepOrderAsc(Long guideId);
    void deleteByGuideId(Long guideId);
}
