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
    private Double left;

    @ManyToOne
    @JoinColumns({
            @JoinColumn(name = "supabase_user_id", referencedColumnName = "supabaseUserId"),
            @JoinColumn(name = "course_id", referencedColumnName = "courseId")
    })
    private UserCourseProgress userCourseProgress;

    @OneToMany(mappedBy = "pair", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BooleanEntry> right = new ArrayList<>();

    public PairImpl() {
    }

    public PairImpl(Double left, List<BooleanEntry> right) {
        this.left = left;
        this.right = right;

    }

    public Long getId() {
        return id;
    }

    public Double getLeft() {
        return left;
    }

    public void setLeft(Double left) {
        this.left = left;
    }

    public UserCourseProgress getUserCourseProgress() {
        return userCourseProgress;
    }

    public void setUserCourseProgress(UserCourseProgress userCourseProgress) {
        this.userCourseProgress = userCourseProgress;
    }

    public List<BooleanEntry> getRight() {
        return right;
    }

    public void setRight(List<BooleanEntry> right) {
        this.right = right;

    }
}