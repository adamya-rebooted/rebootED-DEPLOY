package rebootedmvp.testdata;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.time.Instant;
import java.util.Collections;
import java.util.Map;

public class JwtTestUtils {

    public static final String DEFAULT_TEST_USER_ID = "test-user-123";
    public static final String DEFAULT_TEST_EMAIL = "test@example.com";
    public static final String DEFAULT_TEST_ROLE = "authenticated";

    public static Jwt createMockJwt(String userId, String email, String role) {
        Map<String, Object> headers = Map.of(
            "alg", "ES256",
            "typ", "JWT"
        );
        
        Map<String, Object> claims = Map.of(
            "sub", userId,
            "email", email,
            "role", role,
            "iat", Instant.now().getEpochSecond(),
            "exp", Instant.now().plusSeconds(3600).getEpochSecond(),
            "iss", "https://snvasvzrqiordsgmfcai.supabase.co/auth/v1",
            "aud", "authenticated"
        );

        return new Jwt(
            "mock-jwt-token",
            Instant.now(),
            Instant.now().plusSeconds(3600),
            headers,
            claims
        );
    }

    public static Jwt createDefaultMockJwt() {
        return createMockJwt(DEFAULT_TEST_USER_ID, DEFAULT_TEST_EMAIL, DEFAULT_TEST_ROLE);
    }

    public static JwtAuthenticationToken createMockJwtAuthenticationToken(String userId, String email, String role) {
        Jwt jwt = createMockJwt(userId, email, role);
        return new JwtAuthenticationToken(
            jwt,
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
        );
    }

    public static JwtAuthenticationToken createDefaultMockJwtAuthenticationToken() {
        return createMockJwtAuthenticationToken(DEFAULT_TEST_USER_ID, DEFAULT_TEST_EMAIL, DEFAULT_TEST_ROLE);
    }

    public static RequestPostProcessor withMockJwt() {
        return withMockJwt(DEFAULT_TEST_USER_ID, DEFAULT_TEST_EMAIL, DEFAULT_TEST_ROLE);
    }

    public static RequestPostProcessor withMockJwt(String userId, String email, String role) {
        return SecurityMockMvcRequestPostProcessors.jwt()
            .jwt(jwt -> jwt
                .subject(userId)
                .claim("email", email)
                .claim("role", role)
                .claim("iss", "https://snvasvzrqiordsgmfcai.supabase.co/auth/v1")
                .claim("aud", "authenticated")
            );
    }

    public static RequestPostProcessor withMockJwtUserId(String userId) {
        return withMockJwt(userId, DEFAULT_TEST_EMAIL, DEFAULT_TEST_ROLE);
    }

    public static RequestPostProcessor withMockJwtRole(String role) {
        return withMockJwt(DEFAULT_TEST_USER_ID, DEFAULT_TEST_EMAIL, role);
    }
}