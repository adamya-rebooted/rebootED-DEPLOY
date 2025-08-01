package rebootedmvp.exception;

/**
 * Exception thrown when the backend tries to change an element of a course that
 * it is not allowed to once a course has been published.
 */
public class CoursePublishedException extends RuntimeException {

    public CoursePublishedException(String functionName) {
        super(functionName + " cannot be called once a course has been published");
    }

}