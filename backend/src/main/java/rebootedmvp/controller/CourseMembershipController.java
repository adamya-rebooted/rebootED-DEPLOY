package rebootedmvp.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rebootedmvp.dto.StudentDTO;
import rebootedmvp.dto.TeacherDTO;
import rebootedmvp.dto.UserCourseDTO;
import rebootedmvp.dto.UserProfileDTO;
import rebootedmvp.service.CourseMembershipService;

@RestController
@RequestMapping("/api/course-memberships")
public class CourseMembershipController {

    @Autowired
    private CourseMembershipService courseMembershipService;

    @GetMapping("/course/{courseId}/getTeachers")
    public ResponseEntity<List<TeacherDTO>> getCourseTeachers(@PathVariable Long courseId) {
        List<TeacherDTO> users = courseMembershipService.getCourseTeachers(courseId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/course/{courseId}/getStudents")
    public ResponseEntity<List<StudentDTO>> getCourseStudents(@PathVariable Long courseId) {
        List<StudentDTO> users = courseMembershipService.getCourseStudents(courseId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/course/{courseId}/getUsers")
    public ResponseEntity<List<UserProfileDTO>> getCourseUsers(@PathVariable Long courseId) {
        List<UserProfileDTO> users = courseMembershipService.getCourseUsers(courseId);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/user/{userId}/courses")
    public ResponseEntity<List<UserCourseDTO>> getUserCourses(@PathVariable String userId) {
        List<UserCourseDTO> courses = courseMembershipService.getUserCourses(userId);
        return ResponseEntity.ok(courses);
    }

    @PostMapping("/course/{courseId}/users")
    public ResponseEntity<String> addUserToCourse(
            @PathVariable Long courseId,
            @RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String role = request.get("role");

        if (userId == null || role == null) {
            return ResponseEntity.badRequest().body("userId and role are required");
        }

        boolean success = courseMembershipService.addUserToCourse(courseId, userId, role);
        if (success) {
            return ResponseEntity.ok("User added to course successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to add user to course");
        }
    }

    @PostMapping("/course/{courseId}/teachers")
    public ResponseEntity<String> addTeachersToCourse(
            @PathVariable Long courseId,
            @RequestBody Map<String, List<String>> request) {
        List<String> usernames = request.get("usernames");

        if (usernames == null || usernames.isEmpty()) {
            return ResponseEntity.badRequest().body("usernames are required");
        }

        boolean success = courseMembershipService.addUsersByCourse(courseId, usernames, "teacher");
        if (success) {
            return ResponseEntity.ok("Teachers added to course successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to add teachers to course");
        }
    }

    @PostMapping("/course/{courseId}/students")
    public ResponseEntity<String> addStudentsToCourse(
            @PathVariable Long courseId,
            @RequestBody Map<String, List<String>> request) {
        List<String> usernames = request.get("usernames");

        if (usernames == null || usernames.isEmpty()) {
            return ResponseEntity.badRequest().body("usernames are required");
        }

        boolean success = courseMembershipService.addUsersByCourse(courseId, usernames, "student");
        if (success) {
            return ResponseEntity.ok("Students added to course successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to add students to course");
        }
    }

    @DeleteMapping("/course/{courseId}/users/{userId}")
    public ResponseEntity<String> removeUserFromCourse(
            @PathVariable Long courseId,
            @PathVariable String userId) {
        boolean success = courseMembershipService.removeUserFromCourse(courseId, userId);
        if (success) {
            return ResponseEntity.ok("User removed from course successfully");
        } else {
            return ResponseEntity.badRequest().body("Failed to remove user from course");
        }
    }
}
