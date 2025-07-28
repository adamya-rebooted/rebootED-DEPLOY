package rebootedmvp.domain.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import rebootedmvp.Course;
import rebootedmvp.CourseDoesNotExistException;
import rebootedmvp.InaccessibleCourseException;
import rebootedmvp.User;
import rebootedmvp.dto.NewTeacherDTO;

@Entity
@Table(name = "teachers")
public class TeacherImpl extends UserProfileImpl {

    @ManyToMany
    @JoinTable(name = "teacher_courses", joinColumns = @JoinColumn(name = "teacher_id"), inverseJoinColumns = @JoinColumn(name = "course_id"))
    private List<Course> courses = new ArrayList<>();

    public TeacherImpl() {
        this.userType = UserType.LDUser;
    }

    public TeacherImpl(String supabaseUserId, NewTeacherDTO newUserDTO) {
        super(newUserDTO.getUsername(), supabaseUserId, User.UserType.LDUser, newUserDTO.getEmail());
    }

    public TeacherImpl(String username, String supabaseUserId, String email, String fullName) {
        super(username, supabaseUserId, User.UserType.LDUser, email, fullName);
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @Override
    public List<String> getCourseNames() {
        List<String> names = new ArrayList<>();
        for (Course c : courses) {
            names.add(c.getTitle());
        }
        return names;
    }

    @Override
    public boolean hasAccess(String courseName) {
        return courses.stream().anyMatch(c -> c.getTitle().equalsIgnoreCase(courseName));
    }

    @Override
    public Course getCourse(String courseName) throws InaccessibleCourseException, CourseDoesNotExistException {
        return courses.stream()
                .filter(c -> c.getTitle().equalsIgnoreCase(courseName))
                .findFirst()
                .orElseThrow(() -> new InaccessibleCourseException("No access to course: " + courseName));
    }

    public List<Course> getCourses() {
        return courses;
    }

    public void addCourse(Course course) {
        if (!courses.contains(course)) {
            courses.add(course);
        }
    }

    public void removeCourse(Course course) {
        courses.remove(course);
    }
}
