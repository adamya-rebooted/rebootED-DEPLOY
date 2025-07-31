package rebootedmvp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import rebootedmvp.domain.impl.UserProgress;
import rebootedmvp.service.UserProgressService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/progress")
public class UserProgressController {

    private final UserProgressService userProgressService;

    public UserProgressController(UserProgressService userProgressService) {
        this.userProgressService = userProgressService;
    }

    @GetMapping("/{courseId}/{supabaseUserId}")
    public ResponseEntity<UserProgress> getProgressByCourseAndUser(
            @PathVariable Long courseId,
            @PathVariable String supabaseUserId) {

        Optional<UserProgress> progress = userProgressService.getProgressByCourseAndUser(courseId, supabaseUserId);
        return progress.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/")
    public ResponseEntity<UserProgress> createOrUpdateProgress(@RequestBody UserProgress progress) {
        UserProgress saved = userProgressService.saveProgress(progress);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/")
    public ResponseEntity<List<UserProgress>> getAllProgress() {
        List<UserProgress> all = userProgressService.getAllProgress();
        return ResponseEntity.ok(all);
    }
}
