package rebootedmvp.domain.impl;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinColumns;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "progress_pair")
public class PairImpl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double left_value;

    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "supabase_user_id", referencedColumnName = "supabaseUserId"),
            @JoinColumn(name = "course_id", referencedColumnName = "courseId")
    })
    private UserProgress userCourseProgress;

    @OneToMany(mappedBy = "pair", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BooleanEntry> right = new ArrayList<>();

    public PairImpl() {
    }

    public PairImpl(Double left_value, List<BooleanEntry> right) {
        this.left_value = left_value;
        this.right = right;

    }

    public Long getId() {
        return id;
    }

    public Double getLeft_value() {
        return left_value;
    }

    public void setLeft_value(Double left_value) {
        this.left_value = left_value;
    }

    public UserProgress getUserCourseProgress() {
        return userCourseProgress;
    }

    public void setUserCourseProgress(UserProgress userCourseProgress) {
        this.userCourseProgress = userCourseProgress;
    }

    public List<BooleanEntry> getRight() {
        return right;
    }

    public void setRight(List<BooleanEntry> right) {
        this.right = right;

    }

    public Boolean getBool(int contentNum) {
        return right.get(contentNum).getValue();
    }

    public void setBool(int contentNum, boolean newState) {
        right.get(contentNum).setValue(newState);
    }
}