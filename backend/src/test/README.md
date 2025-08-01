# Test Documentation

This directory contains all the tests for the rebootED backend application. The tests are organized to cover different aspects of the content management system, particularly focusing on text content and multiple choice question editing functionality.

## Test Structure

### Main Test Files

#### 1. `SimpleContentControllerTest.java` (145 lines)
**Location**: `controller/SimpleContentControllerTest.java`
**Test Type**: Unit tests with mocked services
**What it tests**: Text content editing functionality

**Key Test Methods**:
- `updateTextContent_WhenValidRequest_ShouldReturnUpdatedContent()` - Tests successful text content updates
- `updateTextContent_WhenContentNotFound_ShouldReturn404()` - Tests 404 when content doesn't exist
- `updateTextContent_WhenInvalidRequestData_ShouldReturn400()` - Tests validation errors
- `updateTextContent_WhenNotAuthenticated_ShouldReturn401()` - Tests authentication requirements
- `getContentById_WhenExists_ShouldReturnContent()` - Tests retrieving content by ID

**Test Approach**: Uses `@WebMvcTest` with mocked `ContentService` for fast, isolated unit testing.

#### 2. `MultipleChoiceContentControllerTest.java` (465 lines)
**Location**: `controller/MultipleChoiceContentControllerTest.java`
**Test Type**: Integration tests with real database
**What it tests**: Multiple choice question content editing functionality

**Key Test Methods**:
- `updateMultipleChoice_WhenValidRequest_ShouldReturnUpdatedContent()` - Tests successful MC question updates
- `updateMultipleChoice_WhenDifferentNumberOfOptions_ShouldReturnUpdatedContent()` - Tests changing option count
- `updateMultipleChoice_WhenContentNotFound_ShouldReturn404()` - Tests 404 scenarios
- `updateMultipleChoice_WhenInvalidRequestData_ShouldReturn400()` - Tests validation
- `updateMultipleChoice_WhenNotAuthenticated_ShouldReturn401()` - Tests authentication
- `updateMultipleChoice_WhenCorrectAnswerNotInOptions_ShouldReturn400()` - Tests business logic validation
- `updateMultipleChoice_WhenOnlyOneOption_ShouldReturn400()` - Tests minimum option requirements
- `updateMultipleChoice_WhenDuplicateOptions_ShouldStillWork()` - Tests edge cases
- `updateMultipleChoice_WhenLongOptionText_ShouldWork()` - Tests boundary conditions
- `updateMultipleChoice_WhenManyOptions_ShouldWork()` - Tests performance with many options

**Test Approach**: Uses `@SpringBootTest` with real database transactions for comprehensive integration testing.

#### 3. `ContentControllerTest.java` (229 lines)
**Location**: `controller/ContentControllerTest.java`
**Test Type**: Integration tests with real database
**What it tests**: Text content editing (alternative approach to SimpleContentControllerTest)

**Key Test Methods**:
- `updateTextContent_WhenValidRequest_ShouldReturnUpdatedContent()` - Tests successful updates
- `updateTextContent_WhenContentNotFound_ShouldReturn404()` - Tests 404 scenarios
- `updateTextContent_WhenInvalidRequestData_ShouldReturn400()` - Tests validation
- `updateTextContent_WhenMissingTitle_ShouldReturn400()` - Tests required field validation
- `updateTextContent_WhenNotAuthenticated_ShouldReturn401()` - Tests authentication
- `updateTextContent_WhenUpdatingOnlyTitle_ShouldUpdateTitleOnly()` - Tests partial updates
- `updateTextContent_WhenUpdatingOnlyBody_ShouldUpdateBodyOnly()` - Tests partial updates

**Test Approach**: Uses `@SpringBootTest` with real database, similar to MultipleChoiceContentControllerTest.

### Supporting Files

#### 4. `ControllerTestTemplate.java` (295 lines)
**Location**: `controller/ControllerTestTemplate.java`
**Purpose**: Template file for creating new controller tests
**What it contains**: Example test patterns and common testing scenarios

**Key Sections**:
- Happy path tests (create, read, update, delete)
- Error handling tests (404, 400, 401)
- Authentication tests
- Validation tests
- Edge case examples

**Usage**: Copy this file and replace "YourController" with actual controller name, then customize endpoints and DTOs.

#### 5. `BaseIntegrationTest.java` (68 lines)
**Location**: `controller/BaseIntegrationTest.java`
**Purpose**: Base class providing common testing infrastructure
**What it provides**:
- `MockMvc` for HTTP request testing
- `ObjectMapper` for JSON serialization/deserialization
- Repository access for database operations
- Common setup methods
- JSON utility methods (`asJsonString`, `fromJsonString`)

**Usage**: Extend this class for integration tests that need database access.

### Configuration and Utilities

#### 6. `TestSecurityConfig.java` (114 lines)
**Location**: `config/TestSecurityConfig.java`
**Purpose**: Security configuration for tests
**What it provides**: JWT authentication setup for test scenarios

#### 7. `DatabaseTestUtils.java` (214 lines)
**Location**: `testdata/DatabaseTestUtils.java`
**Purpose**: Database testing utilities
**What it provides**:
- Test data creation methods
- Database cleanup utilities
- Entity finding methods
- Test dataset builders

#### 8. `TestContentDataBuilder.java` (258 lines)
**Location**: `testdata/TestContentDataBuilder.java`
**Purpose**: Test data builder for content entities
**What it provides**:
- Builder pattern for creating test DTOs
- Predefined test scenarios
- Fluent API for test data creation

#### 9. `JwtTestUtils.java` (82 lines)
**Location**: `testdata/JwtTestUtils.java`
**Purpose**: JWT testing utilities
**What it provides**:
- Mock JWT token creation
- Authentication helper methods
- JWT validation utilities

## Test Coverage

### Content Management Features Tested

1. **Text Content Editing**
   - ✅ Create text content
   - ✅ Update text content (title and body)
   - ✅ Partial updates (title only, body only)
   - ✅ Validation (required fields, invalid data)
   - ✅ Authentication requirements
   - ✅ Error handling (404, 400, 401)

2. **Multiple Choice Question Editing**
   - ✅ Create MC questions
   - ✅ Update MC questions (title, body, options, correct answer)
   - ✅ Variable number of options (3, 4, many)
   - ✅ Business logic validation (correct answer must be in options)
   - ✅ Minimum requirements (at least 2 options)
   - ✅ Edge cases (duplicate options, long text, special characters)
   - ✅ Authentication and authorization
   - ✅ Comprehensive error handling

### HTTP Endpoints Tested

- `PUT /api/content/updateText/{id}` - Text content updates
- `PUT /api/content/updateMultipleChoice/{id}` - MC question updates
- `GET /api/content/{id}` - Content retrieval

## Running Tests

### Prerequisites
- Java 17+
- Maven
- Test database configured

### Commands

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=MultipleChoiceContentControllerTest

# Run specific test method
mvn test -Dtest=MultipleChoiceContentControllerTest#updateMultipleChoice_WhenValidRequest_ShouldReturnUpdatedContent

# Run tests with coverage
mvn test jacoco:report
```

## Adding New Tests

### For New Controllers

1. **Copy the template**:
   ```bash
   cp src/test/java/rebootedmvp/controller/ControllerTestTemplate.java src/test/java/rebootedmvp/controller/YourControllerTest.java
   ```

2. **Update the template**:
   - Replace `YourController` with actual controller name
   - Update endpoint URLs
   - Replace DTO types
   - Customize test scenarios

3. **Extend BaseIntegrationTest** for integration tests or use `@WebMvcTest` for unit tests

### Test Naming Convention

Use the pattern: `methodName_WhenCondition_ShouldReturnExpectedResult()`

Examples:
- `updateTextContent_WhenValidRequest_ShouldReturnUpdatedContent()`
- `updateMultipleChoice_WhenContentNotFound_ShouldReturn404()`
- `createCourse_WhenNotAuthenticated_ShouldReturn401()`

### Test Data Setup

Use the provided utilities:
- `DatabaseTestUtils` for database operations
- `TestContentDataBuilder` for creating test DTOs
- `JwtTestUtils` for authentication

## Best Practices

1. **Test Organization**: Group tests by functionality (happy path, error cases, edge cases)
2. **Test Data**: Use builders and utilities for consistent test data
3. **Assertions**: Test both HTTP response and database state
4. **Cleanup**: Use `@Transactional` for automatic rollback
5. **Isolation**: Each test should be independent and not rely on other tests

## Common Patterns

### Integration Test Structure
```java
@Test
public void methodName_WhenCondition_ShouldReturnExpectedResult() throws Exception {
    // Given - Set up test data
    Long entityId = testDataSet.getEntityId();
    YourDTO updateDTO = TestDataBuilder.createUpdateDTO();

    // When & Then - Execute and verify
    mockMvc.perform(put("/api/endpoint/{id}", entityId)
            .with(JwtTestUtils.withMockJwt())
            .contentType(MediaType.APPLICATION_JSON)
            .content(asJsonString(updateDTO)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.field", is("expectedValue")));

    // Verify database state
    YourEntityImpl updatedEntity = databaseTestUtils.findEntityById(entityId);
    assertNotNull(updatedEntity);
    assertEquals("expectedValue", updatedEntity.getField());
}
```

### Unit Test Structure
```java
@Test
@WithMockUser
public void methodName_WhenCondition_ShouldReturnExpectedResult() throws Exception {
    // Given
    when(service.method(any())).thenReturn(expectedResult);

    // When & Then
    mockMvc.perform(put("/api/endpoint/{id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(asJsonString(requestDTO)))
            .andExpect(status().isOk());
}
```

## Troubleshooting

### Common Issues

1. **Test fails with authentication errors**: Ensure `JwtTestUtils.withMockJwt()` is used
2. **Database state not as expected**: Check that `@Transactional` is present
3. **JSON serialization errors**: Verify DTO classes have proper getters/setters
4. **Test isolation issues**: Ensure each test cleans up its data

### Debug Tips

- Use `@DirtiesContext` if tests interfere with each other
- Add `@TestPropertySource` for test-specific properties
- Use `@Sql` for complex database setup
- Enable debug logging: `logging.level.rebootedmvp=DEBUG` 