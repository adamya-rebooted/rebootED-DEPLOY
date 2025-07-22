package rebootedmvp.domain.impl;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import rebootedmvp.Content;
import rebootedmvp.Module;

/**
 * JPA Entity implementation of Content interface for database persistence.
 * This replaces the in-memory TextContentImpl and QuestionContentImpl with
 * proper database mapping.
 */
@Entity
// @Inheritance(strategy = InheritanceType.SINGLE_TABLE)
// @DiscriminatorColumn(name = "content_type", discriminatorType =
// DiscriminatorType.STRING)
// @DiscriminatorValue("CONTENT")

public abstract class ContentEntityImpl extends Content {

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public ContentEntityImpl() {
    }

    public ContentEntityImpl(String title, String body, Module module, ContentType contentType) {
        this.title = title;
        this.body = body;
        this.contentType = contentType; // Set the content type!
        this.moduleId = module.getId();
        this.isComplete = false;
        this.contentType = contentType;
    }

    // Constructor for Question content
    public ContentEntityImpl(String title, String questionText, List<String> options,
            String correctAnswer, Module module, ContentType contentType) {
        this.title = title;
        this.body = questionText; // Set body to questionText for consistency
        // this.questionText = questionText;
        this.contentType = contentType;
        // this.correctAnswer = correctAnswer;
        this.moduleId = module.getId();
        this.isComplete = false;
        this.contentType = contentType;
    }

    public ContentEntityImpl(Content c) {
        this.body = c.getBody();
        this.id = c.getId();
        this.title = c.getTitle();
        // this.questionText = c.getQuestionText(); // Copy questionText field!
        this.contentType = c.getType(); // Copy content type!
        // this.optionText = c.getOptions() != null ? c.getOptions() : new
        // ArrayList<>();
        // this.correctAnswer = c.getCorrectAnswer();
        this.moduleId = c.getModuleId();
        this.isComplete = false;
        this.contentType = c.getType();
    }

    // Content interface methods
    @Override
    public boolean isComplete() {
        // if (getType() == ContentType.Question) {
        // return userAnswer != null && userAnswer.equals(correctAnswer);
        // }
        return isComplete;
    }

    @Override
    public ContentType getType() {
        return contentType != null ? contentType : ContentType.Text; // Return actual type
    }

    // HasID interface methods
    @Override
    public Long getId() {
        return id;
    }

    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public void setTitle(String title) {
        this.title = title;
    }

    @Override
    public String getBody() {
        return body;
    }

    @Override
    public void setBody(String body) {
        this.body = body;
    }

    // Additional getters and setters
    public void setId(Long id) {
        this.id = id;
    }

    @Override
    public void setComplete(boolean complete) {
        this.isComplete = complete;
    }

    @Override
    public Long getModuleId() {
        return moduleId;
    }

    @Override
    public void setModuleId(Long moduleId) {
        this.moduleId = moduleId;
    }

    // public String getQuestionText() {
    // return questionText;
    // }

    // public void setQuestionText(String questionText) {
    // this.questionText = questionText;
    // }

    // @Override
    // public List<String> getOptions() {
    // return new ArrayList<>(optionText);
    // }

    // public void setOptions(List<String> options) {
    // this.optionText = new ArrayList<>(options != null ? options : new
    // ArrayList<>());
    // }

    // @Override
    // public String getCorrectAnswer() {
    // return correctAnswer;
    // }

    // public void setCorrectAnswer(String correctAnswer) {
    // this.correctAnswer = correctAnswer;
    // }

    // public String getUserAnswer() {
    // return userAnswer;
    // }

    // public void setUserAnswer(String userAnswer) {
    // this.userAnswer = userAnswer;
    // }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public ContentType getContentType() {
        return this.contentType;
    }

    public void setContentType(ContentType contentType) {
        this.contentType = contentType;
    }
}
