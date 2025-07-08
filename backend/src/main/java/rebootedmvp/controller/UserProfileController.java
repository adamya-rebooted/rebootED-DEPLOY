package rebootedmvp.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rebootedmvp.dto.UserProfileDTO;
import rebootedmvp.service.UserProfileService;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
        List<UserProfileDTO> users = userProfileService.findAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getUserById(@PathVariable String id) {
        UserProfileDTO user = userProfileService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<UserProfileDTO> getUserByUsername(@PathVariable String username) {
        UserProfileDTO user = userProfileService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Boolean>> validateUsernames(@RequestBody Map<String, List<String>> request) {
        List<String> usernames = request.get("usernames");
        if (usernames == null) {
            return ResponseEntity.badRequest().build();
        }

        List<String> validUsernames = userProfileService.validateUsernames(usernames);
        Map<String, Boolean> result = usernames.stream()
                .collect(java.util.stream.Collectors.toMap(
                        username -> username,
                        validUsernames::contains));

        return ResponseEntity.ok(result);
    }

    @PostMapping("/search")
    public ResponseEntity<List<UserProfileDTO>> searchUsersByUsernames(@RequestBody Map<String, List<String>> request) {
        List<String> usernames = request.get("usernames");
        if (usernames == null) {
            return ResponseEntity.badRequest().build();
        }

        List<UserProfileDTO> users = userProfileService.findByUsernames(usernames);
        return ResponseEntity.ok(users);
    }
}
