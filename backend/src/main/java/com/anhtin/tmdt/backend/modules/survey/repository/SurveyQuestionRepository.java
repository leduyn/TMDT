package com.anhtin.tmdt.backend.modules.survey.repository;

import com.anhtin.tmdt.backend.modules.survey.entity.SurveyQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SurveyQuestionRepository extends JpaRepository<SurveyQuestion, Long> {
    List<SurveyQuestion> findByActiveTrueOrderBySortOrderAsc();

    @Query("SELECT q FROM SurveyQuestion q JOIN q.categories c WHERE c.id = :categoryId AND q.active = true ORDER BY q.sortOrder")
    List<SurveyQuestion> findByActiveTrueAndCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT q FROM SurveyQuestion q WHERE q.globalQuestion = true AND q.active = true ORDER BY q.sortOrder")
    List<SurveyQuestion> findByGlobalQuestionTrueAndActiveTrueOrderBySortOrderAsc();

    List<SurveyQuestion> findByContextAndActiveTrueOrderBySortOrderAsc(String context);

    @Query("SELECT q FROM SurveyQuestion q JOIN q.categories c WHERE c.id = :categoryId AND q.active = true AND q.context = :context ORDER BY q.sortOrder")
    List<SurveyQuestion> findByActiveTrueAndCategoryIdAndContext(@Param("categoryId") Long categoryId, @Param("context") String context);

    @Query("SELECT q FROM SurveyQuestion q WHERE q.globalQuestion = true AND q.active = true AND q.context = :context ORDER BY q.sortOrder")
    List<SurveyQuestion> findByGlobalQuestionTrueAndActiveTrueAndContext(@Param("context") String context);
}
