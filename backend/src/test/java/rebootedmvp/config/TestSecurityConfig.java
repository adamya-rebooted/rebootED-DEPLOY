package rebootedmvp.config;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

@TestConfiguration
@Profile("test")
@EnableWebSecurity
public class TestSecurityConfig {

    @Bean("testSecurityFilterChain")
    @Primary
    public SecurityFilterChain testFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(mockJwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            );

        return http.build();
    }

    @Bean("testJwtDecoder")
    @Primary
    public JwtDecoder mockJwtDecoder() {
        return new JwtDecoder() {
            @Override
            public Jwt decode(String token) throws org.springframework.security.oauth2.jwt.JwtException {
                // Create a mock JWT for testing
                // In real tests, this will be overridden with specific test data
                Map<String, Object> headers = Map.of(
                    "alg", "ES256",
                    "typ", "JWT"
                );
                
                Map<String, Object> claims = Map.of(
                    "sub", "test-user-id",
                    "email", "test@example.com",
                    "role", "authenticated",
                    "iat", Instant.now().getEpochSecond(),
                    "exp", Instant.now().plusSeconds(3600).getEpochSecond()
                );

                return new Jwt(
                    token,
                    Instant.now(),
                    Instant.now().plusSeconds(3600),
                    headers,
                    claims
                );
            }
        };
    }

    @Bean("testJwtAuthenticationConverter")
    @Primary
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            String role = jwt.getClaimAsString("role");
            if (role != null) {
                return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));
            }
            return Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
        });
        
        return converter;
    }

    @Bean("testCorsConfigurationSource")
    @Primary
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}