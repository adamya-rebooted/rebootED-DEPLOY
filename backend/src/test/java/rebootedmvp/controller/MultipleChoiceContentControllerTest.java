package rebootedmvp.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;
import rebootedmvp.domain.impl.MultipleChoiceQuestionContentImpl;
import rebootedmvp.dto.NewMultipleChoiceQuestionContentDTO;
import rebootedmvp.testdata.DatabaseTestUtils;
import rebootedmvp.testdata.JwtTestUtils;
import rebootedmvp.testdata.TestContentDataBuilder;

import java.util.Arrays;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;

public class MultipleChoiceContentControllerTest extends BaseIntegrationTest {

    @Autowired
    private DatabaseTestUtils databaseTestUtils;

    private DatabaseTestUtils.MCTestDataSet testDataSet;

    @BeforeEach
    @Override
    protected void setUpTestData() {
        // Create test data that will be used across multiple test methods
        testDataSet = databaseTestUtils.createBasicMCTestDataSet();
    }

    // ================================
    // Success Scenarios
    // ================================

    @Test
    public void updateMultipleChoice_WhenValidRequest_ShouldReturnUpdatedContent() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.createUpdateMCQuestionDTO(
            "Updated MC Title", 
            "Updated question text", 
            Arrays.asList("New A", "New B", "New C", "New D"),
            "New B"
        );

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(contentId.intValue())))
                .andExpect(jsonPath("$.title", is("Updated MC Title")))
                .andExpect(jsonPath("$.body", is("Updated question text")))
                .andExpect(jsonPath("$.moduleId", is(testDataSet.getModuleId().intValue())))
                .andExpect(jsonPath("$.options", hasSize(4)))
                .andExpect(jsonPath("$.options[0]", is("New A")))
                .andExpect(jsonPath("$.options[1]", is("New B")))
                .andExpect(jsonPath("$.options[2]", is("New C")))
                .andExpect(jsonPath("$.options[3]", is("New D")))
                .andExpect(jsonPath("$.correctAnswer", is("New B")));

        // Verify the content was actually updated in the database
        MultipleChoiceQuestionContentImpl updatedContent = databaseTestUtils.findMultipleChoiceById(contentId);
        assertNotNull(updatedContent);
        assertEquals("Updated MC Title", updatedContent.getTitle());
        assertEquals("Updated question text", updatedContent.getBody());
        assertEquals(4, updatedContent.getOptions().size());
        assertEquals("New B", updatedContent.getCorrectAnswer());
    }

    @Test
    public void updateMultipleChoice_WhenDifferentNumberOfOptions_ShouldReturnUpdatedContent() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.createUpdateMCQuestionDTO(
            "Quiz with 3 Options", 
            "Which is correct?", 
            Arrays.asList("Alpha", "Beta", "Gamma"),
            "Beta"
        );

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.options", hasSize(3)))
                .andExpect(jsonPath("$.options[0]", is("Alpha")))
                .andExpect(jsonPath("$.options[1]", is("Beta")))
                .andExpect(jsonPath("$.options[2]", is("Gamma")))
                .andExpect(jsonPath("$.correctAnswer", is("Beta")));
    }

    @Test
    public void updateMultipleChoice_WhenScienceQuiz_ShouldReturnUpdatedContent() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.createScienceQuizDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Science Quiz")))
                .andExpect(jsonPath("$.body", is("What is H2O?")))
                .andExpect(jsonPath("$.options", hasSize(4)))
                .andExpect(jsonPath("$.correctAnswer", is("Water")));
    }

    @Test
    public void updateMultipleChoice_WhenMathQuiz_ShouldReturnUpdatedContent() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.createMathQuizDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Math Quiz")))
                .andExpect(jsonPath("$.body", is("What is 2 + 2?")))
                .andExpect(jsonPath("$.correctAnswer", is("4")));
    }

    @Test
    public void updateMultipleChoice_WhenProgrammingQuiz_ShouldReturnUpdatedContent() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.createProgrammingQuizDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Programming Quiz")))
                .andExpect(jsonPath("$.body", is("Which is a Java keyword?")))
                .andExpect(jsonPath("$.correctAnswer", is("public")));
    }

    @Test
    public void updateMultipleChoice_WhenUpdatingOnlyOptions_ShouldUpdateOptionsOnly() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        MultipleChoiceQuestionContentImpl originalContent = testDataSet.getMCContent();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle(originalContent.getTitle()) // Keep original title
            .withBody(originalContent.getBody()) // Keep original body
            .withOptions("New Option 1", "New Option 2", "New Option 3")
            .withCorrectAnswer("New Option 2")
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is(originalContent.getTitle())))
                .andExpect(jsonPath("$.body", is(originalContent.getBody())))
                .andExpect(jsonPath("$.options", hasSize(3)))
                .andExpect(jsonPath("$.correctAnswer", is("New Option 2")));
    }

    // ================================
    // Error Scenarios
    // ================================

    @Test
    public void updateMultipleChoice_WhenContentNotFound_ShouldReturn404() throws Exception {
        // Given
        Long nonExistentId = 99999L;
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.createUpdateMCQuestionDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", nonExistentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isNotFound());

        // Verify that no content was created
        assertFalse(databaseTestUtils.contentExists(nonExistentId));
    }

    @Test
    public void updateMultipleChoice_WhenInvalidRequestData_ShouldReturn400() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        String invalidJson = "{ \"title\": \"\", \"options\": null, \"correctAnswer\": \"\" }";

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateMultipleChoice_WhenMissingTitle_ShouldReturn400() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle(null) // Missing title
            .withBody("Valid body")
            .withOptions("A", "B", "C")
            .withCorrectAnswer("B")
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateMultipleChoice_WhenEmptyOptions_ShouldReturn400() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle("Valid Title")
            .withBody("Valid body")
            .withOptions() // Empty options
            .withCorrectAnswer("A")
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    // ================================
    // Authentication Tests
    // ================================

    @Test
    public void updateMultipleChoice_WhenNotAuthenticated_ShouldReturn401() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.createUpdateMCQuestionDTO();

        // When & Then - No JWT token provided
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    public void updateMultipleChoice_WhenAuthenticatedWithDifferentUser_ShouldReturn403() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.createUpdateMCQuestionDTO(
            "Updated by Different User", 
            "Content updated by a different authenticated user",
            Arrays.asList("User A", "User B", "User C"),
            "User B"
        );

        // When & Then - Different user JWT should be denied access
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwtUserId("different-user-456"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isForbidden());
    }

    // ================================
    // Business Logic Validation Tests
    // ================================

    @Test
    public void updateMultipleChoice_WhenCorrectAnswerNotInOptions_ShouldReturn400() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle("Invalid Answer Test")
            .withBody("Test question with invalid answer")
            .withOptions("A", "B", "C")
            .withCorrectAnswer("D") // Answer not in options
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateMultipleChoice_WhenOnlyOneOption_ShouldReturn400() throws Exception {
        // Given - Multiple choice should have at least 2 options
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle("Single Option Test")
            .withBody("Test question with only one option")
            .withOptions("Only Option")
            .withCorrectAnswer("Only Option")
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateMultipleChoice_WhenNullCorrectAnswer_ShouldReturn400() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle("Null Answer Test")
            .withBody("Test question with null answer")
            .withOptions("A", "B", "C")
            .withCorrectAnswer(null)
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    // ================================
    // Edge Case Tests
    // ================================

    @Test
    public void updateMultipleChoice_WhenDuplicateOptions_ShouldStillWork() throws Exception {
        // Given - Some systems might allow duplicate options
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle("Duplicate Options Test")
            .withBody("Test question with duplicate options")
            .withOptions("Same", "Same", "Different")
            .withCorrectAnswer("Same")
            .buildNewDTO();

        // When & Then - This might be allowed depending on business rules
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.options[0]", is("Same")))
                .andExpect(jsonPath("$.options[1]", is("Same")))
                .andExpect(jsonPath("$.correctAnswer", is("Same")));
    }

    @Test
    public void updateMultipleChoice_WhenLongOptionText_ShouldWork() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        String longOption = "This is a very long option text that tests the system's ability to handle lengthy option descriptions that might exceed normal expectations for multiple choice questions";
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle("Long Option Test")
            .withBody("Test question with very long option text")
            .withOptions("Short", longOption, "Medium length option")
            .withCorrectAnswer(longOption)
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correctAnswer", is(longOption)));
    }

    @Test
    public void updateMultipleChoice_WhenSpecialCharactersInOptions_ShouldWork() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle("Special Characters Test")
            .withBody("Test question with special characters: ñäöü")
            .withOptions("Café", "Naïve", "Résumé", "Piñata")
            .withCorrectAnswer("Café")
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correctAnswer", is("Café")))
                .andExpect(jsonPath("$.options", contains("Café", "Naïve", "Résumé", "Piñata")));
    }

    @Test
    public void updateMultipleChoice_WhenManyOptions_ShouldWork() throws Exception {
        // Given - Test with more options than typical
        Long contentId = testDataSet.getMCContentId();
        List<String> manyOptions = Arrays.asList(
            "Option 1", "Option 2", "Option 3", "Option 4", "Option 5", 
            "Option 6", "Option 7", "Option 8", "Option 9", "Option 10"
        );
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle("Many Options Test")
            .withBody("Test question with many options")
            .withOptions(manyOptions)
            .withCorrectAnswer("Option 5")
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.options", hasSize(10)))
                .andExpect(jsonPath("$.correctAnswer", is("Option 5")));
    }

    @Test
    public void updateMultipleChoice_WhenUpdatingSameData_ShouldReturnUnchangedContent() throws Exception {
        // Given
        Long contentId = testDataSet.getMCContentId();
        MultipleChoiceQuestionContentImpl originalContent = testDataSet.getMCContent();
        NewMultipleChoiceQuestionContentDTO updateDTO = TestContentDataBuilder.multipleChoiceContent()
            .withTitle(originalContent.getTitle())
            .withBody(originalContent.getBody())
            .withOptions(originalContent.getOptions())
            .withCorrectAnswer(originalContent.getCorrectAnswer())
            .buildNewDTO();

        // When & Then
        mockMvc.perform(put("/api/content/updateMultipleChoice/{id}", contentId)
                .with(JwtTestUtils.withMockJwt())
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is(originalContent.getTitle())))
                .andExpect(jsonPath("$.body", is(originalContent.getBody())))
                .andExpect(jsonPath("$.correctAnswer", is(originalContent.getCorrectAnswer())));
    }
}