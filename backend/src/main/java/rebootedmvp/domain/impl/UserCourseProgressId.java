package rebootedmvp.domain.impl;

import java.io.Serializable;
import java.util.Objects;

import jakarta.persistence.Embeddable;

@Embeddable
public class UserCourseProgressId implements Serializable {

    private String supabaseUserId;
    private Long courseId;

    public UserCourseProgressId() {
    }

    public UserCourseProgressId(String supabaseUserId, Long courseId) {
        this.supabaseUserId = supabaseUserId;
        this.courseId = courseId;
    }

    // Getters and setters are optional but good practice
    public String getSupabaseUserId() {
        return supabaseUserId;
    }

    public void setSupabaseUserId(String supabaseUserId) {
        this.supabaseUserId = supabaseUserId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof UserCourseProgressId that))
            return false;
        return Objects.equals(supabaseUserId, that.supabaseUserId)
                && Objects.equals(courseId, that.courseId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(supabaseUserId, courseId);
    }
}
