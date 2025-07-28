package rebootedmvp;

/**
 * Indicates that a user either does not have permission to access a course
 * or that course does not exist
 */
public class InaccessibleCourseException extends RuntimeException {

    /**
     * Create a new InaccessibleCourseException indicating that the user
     * 'username' cannot access the course 'courseName'
     * 
     * Note: This should be thrown regardless of if the course cannot be
     * accessed because of privileges or because the course does not exist
     */
    public InaccessibleCourseException(String username, String courseName) {
        super("User " + username + " cannot access course " + courseName);
    }

    public InaccessibleCourseException(String errorMessage) {
        super(errorMessage);
    }
}