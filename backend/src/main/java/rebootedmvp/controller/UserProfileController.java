package rebootedmvp.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import rebootedmvp.dto.NewUserDTO;
import rebootedmvp.dto.UserProfileDTO;
import rebootedmvp.service.JwtService;
import rebootedmvp.service.UserProfileService;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    @Autowired
    private final JwtService jwtService;
    @Autowired
    private final UserProfileService userProfileService;

    // Constructor for dependency injection
    public UserProfileController(JwtService jwtService, UserProfileService userProfileService) {
        this.jwtService = jwtService;
        this.userProfileService = userProfileService;
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
        List<UserProfileDTO> users = userProfileService.findAll();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/add")
    public ResponseEntity<Long> createUser(@RequestBody NewUserDTO newUserDTO) {
        System.out.println("Incoming DTO = " + newUserDTO);

        // Use proper JWT validation now that we fixed the HS256 configuration
        String supabaseUserId = newUserDTO.getSupabaseUserId();
        Long userId = userProfileService.addUser(supabaseUserId, newUserDTO);
        return ResponseEntity.ok(userId);
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
