package rebootedmvp;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import rebootedmvp.domain.impl.CourseImpl;
import rebootedmvp.dto.NewRosterDTO;

// import rebootedmvp.dto.CourseDTO;
/**
 * This class is meant to represent a collection of courses. It's primary
 * purpose is to avoid exposure to the user class. That is, if a user needs
 * access to a Course object directly, it must make an API call to roster to
 * first check if it should have access
 */
public class Roster implements InfoContainer<Course> {

    HashMap<Long, Course> allCourses;
    String title;
    String body;
    Long id;

    public Roster(NewRosterDTO newData) {
        allCourses = new HashMap<>();
        this.title = newData.getTitle();
        this.body = newData.getBody();
    }

    public Roster(Long id, String title, String body) {
        allCourses = new HashMap<>();
        this.id = id;
        this.title = title;
        this.body = body;
    }

    /**
     * Returns whether or not user 'user' has access to the course entitled
     * 'course'. If multiple courses named 'course' exist, this will return
     * whether or not 'user' has access to a random one Throws:
     * CourseDoesNotExistException if no course named 'course' exists.
     */
    public boolean userCanAccess(User user, Long course) throws CourseDoesNotExistException {
        Course curCourse = allCourses.get(course);
        try {
            return (curCourse.isStudent(user) || curCourse.isTeacher(user));
        } catch (Exception e) {
            throw new CourseDoesNotExistException(course);
        }
    }

    public Long generateKey() {
        final AtomicLong idGenerator = new AtomicLong(1);
        return idGenerator.getAndIncrement();
    }

    @Override
    public void addSub(Long id, Course c) {
        Long newKey;
        while (true) {
            newKey = generateKey();
            if (!allCourses.containsKey(newKey)) {
                allCourses.put(generateKey(), c);
                break;
            }
        }
        // return newKey;
    }

    @Override
    public List<Course> getAll() {
        return new ArrayList<>(allCourses.values());
    }

    // @Override
    // public CourseDTO createDTO(Course c) {
    //     return new CourseDTO(c);
    // }
    @Override
    public String getTitle() {
        return title;
    }

    @Override
    public void setTitle(String newTitle) {
        title = newTitle;
    }

    @Override
    public String getBody() {
        return body;
    }

    @Override
    public void setBody(String newBody) {
        body = newBody;
    }

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public Course create(Long id, String title, String body) {
        return new CourseImpl(id, title, body);
    }

    @Override
    public boolean removeSub(Long removeId) {
        throw new UnsupportedOperationException("Not supported yet.");
    }
}
