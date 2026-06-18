package com.eden.api.service;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.dto.SearchExtractionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class GeminiService implements AiSearchProvider {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper;
    private final DatasetService datasetService;
    private final GoogleMapsService googleMapsService;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=";

    /**
     * Extracts location, vibes, and budget from a raw user prompt.
     * Injects the most recent few-shot examples from the Drive dataset into the prompt
     * so that Gemini's extraction accuracy improves as real search data accumulates.
     */
    @Override
    @SuppressWarnings("unchecked")
    public SearchExtractionDTO extractSearchParameters(String prompt) {
        // Load recent examples from dataset — improves extraction over time for free
        List<String> fewShots = datasetService.loadFewShotExamples();

        StringBuilder fewShotBlock = new StringBuilder();
        if (!fewShots.isEmpty()) {
            fewShotBlock.append("Here are recent examples of correct extractions to guide you:\\n");
            for (String ex : fewShots) {
                fewShotBlock.append("- ").append(ex).append("\\n");
            }
            fewShotBlock.append("\\n");
        }

        String safePrompt = prompt.replace("\"", "\\\"");
        String safeFewShots = fewShotBlock.toString().replace("\"", "\\\"");

        String requestBody = """
        {
          "contents": [{"parts": [{"text": "%s%sExtract the location, vibes, and max budget from this user query: \\"%s\\""}]}],
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
        """.formatted(safeFewShots, "", safePrompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            Map<String, Object> response = restTemplate.postForObject(
                    GEMINI_URL + apiKey, new HttpEntity<>(requestBody, headers), Map.class);

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            String jsonText = (String) parts.get(0).get("text");

            SearchExtractionDTO result = objectMapper.readValue(jsonText, SearchExtractionDTO.class);
            System.out.println("🤖 Gemini extracted: " + result + " (few-shots used: " + fewShots.size() + ")");
            return result;

        } catch (Exception e) {
            System.err.println("Gemini extraction failed: " + e.getMessage());
            return new SearchExtractionDTO();
        }
    }

    /**
     * Delegates to GoogleMapsService for real, location-accurate property results.
     * Gemini is NOT used to hallucinate property data — only for NLP extraction.
     */
    @Override
    public List<PropertyResponseDTO> searchRealWorldProperties(String prompt) {
        // This method is now handled entirely by GoogleMapsService via PropertyService.
        // Gemini's job is extraction only.
        return List.of();
    }
}
