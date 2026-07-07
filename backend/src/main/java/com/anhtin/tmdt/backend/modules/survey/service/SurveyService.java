package com.anhtin.tmdt.backend.modules.survey.service;

import com.anhtin.tmdt.backend.modules.survey.entity.SurveyAnswer;
import com.anhtin.tmdt.backend.modules.survey.entity.SurveyQuestion;
import com.anhtin.tmdt.backend.modules.survey.repository.SurveyAnswerRepository;
import com.anhtin.tmdt.backend.modules.survey.repository.SurveyQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SurveyService {

    @Autowired
    private SurveyQuestionRepository questionRepository;

    @Autowired
    private SurveyAnswerRepository answerRepository;

    public List<SurveyQuestion> getAllQuestions() {
        return questionRepository.findAll();
    }

    public List<SurveyQuestion> getActiveQuestions() {
        return questionRepository.findByActiveTrueOrderBySortOrderAsc();
    }

    public SurveyQuestion createQuestion(SurveyQuestion question) {
        return questionRepository.save(question);
    }

    public SurveyQuestion updateQuestion(Long id, SurveyQuestion updated) {
        SurveyQuestion q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại"));
        q.setQuestion(updated.getQuestion());
        q.setType(updated.getType());
        q.setOptions(updated.getOptions());
        q.setActive(updated.isActive());
        q.setSortOrder(updated.getSortOrder());
        return questionRepository.save(q);
    }

    public void deleteQuestion(Long id) {
        questionRepository.deleteById(id);
    }

    @Transactional
    public void submitAnswers(Long agencyId, List<SurveyAnswer> answers) {
        for (SurveyAnswer answer : answers) {
            answer.setAgencyId(agencyId);
            answerRepository.save(answer);
        }
    }
}
