package rebootedmvp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rebootedmvp.domain.impl.RosterEntityImpl;
import rebootedmvp.domain.impl.TeacherImpl;
import rebootedmvp.dto.CourseDTO;
import rebootedmvp.dto.NewCourseDTO;
import rebootedmvp.dto.NewRosterDTO;
import rebootedmvp.repository.UserProfileRepository;
import rebootedmvp.service.AuthorizationService;
import rebootedmvp.service.CourseService;
import rebootedmvp.service.RosterService;
import rebootedmvp.service.UserProfileService;

@RestController
@RequestMapping("/api/roster")
public class RosterController {

    @Autowired
    private RosterService rosterService;

    @Autowired
    private CourseService courseService;

    @Autowired
    private UserProfileService userProfileService;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private AuthorizationService authorizationService;

    @PostMapping
    public ResponseEntity<Long> createRoster() {
        Long rosterId = rosterService.addToHigh(new NewRosterDTO("Main Roster", "Description"), RosterEntityImpl::new);
        return ResponseEntity.ok(rosterId);
    }

    @GetMapping
    public ResponseEntity<List<CourseDTO>> getAllCourses() {
        return ResponseEntity.ok(rosterService.findAll());
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable Long courseId) {

        try {
            CourseDTO course = rosterService.getById(courseId);
            return ResponseEntity.ok(course);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }

    }

    @PostMapping("/add")
    public ResponseEntity<Long> createCourse(@RequestBody NewCourseDTO newCourseDTO, SecurityContextHolder user) {
        try {
            Long courseId = rosterService.addNew(Long.valueOf(0), newCourseDTO);
            String supabaseUserId = authorizationService.getCurrentSupabaseUserId(); // <-- step 2
            Long userId = userProfileRepository.findBySupabaseUserId(supabaseUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();
            courseService.addTeacher(courseId, userId);

            return ResponseEntity.ok(courseId);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/update/{id}")
    public void updateCourse(@PathVariable Long id, @RequestBody NewCourseDTO updateCourseDTO) {
        rosterService.update(Long.valueOf(0), id, updateCourseDTO);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        boolean deleted = rosterService.delete(Long.valueOf(0), id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleException(Exception e) {
        return ResponseEntity.status(INTERNAL_SERVER_ERROR)
                .body("An error occurred: " + e.getMessage());
    }

}
