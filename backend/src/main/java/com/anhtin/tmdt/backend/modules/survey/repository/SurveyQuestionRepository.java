package com.anhtin.tmdt.backend.modules.survey.repository;

import com.anhtin.tmdt.backend.modules.survey.entity.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, Long> {
    List<SurveyQuestion> findByActiveTrueOrderBySortOrderAsc();
}
