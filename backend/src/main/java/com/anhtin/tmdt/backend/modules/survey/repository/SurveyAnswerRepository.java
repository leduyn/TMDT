package com.anhtin.tmdt.backend.modules.survey.repository;

import com.anhtin.tmdt.backend.modules.survey.entity.SurveyAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyAnswerRepository extends JpaRepository<SurveyAnswer, Long> {
    List<SurveyAnswer> findByAgencyId(Long agencyId);
    List<SurveyAnswer> findByAgencyIdAndCategoryId(Long agencyId, Long categoryId);
}
