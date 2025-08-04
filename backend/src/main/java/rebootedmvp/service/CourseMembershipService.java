package rebootedmvp.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import rebootedmvp.Course;
import rebootedmvp.CourseMapper;
import rebootedmvp.User;
import rebootedmvp.User.UserType;
import rebootedmvp.UserMapper;
import rebootedmvp.domain.impl.AdminImpl;
import rebootedmvp.domain.impl.StudentImpl;
import rebootedmvp.domain.impl.TeacherImpl;
import rebootedmvp.dto.AdminDTO;
import rebootedmvp.dto.StudentDTO;
import rebootedmvp.dto.TeacherDTO;
import rebootedmvp.dto.UserCourseDTO;
import rebootedmvp.dto.UserProfileDTO;
import rebootedmvp.repository.CourseRepository;
import rebootedmvp.repository.UserProfileRepository;

@Service
@Transactional
public class CourseMembershipService {

    private static final Logger logger = LoggerFactory.getLogger(CourseMembershipService.class);

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    @Lazy
    private CourseService courseService;

    // public boolean addUserToCourse(Long courseId, String userId, User.UserType
    // role) {
    // logger.debug("Adding user {} to course {} with role {}", userId, courseId,
    // role);

    // // Find the user
    // UserProfileDTO userDTO = userProfileService.findById(userId);
    // if (userDTO == null) {
    // logger.warn("User not found with ID: {}", userId);
    // return false;
    // }

    // // Find the UserProfileImpl entity
    // Optional<User> userOpt =
    // userProfileRepository.findBySupabaseUserId(userDTO.getId()).map(UserMapper::toDomain);
    // if (userOpt.isEmpty()) {
    // logger.warn("UserProfileImpl not found for ID: {}", userId);
    // return false;
    // }
    // User user = userOpt.get();

    // // Find the course
    // Optional<Course> courseOpt =
    // courseRepository.findById(courseId).map(CourseMapper::toDomain);
    // if (courseOpt.isEmpty()) {
    // logger.warn("Course not found with ID: {}", courseId);
    // return false;
    // }
    // Course course = courseOpt.get();

    // // Add user to appropriate role
    // if (User.UserType.Teacher == role) {

    // course.addTeacher(user);
    // courseRepository.save(CourseMapper.toEntity(course));
    // logger.info("Successfully added user {} to course {} as {}", userId,
    // courseId, role);
    // return true;

    // } else if (role == User.UserType.Student) {
    // course.addStudent(user);
    // courseRepository.save(CourseMapper.toEntity(course));
    // logger.info("Successfully added user {} to course {} as {}", userId,
    // courseId, role);
    // return true;
    // }
    // return false;
    // }

    // public boolean addUsersToCourse(Long courseId, List<String> userIds,
    // User.UserType role) {
    // logger.debug("Adding users {} to course {} with role {}", userIds, courseId,
    // role);
    // boolean retBool = true;

    // for (String userId : userIds) {
    // boolean success = addUserToCourse(courseId, userId, role);
    // if (!success) {
    // retBool = false;
    // }
    // }

    // return retBool;

    // }

    public boolean removeUserFromCourse(Long courseId, String userId) {
        logger.debug("Removing user {} from course {}", userId, courseId);

        // Find the user
        UserProfileDTO userDTO = userProfileService.findById(userId);
        if (userDTO == null) {
            logger.warn("User not found with ID: {}", userId);
            return false;
        }

        // Find the UserProfileImpl entity
        Optional<User> userOpt = userProfileRepository.findBySupabaseUserId(userDTO.getId()).map(UserMapper::toDomain);
        if (userOpt.isEmpty()) {
            logger.warn("UserProfileImpl not found for ID: {}", userId);
            return false;
        }
        User user = userOpt.get();

        // Find the course
        Optional<Course> courseOpt = courseRepository.findById(courseId).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            logger.warn("Course not found with ID: {}", courseId);
            return false;
        }
        Course course = courseOpt.get();

        // Remove user from both roles
        boolean removedAsStudent = false;
        boolean removedAsTeacher = false;
        switch (user.getUserType()) {
            case Teacher:
                removedAsTeacher = course.removeTeacher(user);
                ((TeacherImpl) user).removeCourse(course);
            case Student:
                removedAsStudent = course.removeStudent(user);
                ((StudentImpl) user).removeCourse(course);
            case Admin:
                break;
        }

        if (removedAsTeacher || removedAsStudent) {
            courseRepository.save(CourseMapper.toEntity(course));
            logger.info("Successfully removed user {} from course {}", userId, courseId);
            return true;
        }
        return false;

    }

    public boolean removeAllUsersFromCourse(Long courseId) {
        logger.debug("Removing all users from course {}", courseId);

        Optional<Course> courseOpt = courseRepository.findById(courseId).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            logger.warn("Course not found with ID: {}", courseId);
            return false;
        }

        Course course = courseOpt.get();

        int teacherCount = course.getTeachers().size();
        int studentCount = course.getStudents().size();

        Set<User> teachers = course.getTeachers();

        Set<User> students = course.getStudents();

        for (User teacher : teachers) {
            ((TeacherImpl) teacher).removeCourse(course);
        }
        for (User student : students) {
            ((StudentImpl) student).removeCourse(course);
        }

        courseRepository.save(CourseMapper.toEntity(course));
        logger.info("Removed {} teachers and {} students from course {}", teacherCount, studentCount, courseId);

        return true;
    }

    @Transactional(readOnly = true)
    public List<TeacherDTO> getCourseTeachers(Long courseId) {
        logger.debug("Getting users for course {}", courseId);

        Optional<Course> courseOpt = courseRepository.findById(courseId).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            logger.warn("Course not found with ID: {}", courseId);
            return List.of();
        }

        Course course = courseOpt.get();

        List<TeacherDTO> result = course.getTeachers().stream()
                .collect(Collectors.toSet()).stream()
                .map(elem -> new TeacherDTO(((TeacherImpl) elem)))
                .toList();

        // Add teachers

        logger.debug("Found {} users for course {}", result.size(), courseId);
        return result;
    }

    @Transactional(readOnly = true)
    public List<StudentDTO> getCourseStudents(Long courseId) {
        logger.debug("Getting users for course {}", courseId);

        Optional<Course> courseOpt = courseRepository.findById(courseId).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            logger.warn("Course not found with ID: {}", courseId);
            return List.of();
        }

        Course course = courseOpt.get();

        List<StudentDTO> result = course.getStudents().stream()
                .collect(Collectors.toSet()).stream()
                .map(elem -> new StudentDTO(((StudentImpl) elem)))
                .toList();

        // Add teachers

        logger.debug("Found {} users for course {}", result.size(), courseId);
        return result;
    }

    @Transactional(readOnly = true)
    public List<UserProfileDTO> getCourseUsers(Long courseId) {
        logger.debug("Getting users for course {}", courseId);

        Optional<Course> courseOpt = courseRepository.findById(courseId).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            logger.warn("Course not found with ID: {}", courseId);
            return List.of();
        }

        Course course = courseOpt.get();

        List<UserProfileDTO> result = Stream.concat(
                course.getStudents().stream(),
                course.getTeachers().stream())
                .collect(Collectors.toSet()).stream()
                .map(elem -> convertToDTO(elem))
                .toList();

        // Add teachers

        logger.debug("Found {} users for course {}", result.size(), courseId);
        return result;
    }

    @Transactional(readOnly = true)
    public List<UserCourseDTO> getUserCourses(String userId) {
        logger.info("===== CourseMembershipService.getUserCourses() START =====");
        logger.info("Input userId: '{}'", userId);

        try {

            Optional<User> userOpt = userProfileRepository.findBySupabaseUserId(userId).map(UserMapper::toDomain);

            if (!userOpt.isPresent()) {
                logger.warn("User not found: {}", userId);
                return List.of();
            }
            User user = userOpt.get();
            logger.info("User '{}' found as username, mapped to entity ID: '{}'", userId,
                    user.getSupabaseUserId());
            logger.debug("Step 2: Finding courses for user entity ID: '{}'", user.getSupabaseUserId());
            if (user.getUserType() == User.UserType.Admin) {
                List<UserCourseDTO> courseDTOs = courseRepository.findAll().stream()
                        .map(elem -> new UserCourseDTO(elem.getId(), elem.getTitle(),
                                elem.getBody(), User.UserType.Admin))
                        .toList();
                return courseDTOs;
            }
            // Find courses where user is either teacher or student
            Stream<Course> courses = courseRepository.findCoursesByUserId(user.getSupabaseUserId())
                    .stream()
                    .map(CourseMapper::toDomain);

            List<UserCourseDTO> courseDTOs = courses
                    .filter(course -> course.isTeacher(user) || (course.isStudent(user) && course.isPublished()))
                    .map(elem -> new UserCourseDTO(elem.getId(), elem.getTitle(),
                            elem.getBody(), elem.isStudent(user) ? User.UserType.Student : User.UserType.Teacher))
                    .toList();

            logger.info("===== CourseMembershipService.getUserCourses() SUCCESS =====");
            logger.info("Returning {} courses for user '{}'", courseDTOs.size(), userId);
            return courseDTOs;
        } catch (Exception e) {
            logger.error("===== CourseMembershipService.getUserCourses() ERROR =====");
            logger.error("Error getting user courses for user '{}': {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<UserCourseDTO> getPublishedCourses(String userId) {
        logger.info("===== CourseMembershipService.getPublishedCourses() START =====");
        logger.info("Input userId: '{}'", userId);

        try {
            Optional<User> userOpt = userProfileRepository.findBySupabaseUserId(userId).map(UserMapper::toDomain);

            if (!userOpt.isPresent()) {
                logger.warn("User not found: {}", userId);
                return List.of();
            }
            User user = userOpt.get();
            
            // Only return published courses where the user is a teacher
            Stream<Course> courses = courseRepository.findCoursesByUserId(user.getSupabaseUserId())
                    .stream()
                    .map(CourseMapper::toDomain);

            List<UserCourseDTO> courseDTOs = courses
                    .filter(course -> course.isTeacher(user) && course.isPublished())
                    .map(elem -> new UserCourseDTO(elem.getId(), elem.getTitle(),
                            elem.getBody(), User.UserType.Teacher))
                    .toList();

            logger.info("===== CourseMembershipService.getPublishedCourses() SUCCESS =====");
            logger.info("Returning {} published courses for user '{}'", courseDTOs.size(), userId);
            return courseDTOs;
        } catch (Exception e) {
            logger.error("===== CourseMembershipService.getPublishedCourses() ERROR =====");
            logger.error("Error getting published courses for user '{}': {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public List<UserCourseDTO> getUnpublishedCourses(String userId) {
        logger.info("===== CourseMembershipService.getUnpublishedCourses() START =====");
        logger.info("Input userId: '{}'", userId);

        try {
            Optional<User> userOpt = userProfileRepository.findBySupabaseUserId(userId).map(UserMapper::toDomain);

            if (!userOpt.isPresent()) {
                logger.warn("User not found: {}", userId);
                return List.of();
            }
            User user = userOpt.get();
            
            // Only return unpublished courses where the user is a teacher
            Stream<Course> courses = courseRepository.findCoursesByUserId(user.getSupabaseUserId())
                    .stream()
                    .map(CourseMapper::toDomain);

            List<UserCourseDTO> courseDTOs = courses
                    .filter(course -> course.isTeacher(user) && !course.isPublished())
                    .map(elem -> new UserCourseDTO(elem.getId(), elem.getTitle(),
                            elem.getBody(), User.UserType.Teacher))
                    .toList();

            logger.info("===== CourseMembershipService.getUnpublishedCourses() SUCCESS =====");
            logger.info("Returning {} unpublished courses for user '{}'", courseDTOs.size(), userId);
            return courseDTOs;
        } catch (Exception e) {
            logger.error("===== CourseMembershipService.getUnpublishedCourses() ERROR =====");
            logger.error("Error getting unpublished courses for user '{}': {}", userId, e.getMessage(), e);
            throw e;
        }
    }

    public boolean addUsersByCourse(Long courseId, List<String> usernames, User.UserType role) {
        logger.debug("Adding {} users to course {} with role {}", usernames.size(), courseId, role);

        // Find all users first
        List<UserProfileDTO> userDTOs = userProfileService.findByUsernames(usernames);
        if (userDTOs.size() != usernames.size()) {
            logger.warn("Some users not found. Expected: {}, Found: {}", usernames.size(), userDTOs.size());
            return false; // Some users don't exist
        }

        // Find the course
        Optional<Course> courseOpt = courseRepository.findById(courseId).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            logger.warn("Course not found with ID: {}", courseId);
            return false;
        }
        Course course = courseOpt.get();

        // Find all User entities
        List<User> users = new ArrayList<>();
        for (UserProfileDTO userDTO : userDTOs) {
            Optional<User> userOpt = userProfileRepository.findBySupabaseUserId(userDTO.getId())
                    .map(UserMapper::toDomain);
            if (userOpt.isEmpty()) {
                logger.warn("User not found for ID: {}", userDTO.getId());
                return false;
            }
            users.add(userOpt.get());
        }

        // Add users to appropriate role
        int addedCount = 0;
        for (User user : users) {
            if (role == UserType.Teacher) {
                if (course.addTeacher(user)) {
                    addedCount++;
                }
            } else if (role == UserType.Student) {
                if (course.addStudent(user)) {
                    addedCount++;
                }
            }

            if (addedCount > 0) {
                courseRepository.save(CourseMapper.toEntity(course));
                logger.info("Successfully added {} users to course {} as {}", addedCount, courseId, role);
            } else {
                logger.warn("No users were added to course {} - they may already be enrolled", courseId);
            }
        }
        return true;

    }

    @Transactional(readOnly = true)
    public int getTeacherCount(Long courseId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            return 0;
        }
        return courseOpt.get().getTeachers().size();
    }

    @Transactional(readOnly = true)

    public int getStudentCount(Long courseId) {
        Optional<Course> courseOpt = courseRepository.findById(courseId).map(CourseMapper::toDomain);
        if (courseOpt.isEmpty()) {
            return 0;
        }
        return courseOpt.get().getStudents().size();
    }

    private UserProfileDTO convertToDTO(User user) {
        switch (user.getUserType()) {
            case Teacher -> {
                return new TeacherDTO(((TeacherImpl) user));
            }
            case Student -> {
                return new StudentDTO(((StudentImpl) user));
            }
            case Admin -> {
                return new AdminDTO(((AdminImpl) user));
            }
            default -> throw new IllegalArgumentException("Unknown user type: " + user.getUserType());
        }
    }
}
