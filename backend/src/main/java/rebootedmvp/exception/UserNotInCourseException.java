package rebootedmvp.exception;

/**
 * Exception thrown when the backend tries to access a UserProgress that does
 * not exist
 * -This should be thrown regardless of whther the error is the the user doesn't
 * exist,
 * the course doesn't exist, or the user is not enrolled in the course.
 */
public class UserNotInCourseException extends RuntimeException {

    public UserNotInCourseException(String user, String courseName) {
        super("User " + user + " progress through course " + courseName + " cannot be found");
    }

    public UserNotInCourseException(String supabaseUserId, Long courseId) {
        super("The user given does is not enrolled in the course given");
    }
}