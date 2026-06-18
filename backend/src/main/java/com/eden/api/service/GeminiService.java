package com.eden.api.service;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.dto.SearchExtractionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(name = "ai.provider", havingValue = "gemini", matchIfMissing = true)
public class GeminiService implements AiSearchProvider {

    // Pulls the API key securely from application.properties
    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    @SuppressWarnings("unchecked")
    public SearchExtractionDTO extractSearchParameters(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

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

    @Override
    @SuppressWarnings("unchecked")
    public List<PropertyResponseDTO> searchRealWorldProperties(String prompt) {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        String safePrompt = prompt.replace("\"", "\\\"");

        String requestBody = """
        {
          "contents": [{
            "parts": [{"text": "Search for real-world hotels, resorts, or villas in Sri Lanka matching the query: \\"%s\\". Return a list of actual hotels/villas/resorts with realistic prices, descriptions, vibes, contact details, and imageUrls."}]
          }],
          "generationConfig": {
            "responseMimeType": "application/json",
            "responseSchema": {
              "type": "OBJECT",
              "properties": {
                "properties": {
                  "type": "ARRAY",
                  "items": {
                    "type": "OBJECT",
                    "properties": {
                      "name": {"type": "STRING"},
                      "description": {"type": "STRING"},
                      "location": {"type": "STRING"},
                      "pricePerNight": {"type": "NUMBER"},
                      "imageUrl": {"type": "STRING"},
                      "contactDetails": {"type": "STRING"},
                      "vibes": {"type": "ARRAY", "items": {"type": "STRING"}}
                    },
                    "required": ["name", "description", "location", "pricePerNight", "imageUrl", "contactDetails", "vibes"]
                  }
                }
              },
              "required": ["properties"]
            }
          }
        }
        """.formatted(safePrompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            System.out.println("🤖 Querying Gemini for Real-World Properties: " + prompt);
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String jsonText = (String) parts.get(0).get("text");

            RealWorldPropertiesWrapper wrapper = objectMapper.readValue(jsonText, RealWorldPropertiesWrapper.class);
            
            List<PropertyResponseDTO> results = new ArrayList<>();
            if (wrapper != null && wrapper.properties != null) {
                for (RealWorldPropertyDTO p : wrapper.properties) {
                    results.add(PropertyResponseDTO.builder()
                            .id(UUID.randomUUID())
                            .name(p.name)
                            .description(p.description)
                            .location(p.location)
                            .pricePerNight(p.pricePerNight)
                            .imageUrl(p.imageUrl)
                            .contactDetails(p.contactDetails)
                            .vibes(p.vibes)
                            .build());
                }
            }
            return results;
            
        } catch (Exception e) {
            System.err.println("Gemini real-world property search failed: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    // Static helper classes for JSON mapping
    public static class RealWorldPropertiesWrapper {
        public List<RealWorldPropertyDTO> properties;
    }

    public static class RealWorldPropertyDTO {
        public String name;
        public String description;
        public String location;
        public BigDecimal pricePerNight;
        public String imageUrl;
        public String contactDetails;
        public List<String> vibes;
    }
}
