package com.eden.api.service;

import com.eden.api.dto.SearchExtractionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@SuppressWarnings("null")
public class OllamaService implements AiSearchProvider {

    @Value("${ollama.api.url:http://localhost:11434}")
    @Getter @Setter
    private String ollamaUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    @SuppressWarnings("unchecked")
    @Override
    public SearchExtractionDTO extractSearchParameters(String prompt) {
        String url = ollamaUrl + "/api/generate";

        String safePrompt = prompt.replace("\"", "\\\"");

        // Construct the payload for Ollama
        String requestBody = """
        {
          "model": "eden-ai",
          "prompt": "Extract the location, vibes, and max budget from this user query and output strictly as a JSON object: \\"%s\\"",
          "stream": false,
          "format": "json"
        }
        """.formatted(safePrompt);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        try {
            System.out.println("🤖 Sending request to Local Ollama AI...");
            
            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);
            
            // Ollama returns the generated text inside the "response" field
            String jsonText = (String) response.get("response");
            
            return objectMapper.readValue(jsonText, SearchExtractionDTO.class);
            
        } catch (Exception e) {
            System.err.println("Ollama extraction failed: " + e.getMessage());
            return new SearchExtractionDTO();
        }
    }

    @Override
    public java.util.List<com.eden.api.dto.PropertyResponseDTO> searchRealWorldProperties(String prompt) {
        return java.util.List.of();
    }
}
