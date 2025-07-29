package rebootedmvp.service;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import rebootedmvp.Course;
import rebootedmvp.User;
import rebootedmvp.UserMapper;
import rebootedmvp.domain.impl.StudentImpl;
import rebootedmvp.domain.impl.TeacherImpl;
import rebootedmvp.domain.impl.UserProfileImpl;
import rebootedmvp.dto.NewStudentDTO;
import rebootedmvp.dto.NewTeacherDTO;
import rebootedmvp.dto.NewUserDTO;
import rebootedmvp.dto.StudentDTO;
import rebootedmvp.dto.TeacherDTO;
import rebootedmvp.dto.UserProfileDTO;
import rebootedmvp.repository.UserProfileRepository;

@Service
public class UserProfileService {

    private static final Logger logger = LoggerFactory.getLogger(UserProfileService.class);

    @Autowired
    private UserProfileRepository userProfileRepository;

    public List<UserProfileDTO> findAll() {
        logger.debug("UserProfileService.findAll() called");
        try {
            List<UserProfileDTO> result = userProfileRepository.findAll().stream()
                    .map(this::convertToDTO)
                    .toList();
            logger.debug("UserProfileService.findAll() returning {} users", result.size());
            return result;
        } catch (Exception e) {
            logger.error("Error in UserProfileService.findAll(): {}", e.getMessage(), e);
            throw e;
        }
    }

    public UserProfileDTO findById(String id) {
        logger.info("===== UserProfileService.findById('{}') START =====", id);

        try {
            // Handle both UUID string and numeric ID lookups
            logger.debug("Step 1: Trying to find by Supabase user ID first...");

            Optional<User> profile;
            try {
                profile = userProfileRepository.findBySupabaseUserId(id).map(UserMapper::toDomain);
                logger.debug("findBySupabaseUserId('{}') result: {}", id, profile.isPresent() ? "FOUND" : "NOT_FOUND");
                if (profile.isPresent()) {
                    logger.debug("Found user by Supabase ID: {}", profile.get());
                }
            } catch (Exception e) {
                logger.error("Error calling userProfileRepository.findBySupabaseUserId('{}'): {}", id, e.getMessage(),
                        e);
                throw e;
            }

            if (profile.isPresent()) {
                UserProfileDTO result = convertToDTO(profile.get());
                logger.info("UserProfileService.findById('{}') SUCCESS via Supabase ID: {}", id, result);
                return result;
            }

            // Fallback to numeric ID lookup if needed
            logger.debug("Step 2: Supabase ID not found, trying numeric ID lookup...");
            try {
                Long numericId = Long.parseLong(id);
                logger.debug("Parsed numeric ID: {}", numericId);

                Optional<User> profileById = userProfileRepository.findById(numericId).map(UserMapper::toDomain);
                logger.debug("findById({}) result: {}", numericId, profileById.isPresent() ? "FOUND" : "NOT_FOUND");

                UserProfileDTO result = profileById.map(this::convertToDTO).orElse(null);
                logger.info("UserProfileService.findById('{}') {} via numeric ID", id,
                        result != null ? "SUCCESS" : "NOT_FOUND");
                return result;

            } catch (NumberFormatException e) {
                logger.debug("ID '{}' is not a number, trying final Supabase user ID lookup", id);
                // If not a number, try Supabase user ID lookup
                try {
                    Optional<User> finalProfile = userProfileRepository.findBySupabaseUserId(id)
                            .map(UserMapper::toDomain);
                    UserProfileDTO result = finalProfile.map(this::convertToDTO).orElse(null);
                    logger.info("UserProfileService.findById('{}') {} via final Supabase lookup", id,
                            result != null ? "SUCCESS" : "NOT_FOUND");
                    return result;
                } catch (Exception dbE) {
                    logger.error("Error in final Supabase lookup for ID '{}': {}", id, dbE.getMessage(), dbE);
                    throw dbE;
                }
            } catch (Exception e) {
                logger.error("Error in numeric ID lookup for '{}': {}", id, e.getMessage(), e);
                throw e;
            }

        } catch (Exception e) {
            logger.error("===== UserProfileService.findById('{}') ERROR =====", id);
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Full stack trace:", e);
            throw e;
        }
    }

    public UserProfileDTO findByUsername(String username) {
        logger.info("===== UserProfileService.findByUsername('{}') START =====", username);

        try {
            logger.debug("Calling userProfileRepository.findByUsername('{}')...", username);
            Optional<User> profile = userProfileRepository.findByUsername(username).map(UserMapper::toDomain);
            logger.debug("Repository call completed. Result: {}", profile.isPresent() ? "FOUND" : "NOT_FOUND");

            if (profile.isPresent()) {
                logger.debug("Found user profile: {}", profile.get());
            }

            UserProfileDTO result = profile.map(this::convertToDTO).orElse(null);
            logger.info("UserProfileService.findByUsername('{}') {}: {}",
                    username, result != null ? "SUCCESS" : "NOT_FOUND", result);
            return result;

        } catch (Exception e) {
            logger.error("===== UserProfileService.findByUsername('{}') ERROR =====", username);
            logger.error("Exception type: {}", e.getClass().getSimpleName());
            logger.error("Exception message: {}", e.getMessage());
            logger.error("Full stack trace:", e);
            throw e;
        }
    }

    public List<UserProfileDTO> findByUsernames(List<String> usernames) {
        List<User> profiles = userProfileRepository.findByUsernameIn(usernames)
                .stream()
                .map(UserMapper::toDomain)
                .toList();
        return profiles.stream()
                .map(this::convertToDTO)
                .toList();
    }

    public boolean validateUsername(String username) {
        return userProfileRepository.existsByUsername(username);
    }

    public List<String> validateUsernames(List<String> usernames) {
        return usernames.stream()
                .filter(this::validateUsername)
                .toList();
    }

    /**
     * Find user by Supabase user ID
     */
    public UserProfileDTO findBySupabaseUserId(String supabaseUserId) {
        Optional<User> profile = userProfileRepository.findBySupabaseUserId(supabaseUserId).map(UserMapper::toDomain);
        return profile.map(this::convertToDTO).orElse(null);
    }

    /**
     * Save a user profile
     */
    public UserProfileDTO save(User userProfile) {
        User saved = userProfileRepository.save(UserMapper.toEntity(userProfile));
        return convertToDTO(saved);
    }

    public Long addTeacher(String supabaseUserId, NewTeacherDTO newUserDTO) {
        logger.debug("UserProfileService.addTeacher({}) called", newUserDTO);
        if (newUserDTO.getUsername() == null) {
            throw new IllegalArgumentException("The user's name must be supplied in the DTO");
        }
        User savedUser = userProfileRepository.save(new TeacherImpl(supabaseUserId, newUserDTO));

        return savedUser.getId(); // Return Supabase UUID as the ID
    }

    public Long addStudent(String supabaseUserId, NewStudentDTO newUserDTO) {
        logger.debug("UserProfileService.addStudent({}) called", newUserDTO);
        if (newUserDTO.getUsername() == null) {
            throw new IllegalArgumentException("The user's name must be supplied in the DTO");
        }
        User savedUser = userProfileRepository.save(new StudentImpl(supabaseUserId, newUserDTO));

        return savedUser.getId(); // Return Supabase UUID as the ID
    }

    /**
     * Delete a user by ID
     */
    public void deleteById(String id) {
        try {
            Long numericId = Long.valueOf(id);
            userProfileRepository.deleteById(numericId);
        } catch (NumberFormatException e) {
            // If not a numeric ID, try to find by Supabase user ID and delete
            Optional<User> profile = userProfileRepository.findBySupabaseUserId(id).map(UserMapper::toDomain);
            profile.ifPresent(
                    userProfile -> userProfileRepository.deleteById(Long.valueOf(userProfile.getSupabaseUserId())));
        }
    }

    /**
     * Search users by username or full name
     */
    public List<UserProfileDTO> searchUsers(String searchTerm) {
        List<User> profiles = userProfileRepository.findByUsernameContainingIgnoreCase(searchTerm)
                .stream()
                .map(UserMapper::toDomain)
                .toList();
        return profiles.stream()
                .map(this::convertToDTO)
                .toList();
    }

    private UserProfileDTO convertToDTO(User profile) {
        logger.debug("Converting UserProfileImpl to DTO: {}", profile);
        try {
            switch (profile.getUserType()) {
                case Teacher:
                    return new TeacherDTO(((TeacherImpl) profile));
                case Student:
                    return new StudentDTO(((StudentImpl) profile));
                default:
                    throw new IllegalArgumentException("Unknown user type: " + profile.getUserType());
            }
        } catch (Exception e) {
            logger.error("Error converting UserProfileImpl to DTO: {}", e.getMessage(), e);
            logger.error("Profile data: {}", profile);
            throw e;
        }
    }
}