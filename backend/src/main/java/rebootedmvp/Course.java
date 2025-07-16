package rebootedmvp;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.MapKey;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Inheritance(strategy = InheritanceType.JOINED) // or JOINED, TABLE_PER_CLASS
// @DiscriminatorColumn(name = "course_type", discriminatorType =
// DiscriminatorType.STRING)
@Table(name = "courses")
public abstract class Course implements InfoContainer<Module> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @Column(nullable = false)
    protected String title;

    @Column(columnDefinition = "TEXT")
    protected String body;

    @Column(name = "created_at", updatable = false)
    protected LocalDateTime createdAt;

    @Column(name = "updated_at")
    protected LocalDateTime updatedAt;

    // One-to-Many relationship with ModuleEntityImpl
    // @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval =
    // true, fetch = FetchType.LAZY)

    // @MapKey(name = "id")
    // instead of Map<Long,Module>:
    // Note: No cascade/orphanRemoval - deletion handled manually in service layer
    @OneToMany
    @OnDelete(action = OnDeleteAction.CASCADE)
    @MapKey(name = "id") // ← use the Module's `@Id`
    @JoinColumn(name = "course_id") // ← foreign key in MODULE table
    protected Map<Long, Module> modules = new HashMap<>();

    // Many-to-Many relationship for teachers
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "course_teachers", joinColumns = @JoinColumn(name = "course_id"), inverseJoinColumns = @JoinColumn(name = "supabase_user_id"))
    protected Set<User> teachers = new HashSet<>();

    // Many-to-Many relationship for students
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "course_students", joinColumns = @JoinColumn(name = "course_id"), inverseJoinColumns = @JoinColumn(name = "supabase_user_id"))
    protected Set<User> students = new HashSet<>();

    /**
     * Returns A set of all L&D users who have access to the course Note: the
     * sets returned by get_teachers() and get_students() must be disjoint and
     * their union must be allUsers
     */
    public abstract Set<User> getTeachers();

    /**
     * Returns A set of all student users who have access to the course Note:
     * the sets returned by get_teachers() and get_students() must be disjoint
     * and their union must be allUsers
     */
    public abstract Set<User> getStudents();

    /**
     * Returns the progress of user 'user' through this course. It must take
     * into account the progress of the user through all the modules
     * proportional to each module's weight. Example: If module A has weight 17
     * and is 80% complete and module B has weight 12 and is 50% complete then
     * getProgress must return within a rounding error of (.8 * 17 + .5 * 12)/27
     * or ~.72592 Throws: UnknownUserException if 'user' does not have access to
     * the course.
     *
     */
    public abstract double getProgress(User user) throws UnknownUserException;

    /**
     * Returns an ArrayList of ArrayLists of Booleans where each Boolean
     * represents whether a specific content has been completed. The outer
     * ArrayList is the module and the inner ArrayList is the content within
     * that module. Example: getCompletion(user)[0][2] is whether the 2nd
     * content of the 0th module has been completed. Throws:
     * UnknownUserException if 'user' does not have access to the course.
     */
    public abstract List<List<Boolean>> getCompletion(User user) throws UnknownUserException;

    /**
     * Adds the user 'user' as a student of this course. If user was already a
     * student, this method does nothing. If 'user' is successfully added as a
     * student return true. Otherwise return false. Requires: user is not null
     * Note: if 'user' is a teacher, they will not be added as a student
     */
    public abstract boolean addStudent(User user);

    /**
     * Removes student user 'user' from being a student. Returns true if done
     * successfully Returns false if 'user' is not a student of this course and
     * the student collection remains unchanged
     */
    public abstract boolean removeStudent(User user);

    /**
     * Returns whether or not 'user' is a student in this course
     */
    public abstract boolean isStudent(User user);

    /**
     * Adds the user 'user' as a teacher of this course. If user was already a
     * teacher, this method does nothing. If 'user' is successfully added as a
     * teacher return true. Otherwise return false. Requires: user is not null
     * Note: if 'user' is a student, they will not be added as a teacher
     */
    public abstract boolean addTeacher(User user);

    /**
     * Removes teacher user 'user' from being a teacher. Returns true if done
     * successfully Returns false if 'user' is not a teacher of this course and
     * the teacher collection remains unchanged
     */
    public abstract boolean removeTeacher(User user);

    /**
     * Returns whether or not 'user' is a teacher in this course
     */
    public abstract boolean isTeacher(User user);

}
