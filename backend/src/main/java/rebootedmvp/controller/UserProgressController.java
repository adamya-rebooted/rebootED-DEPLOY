package rebootedmvp.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import rebootedmvp.domain.impl.UserProgress;
import rebootedmvp.dto.UserProgressDTO;
import rebootedmvp.service.UserProgressService;

@RestController
@RequestMapping("/api/user-progress")
public class UserProgressController {

    private final UserProgressService userProgressService;

    public UserProgressController(UserProgressService userProgressService) {
        this.userProgressService = userProgressService;
    }

    @GetMapping("/{supabaseUserId}/{courseId}")
    public ResponseEntity<UserProgressDTO> getUserProgress(
            @PathVariable String supabaseUserId,
            @PathVariable Long courseId) {
        UserProgressDTO progress = userProgressService.getUserProgress(supabaseUserId, courseId);
        return ResponseEntity.ok(progress);
    }

    // @PostMapping("/{supabaseUserId}/{courseId}/init")
    // public ResponseEntity<UserProgressDTO> createInitialProgress(
    // @PathVariable String supabaseUserId,
    // @PathVariable Long courseId) {
    // UserProgress progress =
    // userProgressService.createInitialProgress(supabaseUserId, courseId);
    // return ResponseEntity.ok(new UserProgressDTO(progress));
    // }

    // @PatchMapping("/{supabaseUserId}/{courseId}/total")
    // public ResponseEntity<UserProgressDTO> updateTotalProgress(
    // @PathVariable String supabaseUserId,
    // @PathVariable Long courseId,
    // @RequestParam double newProgress) {
    // UserProgress updated =
    // userProgressService.updateTotalProgress(supabaseUserId, courseId,
    // newProgress);
    // return ResponseEntity.ok(new UserProgressDTO(updated));
    // }

    @PatchMapping("/{supabaseUserId}/{courseId}/update-content")
    public ResponseEntity<Void> updateContentCompleted(
            @PathVariable String supabaseUserId,
            @PathVariable Long courseId,
            @RequestParam int moduleNum,
            @RequestParam int contentNum,
            @RequestParam boolean newStatus) {
        userProgressService.updateContentCompleted(courseId, supabaseUserId, moduleNum, contentNum, newStatus);
        return ResponseEntity.noContent().build();
    }

    // @GetMapping
    // public ResponseEntity<List<UserProgress>> getAllProgress() {
    // return ResponseEntity.ok(userProgressService.getAllProgress());
    // }
}
