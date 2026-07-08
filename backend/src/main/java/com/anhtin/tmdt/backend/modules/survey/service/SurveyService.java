package com.anhtin.tmdt.backend.modules.survey.service;

import com.anhtin.tmdt.backend.modules.survey.dto.SurveyAnswerDTO;
import com.anhtin.tmdt.backend.modules.survey.entity.SurveyAnswer;
import com.anhtin.tmdt.backend.modules.survey.entity.SurveyQuestion;
import com.anhtin.tmdt.backend.modules.survey.repository.SurveyAnswerRepository;
import com.anhtin.tmdt.backend.modules.survey.repository.SurveyQuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

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

    public List<SurveyAnswerDTO> getAgencyAnswers(Long agencyId) {
        return answerRepository.findByAgencyId(agencyId).stream().map(a -> {
            SurveyQuestion q = questionRepository.findById(a.getQuestionId()).orElse(null);
            return new SurveyAnswerDTO(a,
                    q != null ? q.getQuestion() : null,
                    q != null ? q.getType() : null);
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAnswerStats() {
        List<SurveyQuestion> questions = questionRepository.findAll();
        List<SurveyAnswer> allAnswers = answerRepository.findAll();

        Map<Long, List<SurveyAnswer>> answersByQuestion = allAnswers.stream()
                .collect(Collectors.groupingBy(SurveyAnswer::getQuestionId));

        List<Map<String, Object>> result = new ArrayList<>();
        for (SurveyQuestion q : questions) {
            Map<String, Object> item = new HashMap<>();
            item.put("questionId", q.getId());
            item.put("question", q.getQuestion());
            item.put("questionType", q.getType());
            item.put("options", q.getOptions());
            item.put("active", q.isActive());

            List<SurveyAnswer> answers = answersByQuestion.getOrDefault(q.getId(), Collections.emptyList());
            item.put("totalAnswers", answers.size());

            if ("radio".equals(q.getType()) || "checkbox".equals(q.getType())) {
                Map<String, Long> optionCounts = new LinkedHashMap<>();
                if (q.getOptions() != null) {
                    for (String opt : q.getOptions().split("\n")) {
                        String trimmed = opt.trim();
                        if (!trimmed.isEmpty()) {
                            optionCounts.put(trimmed, 0L);
                        }
                    }
                }
                for (SurveyAnswer a : answers) {
                    if ("checkbox".equals(q.getType())) {
                        String[] parts = a.getAnswer().split(",\s*");
                        for (String part : parts) {
                            optionCounts.merge(part.trim(), 1L, Long::sum);
                        }
                    } else {
                        optionCounts.merge(a.getAnswer().trim(), 1L, Long::sum);
                    }
                }
                item.put("optionCounts", optionCounts);
            } else {
                // For text type, collect raw answers
                item.put("rawAnswers", answers.stream().map(SurveyAnswer::getAnswer).collect(Collectors.toList()));
            }
            result.add(item);
        }
        return result;
    }
}
