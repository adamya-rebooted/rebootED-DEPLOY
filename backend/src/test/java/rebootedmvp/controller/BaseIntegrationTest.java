package rebootedmvp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import rebootedmvp.config.TestSecurityConfig;
import rebootedmvp.repository.ContentRepository;
import rebootedmvp.repository.ModuleRepository;
import rebootedmvp.repository.CourseRepository;
import rebootedmvp.repository.UserProfileRepository;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Transactional
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected ContentRepository contentRepository;

    @Autowired
    protected ModuleRepository moduleRepository;

    @Autowired
    protected CourseRepository courseRepository;

    @Autowired
    protected UserProfileRepository userProfileRepository;

    @BeforeEach
    void setUp() {
        // Common setup logic that can be overridden in subclasses
        setUpTestData();
    }

    protected void setUpTestData() {
        // Override this method in subclasses to set up specific test data
    }

    protected String asJsonString(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert object to JSON string", e);
        }
    }

    protected <T> T fromJsonString(String json, Class<T> valueType) {
        try {
            return objectMapper.readValue(json, valueType);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse JSON string to object", e);
        }
    }
}