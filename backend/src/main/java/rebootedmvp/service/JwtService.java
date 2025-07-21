package rebootedmvp.service;

import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final JwtDecoder jwtDecoder;

    public JwtService(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    public String extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid Authorization header");
        }
        
        String token = authHeader.substring(7);
        try {
            Jwt jwt = jwtDecoder.decode(token);
            return jwt.getSubject(); // Returns the 'sub' claim (Supabase user ID)
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    public String extractUserEmail(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Invalid Authorization header");
        }
        
        String token = authHeader.substring(7);
        try {
            Jwt jwt = jwtDecoder.decode(token);
            return jwt.getClaimAsString("email");
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }
}