package rebootedmvp.exception;

/**
 * Exception thrown when an authenticated user attempts to access a resource they don't have permission for.
 * This occurs when:
 * - User tries to access a course they're not enrolled in or teaching
 * - User tries to perform an operation requiring elevated privileges (e.g., teacher-only actions)
 * - User tries to access modules/content from courses they don't have access to
 */
public class UnauthorizedAccessException extends RuntimeException {
    
    public UnauthorizedAccessException(String message) {
        super(message);
    }
    
    public UnauthorizedAccessException(String message, Throwable cause) {
        super(message, cause);
    }
}