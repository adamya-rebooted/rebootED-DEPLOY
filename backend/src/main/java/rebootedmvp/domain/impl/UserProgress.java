package rebootedmvp.domain.impl;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_course_progress")
public class UserProgress {

    @EmbeddedId
    private UserProgressId id;

    @Column(name = "total_progress", nullable = false)
    private double totalProgress;

    @OneToMany(mappedBy = "userCourseProgress", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PairImpl> progress;

    public UserProgress() {
    }

    public UserProgress(UserProgressId id, double totalProgress, List<PairImpl> progress) {
        this.id = id;
        this.totalProgress = totalProgress;
        this.progress = progress;
    }

    public UserProgressId getId() {
        return id;
    }

    public void setId(UserProgressId id) {
        this.id = id;
    }

    public double getTotalProgress() {
        return totalProgress;
    }

    public void setTotalProgress(double totalProgress) {
        this.totalProgress = totalProgress;
    }

    public List<PairImpl> getProgress() {
        return progress;
    }

    public void setProgress(List<PairImpl> progress) {
        this.progress = progress;
    }
}
