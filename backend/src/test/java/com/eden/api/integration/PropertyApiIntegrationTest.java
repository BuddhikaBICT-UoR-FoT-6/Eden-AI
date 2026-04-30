package com.eden.api.integration;

import com.eden.api.repository.PropertyRepository;
import com.eden.api.repository.VibeRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration Test — loads the full Spring ApplicationContext.
 * Connects to a real (test-profile) database and validates actual API response shapes.
 *
 * Requires the application to be configured with the 'test' profile
 * pointing to a test PostgreSQL database (or an H2 in-memory database).
 *
 * To run: mvn test -Dspring.profiles.active=test
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PropertyApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private VibeRepository vibeRepository;

    @Test
    @DisplayName("GET /api/properties should return HTTP 200 and a JSON array")
    void getAllProperties_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/properties")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/properties/search?location=Yala should return HTTP 200")
    void searchByLocation_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/properties/search")
                        .param("location", "Yala")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @DisplayName("GET /api/ai/search?prompt=jungle should return HTTP 200")
    void aiSearch_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/ai/search")
                        .param("prompt", "quiet jungle villa")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}
