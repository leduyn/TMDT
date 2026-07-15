package com.anhtin.tmdt.backend.modules.survey.dto;

import com.anhtin.tmdt.backend.modules.survey.entity.SurveyAnswer;

public class SurveyAnswerDTO {
    private Long id;
    private Long questionId;
    private String question;
    private String questionType;
    private String answer;
    private Long categoryId;
    private String createdAt;

    public SurveyAnswerDTO() {}

    public SurveyAnswerDTO(SurveyAnswer entity, String questionText, String questionType) {
        this.id = entity.getId();
        this.questionId = entity.getQuestionId();
        this.question = questionText;
        this.questionType = questionType;
        this.answer = entity.getAnswer();
        this.categoryId = entity.getCategoryId();
        this.createdAt = entity.getCreatedAt() != null ? entity.getCreatedAt().toString() : null;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long questionId) { this.questionId = questionId; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }
    public String getAnswer() { return answer; }
    public void setAnswer(String answer) { this.answer = answer; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
