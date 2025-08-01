# Integration Testing Guide

This guide explains how to write and run integration tests for the Spring Boot backend API using the existing Supabase database.

## Overview

Our integration testing approach uses the actual Supabase PostgreSQL database for realistic testing scenarios. Tests are wrapped in transactions that automatically roll back, ensuring no data persistence between test runs.

## Key Components

### 1. Test Configuration

- **`application.yml`** (test resources): Reduced logging and optimized connection pool for tests
- **`TestSecurityConfig`**: Mocks JWT authentication for test scenarios
- **`BaseIntegrationTest`**: Abstract base class providing common test infrastructure

### 2. Test Utilities

- **`JwtTestUtils`**: Helper methods for JWT token mocking
- **`TestContentDataBuilder`**: Builder pattern for creating test data
- **`DatabaseTestUtils`**: Database operations and test data management

## Writing Controller Tests

### Basic Test Structure

```java
public class YourControllerTest extends BaseIntegrationTest {
    
    @Autowired
    private DatabaseTestUtils databaseTestUtils;
    
    private DatabaseTestUtils.TestDataSet testDataSet;
    
    @BeforeEach
    @Override
    protected void setUpTestData() {
        testDataSet = databaseTestUtils.createBasicTestDataSet();
    }
    
    @Test
    public void yourEndpoint_WhenValidRequest_ShouldReturnExpectedResult() throws Exception {
        // Given
        // Set up test data and request parameters
        
        // When & Then
        mockMvc.perform(post("/api/your-endpoint")
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(requestDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.field", is("expectedValue")));
    }
}
```

### Test Scenarios to Cover

1. **Happy Path**: Valid request returns expected response
2. **Not Found**: Non-existent resource returns 404
3. **Bad Request**: Invalid data returns 400
4. **Authentication**: Unauthenticated requests return 401
5. **Edge Cases**: Empty fields, boundary values, etc.

### Authentication in Tests

```java
// Default test user
.with(JwtTestUtils.withMockJwt())

// Specific user ID
.with(JwtTestUtils.withMockJwtUserId("custom-user-123"))

// Specific role
.with(JwtTestUtils.withMockJwtRole("admin"))

// Custom JWT claims
.with(JwtTestUtils.withMockJwt("user-456", "test@example.com", "authenticated"))
```

### Creating Test Data

```java
// Using builders
TextContentImpl content = TestContentDataBuilder.textContent()
    .withTitle("Test Title")
    .withBody("Test Body")
    .withModuleId(moduleId)
    .buildEntity();

// Using database utils
TextContentImpl savedContent = databaseTestUtils.saveTextContent(
    "Title", "Body", moduleId
);

// Complete test data set
DatabaseTestUtils.TestDataSet testData = databaseTestUtils.createBasicTestDataSet();
```

## Running Tests

### Command Line

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=ContentControllerTest

# Run specific test method
./mvnw test -Dtest=ContentControllerTest#updateTextContent_WhenValidRequest_ShouldReturnUpdatedContent
```

### IDE Integration

Most IDEs (IntelliJ IDEA, Eclipse, VS Code) can run tests directly with built-in JUnit support.

## Test Database Behavior

### Transaction Management

- Each test method runs in its own transaction
- Transactions automatically roll back after test completion
- No manual cleanup required
- Tests are isolated from each other

### Data Persistence

- Test data is created in the real database
- Changes are visible during test execution
- All changes are automatically reverted
- No impact on production data

## Best Practices

### 1. Test Naming

Use descriptive test method names that follow the pattern:
```
methodName_WhenCondition_ShouldExpectedBehavior()
```

Examples:
- `updateContent_WhenValidRequest_ShouldReturnUpdatedContent()`
- `getContent_WhenContentNotFound_ShouldReturn404()`
- `createContent_WhenNotAuthenticated_ShouldReturn401()`

### 2. Test Organization

- **Arrange**: Set up test data and conditions
- **Act**: Execute the method under test
- **Assert**: Verify the results

```java
@Test
public void testMethod() throws Exception {
    // Arrange
    Long contentId = testDataSet.getContentId();
    NewTextContentDTO updateDTO = TestContentDataBuilder.createUpdateTextContentDTO();
    
    // Act
    ResultActions result = mockMvc.perform(put("/api/content/updateText/{id}", contentId)
            .with(JwtTestUtils.withMockJwt())
            .contentType(MediaType.APPLICATION_JSON)
            .content(asJsonString(updateDTO)));
    
    // Assert
    result.andExpect(status().isOk())
          .andExpect(jsonPath("$.title", is("Updated Title")));
}
```

### 3. Use Test Data Builders

Prefer builders over constructors for flexible test data creation:

```java
// Good
TextContentImpl content = TestContentDataBuilder.textContent()
    .withTitle("Custom Title")
    .withComplete(true)
    .buildEntity();

// Avoid
TextContentImpl content = new TextContentImpl("Custom Title", "Body", 1L);
content.setComplete(true);
```

### 4. Verify Both Response and Database State

```java
// Verify HTTP response
mockMvc.perform(...)
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.title", is("Updated Title")));

// Verify database state
TextContentImpl updatedContent = databaseTestUtils.findContentById(contentId);
assertEquals("Updated Title", updatedContent.getTitle());
```

## Common Patterns

### Testing CRUD Operations

```java
@Test
public void createEntity_WhenValidData_ShouldReturnCreatedEntity() {
    // Test creation
}

@Test
public void getEntity_WhenExists_ShouldReturnEntity() {
    // Test retrieval
}

@Test
public void updateEntity_WhenValidData_ShouldReturnUpdatedEntity() {
    // Test update
}

@Test
public void deleteEntity_WhenExists_ShouldReturnNoContent() {
    // Test deletion
}
```

### Testing Error Conditions

```java
@Test
public void operation_WhenEntityNotFound_ShouldReturn404() {
    Long nonExistentId = 99999L;
    
    mockMvc.perform(get("/api/entity/{id}", nonExistentId)
            .with(JwtTestUtils.withMockJwt()))
            .andExpect(status().isNotFound());
}

@Test
public void operation_WhenInvalidData_ShouldReturn400() {
    String invalidJson = "{ \"invalid\": \"data\" }";
    
    mockMvc.perform(post("/api/entity")
            .with(JwtTestUtils.withMockJwt())
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidJson))
            .andExpect(status().isBadRequest());
}
```

## Troubleshooting

### Common Issues

1. **Test fails with authentication error**: Ensure you're using `JwtTestUtils.withMockJwt()`
2. **Database connection issues**: Check that Supabase credentials are correct in test `application.yml`
3. **Transaction rollback not working**: Verify `@Transactional` is present on `BaseIntegrationTest`
4. **Test data not found**: Ensure test data is created in `@BeforeEach` method

### Debugging Tips

1. **Enable SQL logging**: Set `spring.jpa.show-sql: true` in test configuration
2. **Check test data**: Use `databaseTestUtils.count*()` methods to verify data creation
3. **Inspect HTTP requests**: Add `.andDo(print())` to MockMvc calls for detailed output

## Example: Complete Test Class

See `ContentControllerTest.java` for a comprehensive example demonstrating all these patterns and practices.