package rebootedmvp.domain.impl;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import rebootedmvp.Course;
import rebootedmvp.Module;
import rebootedmvp.UnknownUserException;
import rebootedmvp.User;
import rebootedmvp.exception.CoursePublishedException;

/**
 * JPA Entity implementation of Course interface for database persistence.
 * This replaces the in-memory CourseImpl with proper database mapping.
 */
@Entity
// @Table(name = "courses")
// @DiscriminatorValue("COURSE")
public class CourseEntityImpl extends Course {

    public CourseEntityImpl(String title, String body) {
        this.title = title;
        this.body = body;
        this.isPublished = false;
    }

    // ⚠️ Required by JPA — but not usable by normal code
    @Deprecated
    protected CourseEntityImpl() {
        // JPA only
        this.isPublished = false;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Course interface methods
    @Override
    public Module create(Long ignored, String title, String body) {
        return new ModuleEntityImpl(title, body, this);
    }

    @Override
    public Set<User> getTeachers() {
        // Convert UserProfileImpl to User interface
        Set<User> userSet = new HashSet<>();
        for (User userProfile : teachers) {
            userSet.add(userProfile);
        }
        return userSet;
    }

    @Override
    public Set<User> getStudents() {
        // Convert UserProfileImpl to User interface
        Set<User> userSet = new HashSet<>();
        for (User userProfile : students) {
            userSet.add(userProfile);
        }
        return userSet;
    }

    public void setTeachers(Set<User> teachers) {
        this.teachers = teachers;
    }

    public void setStudents(Set<User> students) {

        this.students = students;
    }

    @Override
    public double getProgress(User user) throws UnknownUserException {
        // TODO: Implement actual progress calculation based on module completion
        return 0.0;
    }

    @Override
    public List<List<Boolean>> getCompletion(User user) throws UnknownUserException {
        // TODO: Implement completion tracking
        throw new UnsupportedOperationException("Completion tracking not yet implemented");
    }

    @Override
    public boolean addStudent(User user) {
        if (user != null) {
            return students.add(user);
        }
        return false;
    }

    @Override
    public boolean removeStudent(User user) {
        if (user != null) {
            return students.remove(user);
        }
        return false;
    }

    @Override
    public boolean isStudent(User user) {
        return user != null && students.contains(user);

    }

    @Override
    public boolean addTeacher(User user) {
        if (user != null) {
            return teachers.add(user);
        }

        return false;
    }

    @Override
    public boolean removeTeacher(User user) {
        if (user != null) {
            return teachers.remove(user);
        }
        return false;

    }

    @Override
    public boolean isTeacher(User user) {
        return user != null && teachers.contains(user);

    }

    // InfoContainer interface methods
    @Override
    public void addSub(Module newMod) {
        modules.put(newMod.getId(), newMod);
        newMod.setCourseId(this.id);
    }

    @Override
    public List<Module> getAll() {
        return new ArrayList<>(modules.values());
    }

    @Override
    public boolean removeSub(Long moduleId) {
        Module removed = modules.remove(moduleId);
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