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

import rebootedmvp.dto.NewAdminDTO;
import rebootedmvp.dto.NewStudentDTO;
import rebootedmvp.dto.NewTeacherDTO;
import rebootedmvp.dto.NewUserDTO;
import rebootedmvp.dto.UserProfileDTO;
import rebootedmvp.service.AuthenticationContextService;
import rebootedmvp.service.JwtService;
import rebootedmvp.service.UserProfileService;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    @Autowired
    private final JwtService jwtService;
    @Autowired
    private final UserProfileService userProfileService;
    @Autowired
    private final AuthenticationContextService authenticationContextService;

    // Constructor for dependency injection
    public UserProfileController(JwtService jwtService, UserProfileService userProfileService,
            AuthenticationContextService authenticationContextService) {
        this.jwtService = jwtService;
        this.userProfileService = userProfileService;
        this.authenticationContextService = authenticationContextService;
    }

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
        List<UserProfileDTO> users = userProfileService.findAll();
        return ResponseEntity.ok(users);
    }

    @PostMapping("/addTeacher")
    public ResponseEntity<Long> createTeacherUser(@RequestBody NewTeacherDTO newUserDTO) {
        System.out.println("Incoming DTO = " + newUserDTO);

        // Extract supabaseUserId from JWT token (without requiring user to exist in
        // database)
        String supabaseUserId = authenticationContextService.getCurrentSupabaseUserIdFromJwt();
        Long userId = userProfileService.addTeacher(supabaseUserId, newUserDTO);
        return ResponseEntity.ok(userId);
    }

    @PostMapping("/addStudent")
    public ResponseEntity<Long> createStudentUser(@RequestBody NewStudentDTO newUserDTO) {
        System.out.println("Incoming DTO = " + newUserDTO);

        // Extract supabaseUserId from JWT token (without requiring user to exist in
        // database)
        String supabaseUserId = authenticationContextService.getCurrentSupabaseUserIdFromJwt();
        Long userId = userProfileService.addStudent(supabaseUserId, newUserDTO);
        return ResponseEntity.ok(userId);
    }

    @PostMapping("/addAdmin")
    public ResponseEntity<Long> createAdminUser(@RequestBody NewAdminDTO newUserDTO) {
        System.out.println("Incoming DTO = " + newUserDTO);

        // Extract supabaseUserId from JWT token (without requiring user to exist in
        // database)
        String supabaseUserId = authenticationContextService.getCurrentSupabaseUserIdFromJwt();
        Long userId = userProfileService.addAdmin(supabaseUserId, newUserDTO);
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
