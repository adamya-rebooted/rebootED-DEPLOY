package rebootedmvp.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import rebootedmvp.Course;
import rebootedmvp.CourseMapper;
import rebootedmvp.domain.impl.ContentEntityImpl;
import rebootedmvp.domain.impl.CourseEntityImpl;
import rebootedmvp.domain.impl.ModuleEntityImpl;
import rebootedmvp.dto.CourseDTO;
import rebootedmvp.dto.NewCourseDTO;
import rebootedmvp.dto.NewRosterDTO;
import rebootedmvp.repository.ContentRepository;
import rebootedmvp.repository.CourseRepository;
import rebootedmvp.repository.ModuleRepository;
import rebootedmvp.User;
import rebootedmvp.exception.CoursePublishedException;
import rebootedmvp.exception.UserNotAuthenticatedException;
import rebootedmvp.service.AuthenticationContextService;

@Service
@Transactional
public class RosterService {

    private static final Logger logger = LoggerFactory.getLogger(RosterService.class);

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private AuthenticationContextService authenticationContextService;

    /**
     * Creates a new roster (for API compatibility - returns a constant ID)
     * In the database-backed implementation, this is just a no-op since we manage
     * courses directly
     */
    public Long addToHigh(NewRosterDTO newData, java.util.function.Function<NewRosterDTO, Object> constructor) {
        logger.debug("RosterService.addToHigh() called - roster concept is simplified in database implementation");
        // Return a constant roster ID since we're managing courses directly
        return 1L;
    }

    /**
     * Returns a list of all courses (what was previously "all courses in all
     * rosters")
     */
    @Transactional(readOnly = true)
    public List<CourseDTO> findAll() {
        logger.debug("RosterService.findAll() called - returning all courses");
        return mapToDTO(courseRepository.findAll().stream()
                .map(CourseMapper::toDomain)
                .toList());

    }

    /**
     * Returns the course with id given by 'courseId'
     */
    @Transactional(readOnly = true)
    public CourseDTO getById(Long courseId) {
        logger.debug("RosterService.getById({}) called - returning course with called id (roster ID ignored)",
                courseId);
        Course c = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Course not found with id: " + courseId));
        return new CourseDTO(c);
    }

    /**
     * Returns a specific course (roster ID is ignored, course ID is used directly)
     */
    @Transactional(readOnly = true)
    public CourseDTO getById(Long rosterId, Long courseId) {
        logger.debug("RosterService.getById({}, {}) called - getting specific course", rosterId, courseId);

        Optional<Course> courseOpt = (courseRepository.findById(courseId)).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + courseId);
        }

        return new CourseDTO(courseOpt.get());
    }

    /**
     * Adds a new course (roster ID is ignored since we manage courses directly)
     * Automatically enrolls the course creator as a teacher
     */
    public Long addNew(Long rosterId, NewCourseDTO newCourseDTO) {
        logger.debug("RosterService.addNew({}, {}) called", rosterId, newCourseDTO.getTitle());

        if (newCourseDTO.getTitle() == null || newCourseDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("The title must be supplied in the DTO");
        }

        CourseEntityImpl course = new CourseEntityImpl(
                newCourseDTO.getTitle().trim(),
                newCourseDTO.getBody());

        // Get the current authenticated user and add them as a teacher
        try {
            User currentUser = authenticationContextService.getCurrentUser();
            course.addTeacher(currentUser);
            logger.debug("Added course creator {} as teacher to course {}",
                    currentUser.getSupabaseUserId(), newCourseDTO.getTitle());
        } catch (UserNotAuthenticatedException e) {
            logger.warn("Could not add creator as teacher - user not authenticated: {}", e.getMessage());
            // Continue with course creation but without auto-enrollment
        }

        CourseEntityImpl savedCourse = courseRepository.save(course);
        logger.info("Created course with ID: {} and auto-enrolled creator as teacher", savedCourse.getId());
        return savedCourse.getId();
    }

    /**
     * Updates a course (roster ID is ignored, course ID is used directly)
     */
    public void update(Long rosterId, Long courseId, NewCourseDTO updateDTO) {
        logger.debug("RosterService.update({}, {}, {}) called", rosterId, courseId, updateDTO.getTitle());

        Optional<Course> courseOpt = courseRepository.findById(courseId).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + courseId);
        }

        Course course = courseOpt.get();
        if (course.isPublished()) {
            throw new CoursePublishedException("update");
        }

        if (updateDTO.getTitle() != null && !updateDTO.getTitle().trim().isEmpty()) {
            course.setTitle(updateDTO.getTitle().trim());
        }
        if (updateDTO.getBody() != null) {
            course.setBody(updateDTO.getBody());
        }

        courseRepository.save(CourseMapper.toEntity(course));
        logger.info("Updated course with ID: {}", courseId);
    }

    /**
     * Deletes a course using manual cascade deletion (roster ID is ignored, course
     * ID is used directly)
     */
    public boolean delete(Long rosterId, Long courseId) {
        logger.debug("RosterService.delete({}, {}) called", rosterId, courseId);

        if (!courseRepository.existsById(courseId)) {
            return false;
        }

        // MANUAL CASCADE: Delete in dependency order (Content → Modules → Course)
        logger.debug("Starting manual cascade deletion for course ID: {}", courseId);

        // 1. Find all modules for this course
        List<ModuleEntityImpl> modules = moduleRepository.findByCourseId(courseId);
        logger.debug("Found {} modules to delete for course {}", modules.size(), courseId);

        // 2. Delete content and modules
        int totalContentDeleted = 0;
        for (ModuleEntityImpl module : modules) {
            // Delete all content for this module
            List<ContentEntityImpl> contentList = contentRepository.findByModuleId(module.getId());
            for (ContentEntityImpl content : contentList) {
                contentRepository.deleteById(content.getId());
                totalContentDeleted++;
            }
            contentRepository.flush();
            logger.debug("Deleted {} content items for module {}", contentList.size(), module.getId());

            // Delete the module
            moduleRepository.deleteById(module.getId());
            logger.debug("Deleted module with ID: {}", module.getId());
        }
        moduleRepository.flush();

        // 3. Finally delete the course
        courseRepository.deleteById(courseId);
        logger.info("Deleted course with ID: {} (deleted {} modules and {} content items)",
                courseId, modules.size(), totalContentDeleted);
        return true;
    }

    private static List<CourseDTO> mapToDTO(List<Course> toMap) {
        return toMap.stream().map(
                elem -> new CourseDTO(elem)).toList();
    }

}
