package rebootedmvp.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import rebootedmvp.User;
import rebootedmvp.UserMapper;
import rebootedmvp.repository.UserProfileRepository;

/**
 * Service responsible for synchronizing Supabase users with the backend user
 * system.
 * Only syncs existing users - does not auto-create new users.
 */
 @Service
public class UserSyncService {

    private static final Logger logger = LoggerFactory.getLogger(UserSyncService.class);

    @Autowired
    private UserProfileRepository userProfileRepository;

    /**
     * Synchronizes a Supabase user with the backend user system.
     * Only returns existing backend users - does not create new users automatically.
     * New users should be created through the signup flow after role selection.
     * 
     * @param jwt The already-validated Supabase JWT containing user information
     * @return The existing UserProfileImpl, or null if user doesn't exist in backend
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public User syncSupabaseUser(Jwt jwt) {
        try {
            // JWT is already validated by Spring Security's OAuth2 Resource Server
            logger.debug("Processing already-validated JWT token for user sync...");

            if (jwt == null) {
                logger.error("Null JWT provided - cannot sync user");
                throw new SecurityException("Null JWT token");
            }

            // DEBUG: Print JWT claims to see what Supabase actually provides
            logger.info("=== JWT CLAIMS DEBUG ===");
            logger.info("Subject: {}", jwt.getSubject());
            logger.info("Email: {}", jwt.getClaimAsString("email"));
            logger.info("Role: {}", jwt.getClaimAsString("role"));
            logger.info("All claims: {}", jwt.getClaims());
            logger.info("=== END DEBUG ===");

            String supabaseUserId = jwt.getSubject();

            // Check if user already exists (no auto-creation)
            Optional<User> existingUser = userProfileRepository.findBySupabaseUserId(supabaseUserId)
                    .map(UserMapper::toDomain);
            
            if (existingUser.isPresent()) {
                logger.debug("Found existing user for Supabase ID: {}", supabaseUserId);
                return existingUser.get();
            } else {
                logger.debug("User not found in backend for Supabase ID: {} - user should complete signup", supabaseUserId);
                return null;
            }

        } catch (SecurityException e) {
            logger.error("Failed to sync Supabase user: {}", e.getMessage(), e);
            return null;
        } catch (Exception e) {
            logger.error("Failed to process JWT token: {}", e.getMessage(), e);
            return null;
        }
    }

}