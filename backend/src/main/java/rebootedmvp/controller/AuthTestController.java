// backend/src/main/java/rebootedmvp/controller/AuthTestController.java
package rebootedmvp.controller;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import rebootedmvp.config.SupabaseConfig;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth-test")
public class AuthTestController {

    @Autowired
    private SupabaseConfig supabaseConfig;

    @PostMapping("/generate-token")
    public Map<String, String> generateTestToken(@RequestParam String email, 
                                                @RequestParam String role,
                                                @RequestParam(required = false) String fullName) {
        try {
            // Use the JWT secret from configuration for test token generation
            String jwtSecret = supabaseConfig.getJwtSecret();
            SecretKey key;
            
            try {
                // Try base64 decoding first (for Supabase secrets)
                byte[] keyBytes = Base64.getDecoder().decode(jwtSecret);
                key = Keys.hmacShaKeyFor(keyBytes);
            } catch (Exception e) {
                // Fallback to direct UTF-8 bytes
                byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
                if (keyBytes.length < 32) {
                    byte[] paddedKey = new byte[32];
                    System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
                    keyBytes = paddedKey;
                }
                key = Keys.hmacShaKeyFor(keyBytes);
            }
            
            // Create test claims
            String token = Jwts.builder()
                    .subject("test-user-" + System.currentTimeMillis()) // Mock user ID
                    .claim("email", email)
                    .claim("role", role)
                    .claim("full_name", fullName != null ? fullName : "Test User")
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour
                    .signWith(key)
                    .compact();

            Map<String, String> response = new HashMap<>();
            response.put("token", token);
            response.put("message", "Test token generated for " + email);
            return response;
            
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to generate token: " + e.getMessage());
            return response;
        }
    }
}