package rebootedmvp.service;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;

import rebootedmvp.User;
import rebootedmvp.UserMapper;
import rebootedmvp.exception.UserNotAuthenticatedException;
import rebootedmvp.repository.UserProfileRepository;

/**
 * Service for extracting and managing the current authenticated user context.
 * Provides a clean interface to get the current user from Spring Security context.
 */
@Service
public class AuthenticationContextService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationContextService.class);
    
    @Autowired
    private UserProfileRepository userRepository;
    
    /**
     * Gets the current authenticated user from the security context.
     * 
     * @return The current authenticated User
     * @throws UserNotAuthenticatedException if no authenticated user is found
     */
    public User getCurrentUser() throws UserNotAuthenticatedException {
        logger.debug("Extracting current user from security context");
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null) {
            logger.warn("No authentication found in security context");
            throw new UserNotAuthenticatedException("No authenticated user found");
        }
        
        if (!(authentication instanceof JwtAuthenticationToken)) {
            logger.warn("Authentication is not a JWT token: {}", authentication.getClass().getSimpleName());
            throw new UserNotAuthenticatedException("Invalid authentication type");
        }
        
        JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
        Jwt jwt = jwtAuth.getToken();
        
        String supabaseUserId = jwt.getSubject();
        if (supabaseUserId == null || supabaseUserId.trim().isEmpty()) {
            logger.warn("JWT token has no subject/user ID");
            throw new UserNotAuthenticatedException("Invalid JWT token - no user ID");
        }
        
        logger.debug("Found JWT authentication for user: {}", supabaseUserId);
        
        // Find the user in our backend database
        Optional<User> userOpt = userRepository.findBySupabaseUserId(supabaseUserId)
                .map(UserMapper::toDomain);
        
        if (userOpt.isEmpty()) {
            logger.warn("Authenticated user {} not found in backend database", supabaseUserId);
            throw new UserNotAuthenticatedException("User not found in system");
        }
        
        User user = userOpt.get();
        logger.debug("Successfully extracted current user: {} (ID: {})", supabaseUserId, user.getId());
        
        return user;
    }
    
    /**
     * Gets the current authenticated user's Supabase ID.
     * 
     * @return The current user's Supabase ID
     * @throws UserNotAuthenticatedException if no authenticated user is found
     */
    public String getCurrentUserId() throws UserNotAuthenticatedException {
        return getCurrentUser().getSupabaseUserId();
    }
    
    /**
     * Gets the current authenticated user's internal database ID.
     * 
     * @return The current user's database ID
     * @throws UserNotAuthenticatedException if no authenticated user is found
     */
    public Long getCurrentUserDatabaseId() throws UserNotAuthenticatedException {
        return getCurrentUser().getId();
    }
    
    /**
     * Checks if there is a currently authenticated user.
     * 
     * @return true if a user is authenticated, false otherwise
     */
    public boolean isUserAuthenticated() {
        try {
            getCurrentUser();
            return true;
        } catch (UserNotAuthenticatedException e) {
            return false;
        }
    }
}