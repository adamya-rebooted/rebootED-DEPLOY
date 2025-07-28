package rebootedmvp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import rebootedmvp.User;
import rebootedmvp.exception.UnauthorizedAccessException;
import rebootedmvp.repository.CourseRepository;

/**
 * Centralized authorization service that handles access control logic.
 * Uses existing CourseRepository methods to verify user permissions.
 */
@Service
public class AuthorizationService {

    private static final Logger logger = LoggerFactory.getLogger(AuthorizationService.class);

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private AuthenticationContextService authContextService;

    /**
     * Requires that the current user has access to the specified course.
     * Access is granted if the user is either a teacher or student of the course.
     * 
     * @param courseId The ID of the course to check access for
     * @throws UnauthorizedAccessException if the user doesn't have access
     */
    public void requireCourseAccess(Long courseId) throws UnauthorizedAccessException {
        User currentUser = authContextService.getCurrentUser();
        requireCourseAccess(courseId, currentUser);
    }

    /**
     * Requires that the specified user has access to the specified course.
     * Access is granted if the user is either a teacher or student of the course.
     * 
     * @param courseId The ID of the course to check access for
     * @param user     The user to check access for
     * @throws UnauthorizedAccessException if the user doesn't have access
     */
    public void requireCourseAccess(Long courseId, User user) throws UnauthorizedAccessException {
        logger.debug("Checking course access for user {} on course {}", user.getSupabaseUserId(), courseId);

        if (!hasCourseAccess(courseId, user)) {
            logger.warn("User {} denied access to course {}", user.getSupabaseUserId(), courseId);
            throw new UnauthorizedAccessException(
                    String.format("User does not have access to course %d", courseId));
        }

        logger.debug("User {} granted access to course {}", user.getSupabaseUserId(), courseId);
    }

    /**
     * Requires that the current user is a teacher of the specified course.
     * 
     * @param courseId The ID of the course to check teacher access for
     * @throws UnauthorizedAccessException if the user is not a teacher
     */
    public void requireTeacherAccess(Long courseId) throws UnauthorizedAccessException {
        User currentUser = authContextService.getCurrentUser();
        requireTeacherAccess(courseId, currentUser);
    }

    /**
     * Requires that the specified user is a teacher of the specified course.
     * 
     * @param courseId The ID of the course to check teacher access for
     * @param user     The user to check teacher access for
     * @throws UnauthorizedAccessException if the user is not a teacher
     */
    public void requireTeacherAccess(Long courseId, User user) throws UnauthorizedAccessException {
        logger.debug("Checking teacher access for user {} on course {}", user.getSupabaseUserId(), courseId);

        if (!isTeacherOfCourse(courseId, user)) {
            logger.warn("User {} denied teacher access to course {}", user.getSupabaseUserId(), courseId);
            throw new UnauthorizedAccessException(
                    String.format("User does not have teacher access to course %d", courseId));
        }

        logger.debug("User {} granted teacher access to course {}", user.getSupabaseUserId(), courseId);
    }

    /**
     * Checks if the current user has access to the specified course.
     * 
     * @param courseId The ID of the course to check access for
     * @return true if the user has access, false otherwise
     */
    public boolean hasCourseAccess(Long courseId) {
        try {
            User currentUser = authContextService.getCurrentUser();
            return hasCourseAccess(courseId, currentUser);
        } catch (Exception e) {
            logger.debug("Unable to check course access: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Checks if the specified user has access to the specified course.
     * 
     * @param courseId The ID of the course to check access for
     * @param user     The user to check access for
     * @return true if the user has access, false otherwise
     */
    public boolean hasCourseAccess(Long courseId, User user) {
        if (user == null || courseId == null) {
            return false;
        }

        try {
            // Check if course exists first
            if (!courseRepository.existsById(courseId)) {
                logger.debug("Course {} does not exist", courseId);
                return false;
            }

            // User has access if they are either a teacher or student
            boolean isTeacher = courseRepository.isUserTeacherOfCourse(courseId, user.getId());
            boolean isStudent = courseRepository.isUserStudentOfCourse(courseId, user.getId());

            logger.debug("User {} access to course {}: teacher={}, student={}",
                    user.getSupabaseUserId(), courseId, isTeacher, isStudent);

            return isTeacher || isStudent;

        } catch (Exception e) {
            logger.error("Error checking course access for user {} on course {}: {}",
                    user.getSupabaseUserId(), courseId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Checks if the current user is a teacher of the specified course.
     * 
     * @param courseId The ID of the course to check teacher access for
     * @return true if the user is a teacher, false otherwise
     */
    public boolean isTeacherOfCourse(Long courseId) {
        try {
            User currentUser = authContextService.getCurrentUser();
            return isTeacherOfCourse(courseId, currentUser);
        } catch (Exception e) {
            logger.debug("Unable to check teacher access: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Checks if the specified user is a teacher of the specified course.
     * 
     * @param courseId The ID of the course to check teacher access for
     * @param user     The user to check teacher access for
     * @return true if the user is a teacher, false otherwise
     */
    public boolean isTeacherOfCourse(Long courseId, User user) {
        if (user == null || courseId == null) {
            return false;
        }

        try {
            // Check if course exists first
            if (!courseRepository.existsById(courseId)) {
                logger.debug("Course {} does not exist", courseId);
                return false;
            }

            return courseRepository.isUserTeacherOfCourse(courseId, user.getId());

        } catch (Exception e) {
            logger.error("Error checking teacher access for user {} on course {}: {}",
                    user.getSupabaseUserId(), courseId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Checks if the specified user is a student of the specified course.
     * 
     * @param courseId The ID of the course to check student access for
     * @param user     The user to check student access for
     * @return true if the user is a student, false otherwise
     */
    public boolean isStudentOfCourse(Long courseId, User user) {
        if (user == null || courseId == null) {
            return false;
        }

        try {
            // Check if course exists first
            if (!courseRepository.existsById(courseId)) {
                logger.debug("Course {} does not exist", courseId);
                return false;
            }

            return courseRepository.isUserStudentOfCourse(courseId, user.getId());

        } catch (Exception e) {
            logger.error("Error checking student access for user {} on course {}: {}",
                    user.getSupabaseUserId(), courseId, e.getMessage(), e);
            return false;
        }
    }

    public String getCurrentSupabaseUserId() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtToken) {
            Jwt jwt = jwtToken.getToken();
            return jwt.getClaimAsString("sub");
        }
        throw new RuntimeException("User not authenticated");
    }

}