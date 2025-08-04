package rebootedmvp.domain.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import rebootedmvp.Content;
import rebootedmvp.Course;
import rebootedmvp.Module;

/**
 * JPA Entity implementation of Module interface for database persistence.
 * This replaces the in-memory ModuleImpl with proper database mapping.
 */
@Entity
// @DiscriminatorValue("MODULE")
public class ModuleEntityImpl extends Module {

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public ModuleEntityImpl(String title, String body, Long courseId) {
        this.title = title;
        this.body = body;
        this.weight = 1.0;
        this.courseId = courseId;
    }

    public ModuleEntityImpl(String title, String body, Course course) {
        this.title = title;
        this.body = body;
        this.courseId = course.getId();
        this.weight = 1.0;
    }

    public ModuleEntityImpl(String title, String body, Course course, double weight) {
        this.title = title;
        this.body = body;
        this.courseId = course.getId();
        this.weight = weight;
    }

    public ModuleEntityImpl(Module m) {
        this.id = m.getId();
        this.title = m.getTitle();
        this.body = m.getBody();
        this.weight = m.getWeight();
        this.courseId = m.getCourseId();
        this.contentItems = m.getContents();

    }

    // ⚠️ Required by JPA — but not usable by normal code
    @Deprecated
    protected ModuleEntityImpl() {
        // JPA only
    }

    // Module interface methods
    @Override
    public Content create(Long id, String title, String body) {
        return new TextContentImpl(title, body, this.getId());
    }

    public Content create(Long id, String title, String body, Content.ContentType type) {
        switch (type) {
            case MultipleChoiceQuestion:
                return new MultipleChoiceQuestionContentImpl(title, body, new ArrayList<>(), "", this.id);
            case Text:
                return new TextContentImpl(title, body, this.id);
            case Video:
                return new VideoContentImpl(title, body, "", this.id);
            case MatchingQuestion:
                return new MatchingQuestionContentImpl(title, body, new ArrayList<>(), this.id);
            case Image:
                return new ImageContentImpl(title, body, this.id);
            default:
                // Default to TextContent if type is not recognized
                return new TextContentImpl(title, body, this.id);
        }
    }

    @Override
    public double getWeight() {
        return weight;
    }

    @Override
    public Long getCourseId() {
        return courseId;
    }

    @Override
    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    // InfoContainer interface methods
    @Override
    public void addSub(Content contentItem) {
        contentItems.put(contentItem.getId(), contentItem);
    }

    @Override
    public List<Content> getAll() {
        return new ArrayList<>(contentItems.values());
    }

    @Override
    public boolean removeSub(Long contentId) {
        Content removed = contentItems.remove(contentId);
        return removed != null;
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
    public void setTitle(String newTitle) {
        this.title = newTitle;
    }

    @Override
    public String getBody() {
        return body;
    }

    @Override
    public void setBody(String newBody) {
        this.body = newBody;
    }

    // Additional getters and setters for JPA
    public void setId(Long id) {
        this.id = id;
    }

    public void setWeight(double weight) {
        this.weight = weight;
    }

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

}