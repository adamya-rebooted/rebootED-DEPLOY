package rebootedmvp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rebootedmvp.dto.ModuleDTO;
import rebootedmvp.dto.NewModuleDTO;
import rebootedmvp.exception.UnauthorizedAccessException;
import rebootedmvp.exception.UserNotAuthenticatedException;
import rebootedmvp.service.CourseService;

@RestController
@RequestMapping("/api/courses/{courseId}")
public class CourseController {

    @Autowired
    private CourseService courseService;

    @GetMapping
    public ResponseEntity<List<ModuleDTO>> getAllModules(@PathVariable Long courseId) {
        try {
            return ResponseEntity.ok(courseService.getById(courseId));
        } catch (UnauthorizedAccessException | UserNotAuthenticatedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<ModuleDTO> getModuleById(@PathVariable Long courseId, @PathVariable Long moduleId) {
        try {
            return ResponseEntity.ok(courseService.getById(courseId, moduleId));
        } catch (UnauthorizedAccessException | UserNotAuthenticatedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/add")
    public ResponseEntity<Long> createModule(@PathVariable Long courseId, @RequestBody NewModuleDTO newModuleDTO) {
        try {
            Long moduleId = courseService.addNew(courseId, newModuleDTO);
            return ResponseEntity.ok(moduleId);
        } catch (UnauthorizedAccessException | UserNotAuthenticatedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/update/{moduleId}")
    public ResponseEntity<Void> updateModule(@PathVariable Long courseId, @PathVariable Long moduleId,
            @RequestBody NewModuleDTO updateModuleDTO) {
        try {
            courseService.update(courseId, moduleId, updateModuleDTO);
            return ResponseEntity.ok().build();
        } catch (UnauthorizedAccessException | UserNotAuthenticatedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{moduleId}")
    public ResponseEntity<Void> deleteModule(@PathVariable Long courseId, @PathVariable Long moduleId) {
        boolean deleted = courseService.delete(courseId, moduleId);
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/addTeacher/{userId}")
    public ResponseEntity<Void> enrollUserAsTeacher(
            @PathVariable Long courseId,
            @PathVariable Long userId) {
        try {
            courseService.addTeacher(courseId, userId);
            return ResponseEntity.ok().build();
        } catch (UnauthorizedAccessException | UserNotAuthenticatedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/addStudent/{userId}")
    public ResponseEntity<Void> enrollUserAsStudent(
            @PathVariable Long courseId,
            @PathVariable Long userId) {
        try {
            courseService.addStudent(courseId, userId);
            return ResponseEntity.ok().build();
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
