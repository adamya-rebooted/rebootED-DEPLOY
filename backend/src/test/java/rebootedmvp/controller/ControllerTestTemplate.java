package rebootedmvp.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import rebootedmvp.testdata.DatabaseTestUtils;
import rebootedmvp.testdata.JwtTestUtils;
import rebootedmvp.testdata.TestContentDataBuilder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Template for creating new controller integration tests.
 * 
 * Copy this file and replace YourController with your actual controller name.
 * Update the endpoint URLs, request/response DTOs, and test scenarios as needed.
 * 
 * This template demonstrates common testing patterns for REST endpoints.
 * 
 * TO USE THIS TEMPLATE:
 * 1. Copy this file to YourControllerTest.java
 * 2. Replace all instances of "YourController" with your actual controller name
 * 3. Update endpoint URLs to match your controller's mappings
 * 4. Replace DTO types and test data as appropriate
 * 5. Remove this comment block
 */
class YourControllerTest extends BaseIntegrationTest {

    @Autowired
    private DatabaseTestUtils databaseTestUtils;

    private DatabaseTestUtils.TestDataSet testDataSet;

    @BeforeEach
    @Override
    protected void setUpTestData() {
        // Create test data that will be used across multiple test methods
        testDataSet = databaseTestUtils.createBasicTestDataSet();
        
        // Or create custom test data:
        // YourEntityImpl entity = databaseTestUtils.saveYourEntity("Title", "Body", parentId);
    }

    // ================================
    // Happy Path Tests
    // ================================

    @Test
    public void createEntity_WhenValidRequest_ShouldReturnCreatedEntity() throws Exception {
        // Given
        // YourCreateDTO createDTO = TestDataBuilder.createYourEntityDTO();

        // When & Then
        mockMvc.perform(post("/api/your-endpoint")
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")) // Replace with asJsonString(createDTO)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
                // Add more specific assertions:
                // .andExpect(jsonPath("$.id", notNullValue()))
                // .andExpect(jsonPath("$.title", is("Expected Title")));

        // Verify database state if needed
        // assertEquals(1, databaseTestUtils.countYourEntities());
    }

    @Test
    public void getEntity_WhenExists_ShouldReturnEntity() throws Exception {
        // Given
        Long entityId = testDataSet.getContentId(); // Replace with appropriate entity ID

        // When & Then
        mockMvc.perform(get("/api/your-endpoint/{id}", entityId)
                .with(JwtTestUtils.withMockJwt()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
                // Add specific assertions:
                // .andExpect(jsonPath("$.id", is(entityId.intValue())))
                // .andExpect(jsonPath("$.title", is("Expected Title")));
    }

    @Test
    public void updateEntity_WhenValidRequest_ShouldReturnUpdatedEntity() throws Exception {
        // Given
        Long entityId = testDataSet.getContentId(); // Replace with appropriate entity ID
        // YourUpdateDTO updateDTO = TestDataBuilder.createUpdateDTO("New Title", "New Body");

        // When & Then
        mockMvc.perform(put("/api/your-endpoint/{id}", entityId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")) // Replace with asJsonString(updateDTO)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
                // Add specific assertions:
                // .andExpect(jsonPath("$.title", is("New Title")))
                // .andExpect(jsonPath("$.body", is("New Body")));

        // Verify database state
        // YourEntityImpl updatedEntity = databaseTestUtils.findYourEntityById(entityId);
        // assertEquals("New Title", updatedEntity.getTitle());
    }

    @Test
    public void deleteEntity_WhenExists_ShouldReturnNoContent() throws Exception {
        // Given
        Long entityId = testDataSet.getContentId(); // Replace with appropriate entity ID

        // When & Then
        mockMvc.perform(delete("/api/your-endpoint/{id}", entityId)
                .with(JwtTestUtils.withMockJwt()))
                .andExpect(status().isNoContent());

        // Verify entity was deleted
        // assertFalse(databaseTestUtils.yourEntityExists(entityId));
    }

    @Test
    public void getAllEntities_WhenEntitiesExist_ShouldReturnEntityList() throws Exception {
        // Given - test data already created in setUp

        // When & Then
        mockMvc.perform(get("/api/your-endpoint")
                .with(JwtTestUtils.withMockJwt()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
                // Add assertions for list:
                // .andExpected(jsonPath("$", hasSize(greaterThan(0))))
                // .andExpected(jsonPath("$[0].id", notNullValue()));
    }

    // ================================
    // Error Condition Tests
    // ================================

    @Test
    public void getEntity_WhenNotFound_ShouldReturn404() throws Exception {
        // Given
        Long nonExistentId = 99999L;

        // When & Then
        mockMvc.perform(get("/api/your-endpoint/{id}", nonExistentId)
                .with(JwtTestUtils.withMockJwt()))
                .andExpect(status().isNotFound());
    }

    @Test
    public void updateEntity_WhenNotFound_ShouldReturn404() throws Exception {
        // Given
        Long nonExistentId = 99999L;
        // YourUpdateDTO updateDTO = TestDataBuilder.createUpdateDTO();

        // When & Then
        mockMvc.perform(put("/api/your-endpoint/{id}", nonExistentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")) // Replace with asJsonString(updateDTO)
                .andExpect(status().isNotFound());
    }

    @Test
    public void deleteEntity_WhenNotFound_ShouldReturn404() throws Exception {
        // Given
        Long nonExistentId = 99999L;

        // When & Then
        mockMvc.perform(delete("/api/your-endpoint/{id}", nonExistentId)
                .with(JwtTestUtils.withMockJwt()))
                .andExpect(status().isNotFound());
    }

    @Test
    public void createEntity_WhenInvalidData_ShouldReturn400() throws Exception {
        // Given
        String invalidJson = "{ \"title\": \"\", \"body\": null }"; // Adjust invalid data structure

        // When & Then
        mockMvc.perform(post("/api/your-endpoint")
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateEntity_WhenInvalidData_ShouldReturn400() throws Exception {
        // Given
        Long entityId = testDataSet.getContentId(); // Replace with appropriate entity ID
        String invalidJson = "{ \"title\": \"\", \"body\": null }"; // Adjust invalid data structure

        // When & Then
        mockMvc.perform(put("/api/your-endpoint/{id}", entityId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    // ================================
    // Authentication Tests
    // ================================

    @Test
    public void createEntity_WhenNotAuthenticated_ShouldReturn401() throws Exception {
        // Given
        // YourCreateDTO createDTO = TestDataBuilder.createYourEntityDTO();

        // When & Then - No JWT token provided
        mockMvc.perform(post("/api/your-endpoint")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")) // Replace with asJsonString(createDTO)
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void getEntity_WhenNotAuthenticated_ShouldReturn401() throws Exception {
        // Given
        Long entityId = testDataSet.getContentId(); // Replace with appropriate entity ID

        // When & Then - No JWT token provided
        mockMvc.perform(get("/api/your-endpoint/{id}", entityId))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void updateEntity_WhenDifferentUser_ShouldWork() throws Exception {
        // Given
        Long entityId = testDataSet.getContentId(); // Replace with appropriate entity ID
        // YourUpdateDTO updateDTO = TestDataBuilder.createUpdateDTO();

        // When & Then - Different user JWT
        mockMvc.perform(put("/api/your-endpoint/{id}", entityId)
                .with(JwtTestUtils.withMockJwtUserId("different-user-456"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")) // Replace with asJsonString(updateDTO)
                .andExpect(status().isOk());
                // Add specific assertions based on your business logic
    }

    // ================================
    // Edge Case Tests
    // ================================

    @Test
    public void updateEntity_WhenSameData_ShouldReturnUnchangedEntity() throws Exception {
        // Given
        Long entityId = testDataSet.getContentId(); // Replace with appropriate entity ID
        // YourEntityImpl originalEntity = testDataSet.getContent(); // Replace with appropriate entity
        // YourUpdateDTO updateDTO = TestDataBuilder.createDTOFromEntity(originalEntity);

        // When & Then
        mockMvc.perform(put("/api/your-endpoint/{id}", entityId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")) // Replace with asJsonString(updateDTO)
                .andExpect(status().isOk());
                // Add assertions to verify no change
    }

    @Test
    public void updateEntity_WhenPartialData_ShouldUpdateOnlyProvidedFields() throws Exception {
        // Given
        Long entityId = testDataSet.getContentId(); // Replace with appropriate entity ID
        // YourUpdateDTO partialUpdateDTO = TestDataBuilder.createPartialUpdateDTO();

        // When & Then
        mockMvc.perform(put("/api/your-endpoint/{id}", entityId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}")) // Replace with asJsonString(partialUpdateDTO)
                .andExpect(status().isOk());

        // Verify in database that only specified fields were updated
        // YourEntityImpl updatedEntity = databaseTestUtils.findYourEntityById(entityId);
        // assertEquals("New Value", updatedEntity.getSpecificField());
        // assertEquals("Original Value", updatedEntity.getUnchangedField());
    }

    // ================================
    // Helper Methods
    // ================================

    private void assertEntityMatches(/* YourEntityImpl expected, YourEntityImpl actual */) {
        // Helper method to assert entity properties
        // assertEquals(expected.getTitle(), actual.getTitle());
        // assertEquals(expected.getBody(), actual.getBody());
        // etc.
    }
}