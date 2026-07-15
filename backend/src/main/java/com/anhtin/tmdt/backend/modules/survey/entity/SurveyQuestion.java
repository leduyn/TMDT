package com.anhtin.tmdt.backend.modules.survey.entity;

import com.anhtin.tmdt.backend.modules.product.entity.Category;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "survey_questions")
public class SurveyQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String question;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(columnDefinition = "TEXT")
    private String options;

    private boolean active = true;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "global_question")
    private Boolean globalQuestion = false;

    @Column(length = 50)
    private String context = "DANG_KY";

    @JsonIgnore
    @ManyToMany
    @JoinTable(
        name = "survey_question_categories",
        joinColumns = @JoinColumn(name = "question_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @Transient
    private List<Long> categoryIds;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getOptions() { return options; }
    public void setOptions(String options) { this.options = options; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public boolean isGlobalQuestion() { return globalQuestion != null && globalQuestion; }
    public void setGlobalQuestion(Boolean globalQuestion) { this.globalQuestion = globalQuestion; }
    public Boolean getGlobalQuestion() { return globalQuestion; }
    public String getContext() { return context; }
    public void setContext(String context) { this.context = context; }
    public Set<Category> getCategories() { return categories; }
    public void setCategories(Set<Category> categories) { this.categories = categories; }
    public List<Long> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(List<Long> categoryIds) { this.categoryIds = categoryIds; }
}
