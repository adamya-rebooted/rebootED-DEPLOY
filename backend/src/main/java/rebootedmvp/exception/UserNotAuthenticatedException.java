package rebootedmvp.exception;

/**
 * Exception thrown when an operation requires an authenticated user but none is found.
 * This typically occurs when:
 * - No authentication is present in the security context
 * - The JWT token is invalid or malformed
 * - The authenticated user is not found in the backend database
 */
public class UserNotAuthenticatedException extends RuntimeException {
    
    public UserNotAuthenticatedException(String message) {
        super(message);
    }
    
    public UserNotAuthenticatedException(String message, Throwable cause) {
        super(message, cause);
    }
}