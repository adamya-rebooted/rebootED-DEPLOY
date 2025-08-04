package rebootedmvp.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import rebootedmvp.domain.impl.TextContentImpl;
import rebootedmvp.dto.NewTextContentDTO;
import rebootedmvp.dto.TextContentDTO;
import rebootedmvp.testdata.DatabaseTestUtils;
import rebootedmvp.testdata.JwtTestUtils;
import rebootedmvp.testdata.TestContentDataBuilder;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

public class ContentControllerTest extends BaseIntegrationTest {

    @Autowired
    private DatabaseTestUtils databaseTestUtils;

    private DatabaseTestUtils.TestDataSet testDataSet;

    @BeforeEach
    @Override
    protected void setUpTestData() {
        // Create test data that will be used across multiple test methods
        testDataSet = databaseTestUtils.createBasicTestDataSet();
    }

    @Test
    public void updateTextContent_WhenValidRequest_ShouldReturnUpdatedContent() throws Exception {
        // Given
        Long contentId = testDataSet.getContentId();
        NewTextContentDTO updateDTO = TestContentDataBuilder.createUpdateTextContentDTO(
            "Updated Title", 
            "Updated body content"
        );

        // When & Then
        ResultActions result = mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(contentId.intValue())))
                .andExpect(jsonPath("$.title", is("Updated Title")))
                .andExpect(jsonPath("$.body", is("Updated body content")))
                .andExpect(jsonPath("$.moduleId", is(testDataSet.getModuleId().intValue())))
                .andExpect(jsonPath("$.complete", is(false)));

        // Verify the content was actually updated in the database
        TextContentImpl updatedContent = databaseTestUtils.findContentById(contentId);
        assertNotNull(updatedContent);
        assertEquals("Updated Title", updatedContent.getTitle());
        assertEquals("Updated body content", updatedContent.getBody());
    }

    @Test
    public void updateTextContent_WhenContentNotFound_ShouldReturn404() throws Exception {
        // Given
        Long nonExistentId = 99999L;
        NewTextContentDTO updateDTO = TestContentDataBuilder.createUpdateTextContentDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateText/{id}", nonExistentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isNotFound());

        // Verify that no content was created
        assertFalse(databaseTestUtils.contentExists(nonExistentId));
    }

    @Test
    public void updateTextContent_WhenInvalidRequestData_ShouldReturn400() throws Exception {
        // Given
        Long contentId = testDataSet.getContentId();
        String invalidJson = "{ \"title\": \"\", \"body\": null }"; // Invalid JSON structure

        // When & Then
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateTextContent_WhenMissingTitle_ShouldReturn400() throws Exception {
        // Given
        Long contentId = testDataSet.getContentId();
        NewTextContentDTO updateDTO = TestContentDataBuilder.textContent()
            .withTitle(null) // Missing title
            .withBody("Valid body")
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateTextContent_WhenEmptyTitle_ShouldReturn400() throws Exception {
        // Given
        Long contentId = testDataSet.getContentId();
        NewTextContentDTO updateDTO = TestContentDataBuilder.textContent()
            .withTitle("") // Empty title
            .withBody("Valid body")
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateTextContent_WhenNotAuthenticated_ShouldReturn401() throws Exception {
        // Given
        Long contentId = testDataSet.getContentId();
        NewTextContentDTO updateDTO = TestContentDataBuilder.createUpdateTextContentDTO();

        // When & Then - No JWT token provided
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void updateTextContent_WhenAuthenticatedWithDifferentUser_ShouldReturn403() throws Exception {
        // Given
        Long contentId = testDataSet.getContentId();
        NewTextContentDTO updateDTO = TestContentDataBuilder.createUpdateTextContentDTO(
            "Updated by Different User", 
            "Content updated by a different authenticated user"
        );

        // When & Then - Different user JWT should be denied access
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .with(JwtTestUtils.withMockJwtUserId("different-user-456"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isForbidden());
    }

    @Test
    public void updateTextContent_WhenUpdatingWithSameData_ShouldReturnUpdatedContent() throws Exception {
        // Given
        Long contentId = testDataSet.getContentId();
        TextContentImpl originalContent = testDataSet.getContent();
        NewTextContentDTO updateDTO = TestContentDataBuilder.textContent()
            .withTitle(originalContent.getTitle())
            .withBody(originalContent.getBody())
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is(originalContent.getTitle())))
                .andExpect(jsonPath("$.body", is(originalContent.getBody())));
    }

    @Test
    public void updateTextContent_WhenUpdatingOnlyTitle_ShouldUpdateTitleOnly() throws Exception {
        // Given
        Long contentId = testDataSet.getContentId();
        TextContentImpl originalContent = testDataSet.getContent();
        NewTextContentDTO updateDTO = TestContentDataBuilder.textContent()
            .withTitle("New Title Only")
            .withBody(originalContent.getBody()) // Keep original body
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("New Title Only")))
                .andExpect(jsonPath("$.body", is(originalContent.getBody())));

        // Verify in database
        TextContentImpl updatedContent = databaseTestUtils.findContentById(contentId);
        assertEquals("New Title Only", updatedContent.getTitle());
        assertEquals(originalContent.getBody(), updatedContent.getBody());
    }

    @Test
    public void updateTextContent_WhenUpdatingOnlyBody_ShouldUpdateBodyOnly() throws Exception {
        // Given
        Long contentId = testDataSet.getContentId();
        TextContentImpl originalContent = testDataSet.getContent();
        NewTextContentDTO updateDTO = TestContentDataBuilder.textContent()
            .withTitle(originalContent.getTitle()) // Keep original title
            .withBody("New body content only")
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is(originalContent.getTitle())))
                .andExpect(jsonPath("$.body", is("New body content only")));

        // Verify in database
        TextContentImpl updatedContent = databaseTestUtils.findContentById(contentId);
        assertEquals(originalContent.getTitle(), updatedContent.getTitle());
        assertEquals("New body content only", updatedContent.getBody());
    }
}