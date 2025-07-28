package rebootedmvp;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.Table;

/**
 * An abstract interface to represent a user, which can be either a learning and
 * development professional or a different employee.
 */

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "users")
public abstract class User {

    @Column(unique = true, nullable = false)
    protected String username;

    @Column(name = "user_type", nullable = false)
    protected User.UserType userType;

    @Column(name = "full_name")
    protected String fullName;

    @Column(name = "email")
    protected String email;

    @Column(name = "created_at", updatable = false)
    protected LocalDateTime createdAt;

    @Column(name = "updated_at")
    protected LocalDateTime updatedAt;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    @Column(name = "supabase_user_id", unique = true, nullable = false)
    protected String supabaseUserId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSupabaseUserId() {
        return supabaseUserId;
    }

    public void setSupabaseUserId(String supabaseUserId) {
        this.supabaseUserId = supabaseUserId;
    }

    /**
     * An enumeration to represent either a learning & development user or an
     * employee
     */
    public static enum UserType {
        LDUser,
        EmployeeUser
    }

    /**
     * Returns the username of the user
     */
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    /**
     * Returns the type of the user
     */
    public UserType getUserType() {
        return userType;
    }

    public void setUserType(UserType userType) {
        this.userType = userType;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    /**
     * Returns the names of the courses that the user has access to
     */
    public abstract List<String> getCourseNames();

    /**
     * Returns true iff the user has access to the course named 'course' Note:
     * If 'course' does not exist, hasAccess(course) must return false
     */
    public abstract boolean hasAccess(String course);

    /**
     * Return the course entitled 'courseName' if the user has permission to
     * access it Throws: InaccessibleCourseException if the user doesn't have
     * permission to access it. Throws: CourseDoesNotExistException if
     * 'courseName' doesn't exist
     */
    public abstract Course getCourse(String courseName) throws InaccessibleCourseException, CourseDoesNotExistException;

    /**
     * Returns the progress of the user through course entitled 'courseName'.
     * Throws: InaccessibleCourseException if the user does not have access to
     * the course.
     */
    public double getProgress(String courseName) throws InaccessibleCourseException {
        return getCourse(courseName).getProgress(this);
    }

    public String getEmail() {
        return email;
    };

    public void setEmail(String email) {
        this.email = email;
    }

}
