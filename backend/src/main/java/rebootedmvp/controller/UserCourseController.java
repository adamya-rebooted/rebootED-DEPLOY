package rebootedmvp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rebootedmvp.dto.CourseDTO;
import rebootedmvp.exception.UnauthorizedAccessException;
import rebootedmvp.exception.UserNotAuthenticatedException;
import rebootedmvp.service.CourseService;

/**
 * Controller for user-specific course operations.
 * Provides endpoints to get courses that the current user has access to.
 */
@RestController
@RequestMapping("/api/users/courses")
public class UserCourseController {

    @Autowired
    private CourseService courseService;

    /**
     * Gets all courses that the current authenticated user has access to.
     * This includes courses where the user is either a teacher or student.
     * 
     * @return List of courses accessible to the current user
     */
    @GetMapping
    public ResponseEntity<List<CourseDTO>> getUserCourses() {
        try {
            List<CourseDTO> userCourses = courseService.getUserCourses();
            return ResponseEntity.ok(userCourses);
        } catch (UnauthorizedAccessException | UserNotAuthenticatedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<String> handleUnauthorizedAccess(UnauthorizedAccessException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access denied: " + e.getMessage());
    }
    
    @ExceptionHandler(UserNotAuthenticatedException.class)
    public ResponseEntity<String> handleNotAuthenticated(UserNotAuthenticatedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("Authentication required: " + e.getMessage());
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An error occurred: " + e.getMessage());
    }
}