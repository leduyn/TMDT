package com.anhtin.tmdt.backend.modules.survey.service;

import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.anhtin.tmdt.backend.modules.product.repository.CategoryRepository;
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
public class SurveyService { // Trigger JDT LS recompile

    @Autowired
    private SurveyQuestionRepository questionRepository;

    @Autowired
    private SurveyAnswerRepository answerRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public List<SurveyQuestion> getAllQuestions() {
        List<SurveyQuestion> questions = questionRepository.findAll();
        for (SurveyQuestion q : questions) {
            q.setCategoryIds(q.getCategories().stream().map(Category::getId).toList());
        }
        return questions;
    }

    public List<SurveyQuestion> getActiveQuestions() {
        return questionRepository.findByActiveTrueOrderBySortOrderAsc();
    }

    public List<SurveyQuestion> getActiveQuestionsByContext(String context) {
        return questionRepository.findByContextAndActiveTrueOrderBySortOrderAsc(context);
    }

    public List<SurveyQuestion> getActiveQuestionsByCategoryAndContext(Long categoryId, String context) {
        List<SurveyQuestion> globalQuestions = questionRepository.findByGlobalQuestionTrueAndActiveTrueAndContext(context);
        List<SurveyQuestion> categoryQuestions = questionRepository.findByActiveTrueAndCategoryIdAndContext(categoryId, context);
        Set<Long> seen = new LinkedHashSet<>();
        List<SurveyQuestion> merged = new ArrayList<>();
        for (SurveyQuestion q : globalQuestions) {
            if (seen.add(q.getId())) merged.add(q);
        }
        for (SurveyQuestion q : categoryQuestions) {
            if (seen.add(q.getId())) merged.add(q);
        }
        return merged;
    }

    public List<SurveyQuestion> getActiveQuestionsByCategory(Long categoryId) {
        List<SurveyQuestion> globalQuestions = questionRepository.findByGlobalQuestionTrueAndActiveTrueOrderBySortOrderAsc();
        List<SurveyQuestion> categoryQuestions = questionRepository.findByActiveTrueAndCategoryId(categoryId);
        Set<Long> seen = new LinkedHashSet<>();
        List<SurveyQuestion> merged = new ArrayList<>();
        for (SurveyQuestion q : globalQuestions) {
            if (seen.add(q.getId())) merged.add(q);
        }
        for (SurveyQuestion q : categoryQuestions) {
            if (seen.add(q.getId())) merged.add(q);
        }
        return merged;
    }

    public SurveyQuestion createQuestion(SurveyQuestion question) {
        SurveyQuestion saved = questionRepository.save(question);
        resolveCategories(saved);
        return questionRepository.save(saved);
    }

    public SurveyQuestion updateQuestion(Long id, SurveyQuestion updated) {
        SurveyQuestion q = questionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Câu hỏi không tồn tại"));
        q.setQuestion(updated.getQuestion());
        q.setType(updated.getType());
        q.setOptions(updated.getOptions());
        q.setActive(updated.isActive());
        q.setSortOrder(updated.getSortOrder());
        q.setGlobalQuestion(updated.isGlobalQuestion());
        q.setContext(updated.getContext());
        if (updated.getCategoryIds() != null) {
            Set<Category> cats = new HashSet<>(categoryRepository.findAllById(updated.getCategoryIds()));
            q.setCategories(cats);
        } else if (!updated.isGlobalQuestion()) {
            q.getCategories().clear();
        }
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

    public List<SurveyAnswerDTO> getAgencyAnswersByCategory(Long agencyId, Long categoryId) {
        return answerRepository.findByAgencyIdAndCategoryId(agencyId, categoryId).stream().map(a -> {
            SurveyQuestion q = questionRepository.findById(a.getQuestionId()).orElse(null);
            return new SurveyAnswerDTO(a,
                    q != null ? q.getQuestion() : null,
                    q != null ? q.getType() : null);
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> getAnswerStats() {
        List<SurveyQuestion> questions = questionRepository.findAll();
        List<SurveyAnswer> allAnswers = answerRepository.findAll();

        Map<String, List<SurveyAnswer>> answersByQuestionAndCategory = allAnswers.stream()
                .collect(Collectors.groupingBy(a -> a.getQuestionId() + ":" + (a.getCategoryId() != null ? a.getCategoryId() : "0")));

        List<Map<String, Object>> result = new ArrayList<>();
        for (SurveyQuestion q : questions) {
            List<Long> catIds = q.getCategories().stream().map(Category::getId).toList();
            if (q.isGlobalQuestion()) {
                addQuestionStats(result, q, null, answersByQuestionAndCategory, allAnswers);
            }
            for (Long catId : catIds) {
                addQuestionStats(result, q, catId, answersByQuestionAndCategory, allAnswers);
            }
        }
        return result;
    }

    private void addQuestionStats(List<Map<String, Object>> result, SurveyQuestion q,
                                  Long categoryId,
                                  Map<String, List<SurveyAnswer>> answersByKey,
                                  List<SurveyAnswer> allAnswers) {
        String key = q.getId() + ":" + (categoryId != null ? categoryId : "0");
        List<SurveyAnswer> answers = answersByKey.getOrDefault(key, Collections.emptyList());

        Map<String, Object> item = new HashMap<>();
        item.put("questionId", q.getId());
        item.put("question", q.getQuestion());
        item.put("questionType", q.getType());
        item.put("options", q.getOptions());
        item.put("active", q.isActive());
        item.put("globalQuestion", q.isGlobalQuestion());
        item.put("categoryId", categoryId);
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
            item.put("rawAnswers", answers.stream().map(SurveyAnswer::getAnswer).collect(Collectors.toList()));
        }
        result.add(item);
    }

    private void resolveCategories(SurveyQuestion question) {
        if (question.getCategoryIds() != null && !question.getCategoryIds().isEmpty()) {
            Set<Category> cats = new HashSet<>(categoryRepository.findAllById(question.getCategoryIds()));
            question.setCategories(cats);
        }
    }
}
