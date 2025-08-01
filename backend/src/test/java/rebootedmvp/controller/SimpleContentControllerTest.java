package rebootedmvp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import rebootedmvp.dto.ContentDTO;
import rebootedmvp.dto.NewTextContentDTO;
import rebootedmvp.dto.TextContentDTO;
import rebootedmvp.service.ContentService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(ContentController.class)
public class SimpleContentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ContentService contentService;

    private ContentDTO mockContentDTO;
    private NewTextContentDTO updateDTO;

    @BeforeEach
    void setUp() {
        mockContentDTO = new TextContentDTO(1L, "Test Title", "Test Body", false, 1L);
        updateDTO = new NewTextContentDTO("Updated Title", "Updated Body", 1L);
    }

    @Test
    @WithMockUser
    public void updateTextContent_WhenValidRequest_ShouldReturnUpdatedContent() throws Exception {
        // Given
        Long contentId = 1L;
        ContentDTO updatedContent = new TextContentDTO(contentId, "Updated Title", "Updated Body", false, 1L);
        
        when(contentService.update(eq(contentId), any(NewTextContentDTO.class)))
            .thenReturn(updatedContent);

        // When & Then
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(contentId.intValue())))
                .andExpect(jsonPath("$.title", is("Updated Title")))
                .andExpect(jsonPath("$.body", is("Updated Body")))
                .andExpect(jsonPath("$.moduleId", is(1)))
                .andExpect(jsonPath("$.complete", is(false)));
    }

    @Test
    @WithMockUser
    public void updateTextContent_WhenContentNotFound_ShouldReturn404() throws Exception {
        // Given
        Long nonExistentId = 99999L;

        when(contentService.update(eq(nonExistentId), any(NewTextContentDTO.class)))
            .thenReturn(null);

        // When & Then
        mockMvc.perform(put("/api/content/updateText/{id}", nonExistentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void updateTextContent_WhenInvalidRequestData_ShouldReturn400() throws Exception {
        // Given
        Long contentId = 1L;
        String invalidJson = "{ \"title\": \"\", \"body\": null }";

        // When & Then
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void updateTextContent_WhenNotAuthenticated_ShouldReturn401() throws Exception {
        // Given
        Long contentId = 1L;

        // When & Then - No authentication
        mockMvc.perform(put("/api/content/updateText/{id}", contentId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(asJsonString(updateDTO)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void getContentById_WhenExists_ShouldReturnContent() throws Exception {
        // Given
        Long contentId = 1L;
        when(contentService.findById(contentId)).thenReturn(mockContentDTO);

        // When & Then
        mockMvc.perform(get("/api/content/{id}", contentId))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id", is(contentId.intValue())))
                .andExpect(jsonPath("$.title", is("Test Title")))
                .andExpect(jsonPath("$.body", is("Test Body")));
    }

    @Test
    @WithMockUser
    public void getContentById_WhenNotFound_ShouldReturn404() throws Exception {
        // Given
        Long nonExistentId = 99999L;
        when(contentService.findById(nonExistentId)).thenReturn(null);

        // When & Then
        mockMvc.perform(get("/api/content/{id}", nonExistentId))
                .andExpect(status().isNotFound());
    }

    private String asJsonString(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("Failed to convert object to JSON string", e);
        }
    }
}