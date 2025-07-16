package rebootedmvp;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKey;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Inheritance(strategy = InheritanceType.JOINED) // or JOINED, TABLE_PER_CLASS
@Table(name = "modules")
public abstract class Module implements InfoContainer<Content> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @Column(name = "course_id", nullable = false)
    protected Long courseId;

    @Column(nullable = false)
    protected String title;

    @Column(columnDefinition = "TEXT")
    protected String body;

    @Column(nullable = false)
    protected double weight = 1.0;

    @Column(name = "created_at", updatable = false)
    protected LocalDateTime createdAt;

    @Column(name = "updated_at")
    protected LocalDateTime updatedAt;

    // One-to-Many relationship with ContentEntityImpl
    // Note: No cascade/orphanRemoval - deletion handled manually in service layer
    @OneToMany
    @OnDelete(action = OnDeleteAction.CASCADE)
    @MapKey(name = "id") // ← use the Module's `@Id`
    @JoinColumn(name = "module_id") // ← foreign key in MODULE table
    protected Map<Long, Content> contentItems = new HashMap<>();

    /**
     * Returns the weight of this module for user 'user'. Weight is the metric
     * by which a course must combine progress between modules
     */
    public abstract double getWeight();

    /**
     * Returns the Id of the course that this module belongs to
     */
    public abstract Long getCourseId();

    /**
     * Sets the courseId that this module belongs to.
     * Note: This should likely only be called by services looking to add/remove
     * modules from courses.
     */
    public abstract void setCourseId(Long courseId);

    public Map<Long, Content> getContents() {
        return Map.copyOf(contentItems);
    }
}