package rebootedmvp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import rebootedmvp.User;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    @Autowired
    private rebootedmvp.service.UserSyncService userSyncService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String requestUri = request.getRequestURI();
        logger.debug("===== JWT FILTER PROCESSING REQUEST: {} =====", requestUri);

        try {
            // Check if Spring Security's OAuth2 Resource Server has already validated the JWT
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            
            if (authentication instanceof JwtAuthenticationToken) {
                JwtAuthenticationToken jwtAuth = (JwtAuthenticationToken) authentication;
                Jwt jwt = jwtAuth.getToken();
                
                logger.debug("JWT token validated by OAuth2 Resource Server, syncing user...");
                
                // Sync the user with our backend system (only existing users)
                User user = userSyncService.syncSupabaseUser(jwt);
                
                if (user != null) {
                    logger.info("Successfully synced existing user: '{}' with email: '{}' for request: {}",
                            user.getSupabaseUserId(), user.getEmail(), requestUri);
                } else {
                    // User doesn't exist in backend yet - they need to complete signup
                    String supabaseUserId = jwt.getSubject();
                    String email = jwt.getClaimAsString("email");
                    logger.info("User '{}' with email '{}' not found in backend - should complete signup flow for request: {}", 
                            supabaseUserId, email, requestUri);
                }
            } else {
                logger.debug("No JWT authentication found for request: {}", requestUri);
            }
        } catch (Exception e) {
            logger.error("Cannot sync user for request '{}': {}", requestUri, e.getMessage(), e);
        }

        logger.debug("===== JWT FILTER COMPLETED FOR REQUEST: {} =====", requestUri);
        filterChain.doFilter(request, response);
    }
}