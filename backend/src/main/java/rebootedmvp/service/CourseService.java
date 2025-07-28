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
import rebootedmvp.InfoContainer;
import rebootedmvp.Module;
import rebootedmvp.ModuleMapper;
import rebootedmvp.domain.impl.ContentEntityImpl;
import rebootedmvp.domain.impl.ModuleEntityImpl;
import rebootedmvp.domain.impl.UserProfileImpl;
import rebootedmvp.dto.CourseDTO;
import rebootedmvp.dto.ModuleDTO;
import rebootedmvp.dto.NewCourseDTO;
import rebootedmvp.dto.NewModuleDTO;
import rebootedmvp.exception.UnauthorizedAccessException;
import rebootedmvp.repository.ContentRepository;
import rebootedmvp.repository.CourseRepository;
import rebootedmvp.repository.ModuleRepository;
import rebootedmvp.repository.UserProfileRepository;

@Service
@Transactional
public class CourseService {

    private static final Logger logger = LoggerFactory.getLogger(CourseService.class);

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserProfileRepository userRepository;

    @Autowired
    private ModuleRepository moduleRepository;

    @Autowired
    private ContentRepository contentRepository;

    @Autowired
    private AuthorizationService authorizationService;

    @Autowired
    private AuthenticationContextService authContextService;

    /**
     * Returns a list of all modules from courses the current user has access to.
     * This replaces the previous findAll() method which was a security risk.
     */
    @Transactional(readOnly = true)
    public List<ModuleDTO> findAllUserAccessible() {
        logger.debug("CourseService.findAllUserAccessible() called - returning user's accessible modules");

        // Get courses the current user has access to
        String userId = authContextService.getCurrentUserId();
        List<Course> userCourses = courseRepository.findCoursesByUserId(userId)
                .stream()
                .map(CourseMapper::toDomain)
                .toList();

        // Get all modules from those courses
        List<Module> userModules = userCourses.stream()
                .flatMap(course -> moduleRepository.findByCourseIdOrderByCreatedAtAsc(course.getId())
                        .stream()
                        .map(ModuleMapper::toDomain))
                .toList();

        return mapToDTO(userModules);
    }

    /**
     * Returns a list of courses the current user has access to (either as teacher
     * or student).
     */
    @Transactional(readOnly = true)
    public List<CourseDTO> getUserCourses() {
        logger.debug("CourseService.getUserCourses() called - returning user's accessible courses");

        String userId = authContextService.getCurrentUserId();
        return courseRepository.findCoursesByUserId(userId)
                .stream()
                .map(CourseMapper::toDomain)
                .map(CourseDTO::new)
                .toList();
    }

    /**
     * Returns a list of all modules within the course with given ID.
     * Requires the current user to have access to the course.
     */
    @Transactional(readOnly = true)
    public List<ModuleDTO> getById(Long courseId) {
        logger.debug("CourseService.getById({}) called - getting modules for course", courseId);

        // Check course exists and user has access
        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + courseId);
        }

        // Verify user has access to this course
        authorizationService.requireCourseAccess(courseId);

        return mapToDTO(moduleRepository.findByCourseIdOrderByCreatedAtAsc(courseId)
                .stream()
                .map(ModuleMapper::toDomain)
                .toList());
    }

    /**
     * Returns the specific module within the course.
     * Requires the current user to have access to the course.
     */
    @Transactional(readOnly = true)
    public ModuleDTO getById(Long courseId, Long moduleId) {
        logger.debug("CourseService.getById({}, {}) called - getting specific module", courseId, moduleId);

        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + courseId);
        }

        // Verify user has access to this course
        authorizationService.requireCourseAccess(courseId);

        Optional<Module> moduleOpt = moduleRepository.findById(moduleId).map(ModuleMapper::toDomain);
        if (moduleOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found with id: " + moduleId);
        }

        Module module = moduleOpt.get();
        if (!module.getCourseId().equals(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Module " + moduleId + " does not belong to course " + courseId);
        }

        return new ModuleDTO(module);
    }

    /**
     * Adds a new module to the specified course.
     * Requires the current user to be a teacher of the course.
     */
    public Long addNew(Long courseId, NewModuleDTO newModuleDTO) {
        logger.debug("CourseService.addNew({}, {}) called", courseId, newModuleDTO.getTitle());

        if (newModuleDTO.getTitle() == null || newModuleDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("The title must be supplied in the DTO");
        }

        Optional<Course> courseOpt = courseRepository.findById(courseId).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + courseId);
        }

        // Verify user has teacher access to this course
        authorizationService.requireTeacherAccess(courseId);

        Course course = courseOpt.get();

        Module module = new ModuleEntityImpl(
                newModuleDTO.getTitle().trim(),
                newModuleDTO.getBody(),
                course);

        Module savedModule = moduleRepository.save(ModuleMapper.toEntity(module));
        logger.info("Created module with ID: {} in course: {}", savedModule.getId(), courseId);
        return savedModule.getId();
    }

    /**
     * Updates a module within a course.
     * Requires the current user to be a teacher of the course.
     */
    public void update(Long courseId, Long moduleId, NewModuleDTO updateDTO) {
        logger.debug("CourseService.update({}, {}, {}) called", courseId, moduleId, updateDTO.getTitle());

        if (!courseRepository.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found with id: " + courseId);
        }

        // Verify user has teacher access to this course
        authorizationService.requireTeacherAccess(courseId);

        Optional<Module> moduleOpt = moduleRepository.findById(moduleId).map(ModuleMapper::toDomain);
        if (moduleOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Module not found with id: " + moduleId);
        }

        Module module = moduleOpt.get();
        if (!module.getCourseId().equals(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Module " + moduleId + " does not belong to course " + courseId);
        }

        if (updateDTO.getTitle() != null && !updateDTO.getTitle().trim().isEmpty()) {
            module.setTitle(updateDTO.getTitle().trim());
        }
        if (updateDTO.getBody() != null) {
            module.setBody(updateDTO.getBody());
        }

        moduleRepository.save(ModuleMapper.toEntity(module));
        logger.info("Updated module with ID: {} in course: {}", moduleId, courseId);
    }

    /**
     * Deletes a module from a course using manual cascade deletion.
     * Requires the current user to be a teacher of the course.
     */
    public boolean delete(Long courseId, Long moduleId) {
        logger.debug("CourseService.delete({}, {}) called", courseId, moduleId);

        if (!courseRepository.existsById(courseId)) {
            return false;
        }

        try {
            // Verify user has teacher access to this course
            authorizationService.requireTeacherAccess(courseId);
        } catch (UnauthorizedAccessException e) {
            logger.warn("User denied access to delete module {} from course {}: {}", moduleId, courseId,
                    e.getMessage());
            return false;
        }

        Optional<Module> moduleOpt = moduleRepository.findById(moduleId).map(ModuleMapper::toDomain);
        if (moduleOpt.isEmpty()) {
            return false;
        }

        Module module = moduleOpt.get();
        if (!module.getCourseId().equals(courseId)) {
            return false;
        }

        // MANUAL CASCADE: Delete content first, then module
        logger.debug("Deleting content for module ID: {}", moduleId);
        List<ContentEntityImpl> contentList = contentRepository.findByModuleId(moduleId);
        for (ContentEntityImpl content : contentList) {
            contentRepository.deleteById(content.getId());
            logger.debug("Deleted content with ID: {}", content.getId());
        }
        contentRepository.flush();

        // Now delete the module safely
        moduleRepository.deleteById(moduleId);
        logger.info("Deleted module with ID: {} from course: {} (with {} content items)",
                moduleId, courseId, contentList.size());
        return true;
    }

    /**
     * Adds a student to a course.
     * Requires the current user to be a teacher of the course.
     */
    @Transactional
    public void addStudent(Long courseId, Long userId) {
        // Verify user has teacher access to this course
        authorizationService.requireTeacherAccess(courseId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        UserProfileImpl user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        course.addStudent(user);
        courseRepository.save(CourseMapper.toEntity(course)); // this is needed to persist the join table change
    }

    /**
     * Adds a teacher to a course.
     */
    @Transactional
    public void addTeacher(Long courseId, Long userId) {
        // Verify user has teacher access to this course
        authorizationService.requireTeacherAccess(courseId);

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        UserProfileImpl user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        course.addTeacher(user);
        courseRepository.save(CourseMapper.toEntity(course)); // this is needed to persist the join table change
    }

    private static List<ModuleDTO> mapToDTO(List<Module> toMap) {
        return toMap.stream().map(
                elem -> new ModuleDTO(elem)).toList();
    }
}
