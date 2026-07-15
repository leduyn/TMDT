package com.anhtin.tmdt.backend.modules.survey.controller;

import com.anhtin.tmdt.backend.modules.common.dto.MessageResponse;
import com.anhtin.tmdt.backend.modules.survey.dto.SurveyAnswerDTO;
import com.anhtin.tmdt.backend.modules.survey.entity.SurveyAnswer;
import com.anhtin.tmdt.backend.modules.survey.entity.SurveyQuestion;
import com.anhtin.tmdt.backend.modules.survey.service.SurveyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/survey")
@CrossOrigin(origins = "*")
public class SurveyController {

    @Autowired
    private SurveyService surveyService; // Trigger JDT LS recompile

    @GetMapping("/questions")
    @PreAuthorize("hasRole('COMPANY')")
    public List<SurveyQuestion> getAllQuestions() {
        return surveyService.getAllQuestions();
    }

    @GetMapping("/questions/active")
    public List<SurveyQuestion> getActiveQuestions(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String context) {
        if (categoryId != null && context != null) {
            return surveyService.getActiveQuestionsByCategoryAndContext(categoryId, context);
        } else if (categoryId != null) {
            return surveyService.getActiveQuestionsByCategory(categoryId);
        } else if (context != null) {
            return surveyService.getActiveQuestionsByContext(context);
        }
        return surveyService.getActiveQuestions();
    }

    @PostMapping("/questions")
    @PreAuthorize("hasRole('COMPANY')")
    public SurveyQuestion createQuestion(@Valid @RequestBody SurveyQuestion question) {
        return surveyService.createQuestion(question);
    }

    @PutMapping("/questions/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public SurveyQuestion updateQuestion(@PathVariable Long id, @Valid @RequestBody SurveyQuestion question) {
        return surveyService.updateQuestion(id, question);
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<?> deleteQuestion(@PathVariable Long id) {
        surveyService.deleteQuestion(id);
        return ResponseEntity.ok(new MessageResponse("Đã xóa câu hỏi"));
    }

    @PostMapping("/agency/{agencyId}/answers")
    public ResponseEntity<?> submitAnswers(@PathVariable Long agencyId, @RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> answers = (List<Map<String, Object>>) body.get("answers");
        List<SurveyAnswer> entities = answers.stream().map(a -> {
            SurveyAnswer sa = new SurveyAnswer();
            sa.setQuestionId(Long.valueOf(a.get("questionId").toString()));
            sa.setAnswer((String) a.get("answer"));
            if (a.containsKey("categoryId") && a.get("categoryId") != null) {
                sa.setCategoryId(Long.valueOf(a.get("categoryId").toString()));
            }
            return sa;
        }).toList();
        surveyService.submitAnswers(agencyId, entities);
        return ResponseEntity.ok(new MessageResponse("Đã gửi câu trả lời khảo sát"));
    }

    @GetMapping("/agency/{agencyId}/answers")
    @PreAuthorize("hasAnyRole('COMPANY', 'ADMIN')")
    public List<SurveyAnswerDTO> getAgencyAnswers(
            @PathVariable Long agencyId,
            @RequestParam(required = false) Long categoryId) {
        if (categoryId != null) {
            return surveyService.getAgencyAnswersByCategory(agencyId, categoryId);
        }
        return surveyService.getAgencyAnswers(agencyId);
    }

    @GetMapping("/answers/stats")
    @PreAuthorize("hasRole('COMPANY')")
    public List<Map<String, Object>> getAnswerStats() {
        return surveyService.getAnswerStats();
    }
}
