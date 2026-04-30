package com.eden.api.service;

import com.eden.api.dto.SearchExtractionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiService {

    // Pulls the API key securely from application.properties
    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    @SuppressWarnings("unchecked")
    public SearchExtractionDTO extractSearchParameters(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey;

        // Escape quotes to prevent breaking the JSON payload
        String safePrompt = prompt.replace("\"", "\\\"");

        // Construct the payload using Java 17 Text Blocks and Gemini's Structured Outputs Schema
        String requestBody = """
        {
          "contents": [{
            "parts": [{"text": "Extract the location, vibes, and max budget from this user query: \\"%s\\""}]
          }],
          "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
              "type": "OBJECT",
              "properties": {
                "location": {"type": "STRING"},
                "vibes": {"type": "ARRAY", "items": {"type": "STRING"}},
                "maxBudget": {"type": "NUMBER"}
              }
            }
          }
        }
        """.formatted(safePrompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            // Make the synchronous POST request
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            
            // Navigate the nested JSON response to extract the actual text result
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String jsonText = (String) parts.get(0).get("text");

            // Convert the strict JSON string directly into our Java Record/Class
            return objectMapper.readValue(jsonText, SearchExtractionDTO.class);
            
        } catch (Exception e) {
            System.err.println("Gemini extraction failed: " + e.getMessage());
            // Return an empty object so the app doesn't crash, it just falls back to default search
            return new SearchExtractionDTO();
        }
    }
}
