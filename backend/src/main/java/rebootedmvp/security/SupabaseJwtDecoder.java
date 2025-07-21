package rebootedmvp.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.Base64;
import java.util.Collections;
import java.util.Map;

@Component
public class SupabaseJwtDecoder implements JwtDecoder {
    
    private final String supabaseUrl;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    public SupabaseJwtDecoder(@Value("${supabase.project-url}") String supabaseUrl) {
        this.supabaseUrl = supabaseUrl;
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    public Jwt decode(String token) throws JwtException {
        try {
            // Call Supabase Auth server to validate token
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                supabaseUrl + "/auth/v1/user",
                HttpMethod.GET,
                entity,
                String.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                // Parse the original JWT to get claims
                String[] chunks = token.split("\\.");
                if (chunks.length != 3) {
                    throw new JwtException("Invalid JWT format");
                }
                
                String payload = new String(Base64.getUrlDecoder().decode(chunks[1]));
                @SuppressWarnings("unchecked")
                Map<String, Object> claims = objectMapper.readValue(payload, Map.class);
                
                return createJwt(token, claims);
            } else {
                throw new JwtException("Invalid token - Auth server returned: " + response.getStatusCode());
            }
        } catch (Exception e) {
            throw new JwtException("Failed to validate token with Supabase Auth server: " + e.getMessage(), e);
        }
    }
    
    private Jwt createJwt(String token, Map<String, Object> claims) {
        // Extract timestamps safely
        Instant issuedAt = extractInstant(claims, "iat");
        Instant expiresAt = extractInstant(claims, "exp");
        
        return new Jwt(
            token,
            issuedAt,
            expiresAt,
            Collections.singletonMap("alg", "HS256"),
            claims
        );
    }
    
    private Instant extractInstant(Map<String, Object> claims, String claim) {
        Object value = claims.get(claim);
        if (value instanceof Number) {
            return Instant.ofEpochSecond(((Number) value).longValue());
        }
        return Instant.now(); // fallback
    }
} 