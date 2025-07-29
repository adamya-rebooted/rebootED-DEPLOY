package rebootedmvp.domain.impl;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import rebootedmvp.Course;
import rebootedmvp.CourseDoesNotExistException;
import rebootedmvp.InaccessibleCourseException;
import rebootedmvp.User;
import rebootedmvp.dto.NewUserDTO;

@Entity
// @DiscriminatorValue("USER")
// @Inheritance(strategy = InheritanceType.SINGLE_TABLE)
// @DiscriminatorColumn(name = "user_type") // optional but recommended
// @Table(name = "user_profiles")
public abstract class UserProfileImpl extends User {

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public UserProfileImpl(String username, String supabaseUserId, User.UserType userType, String email) {
        this.username = username;
        this.userType = userType;
        this.supabaseUserId = supabaseUserId;
        this.email = email;
    }

    public UserProfileImpl(String username, String supabaseUserId, User.UserType userType, String email,
            String fullName) {
        this.username = username;
        this.userType = userType;
        this.supabaseUserId = supabaseUserId;
        this.email = email;
        this.fullName = fullName;
    }

    public UserProfileImpl(String supabaseUserId, NewUserDTO newUserDTO) {
        this.username = newUserDTO.getUsername();
        this.userType = newUserDTO.getUserType();
        this.supabaseUserId = supabaseUserId;
        // this.email = newUserDTO.getEmail();
    }

    // Backward compatibility constructor
    public UserProfileImpl(String username, String id, User.UserType userType) {
        this.username = username;
        this.userType = userType;
    }

    public UserProfileImpl(User user) {
        this.username = user.getUsername();
        this.userType = user.getUserType();
        this.email = user.getEmail();
        this.supabaseUserId = user.getSupabaseUserId();

    }

    // ⚠️ Required by JPA — but not usable by normal code
    protected UserProfileImpl() {
        // JPA only
    }

    @Override
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Override
    public User.UserType getUserType() {
        return userType;
    }

    public void setUserType(User.UserType userType) {
        this.userType = userType;
    }

    @Override
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String name) {
        fullName = name;
    }

    @Override
    public abstract List<String> getCourseNames();

    @Override
    public abstract boolean hasAccess(String course);

    @Override
    public Course getCourse(String courseName) throws InaccessibleCourseException, CourseDoesNotExistException {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'getCourse'");
    }
}