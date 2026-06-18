package com.eden.api.service;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.dto.SearchExtractionDTO;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

/**
2. * Dynamically routes AI extraction requests between Gemini and Ollama.
3. * Marked as @Primary so it takes precedence over concrete providers.
4. */
@Service
@Primary
public class RoutingAiSearchProvider implements AiSearchProvider {

    private final GeminiService geminiService;
    private final OllamaService ollamaService;

    @Getter @Setter
    private String activeProvider;

    public RoutingAiSearchProvider(
            GeminiService geminiService,
            OllamaService ollamaService,
            @Value("${ai.provider:gemini}") String activeProvider) {
        this.geminiService = geminiService;
        this.ollamaService = ollamaService;
        this.activeProvider = activeProvider;
    }

    @Override
    public SearchExtractionDTO extractSearchParameters(String prompt) {
        if ("ollama".equalsIgnoreCase(activeProvider)) {
            System.out.println("🔀 Routing search extraction to Ollama...");
            return ollamaService.extractSearchParameters(prompt);
        } else {
            System.out.println("🔀 Routing search extraction to Gemini...");
            return geminiService.extractSearchParameters(prompt);
        }
    }

    @Override
    public List<PropertyResponseDTO> searchRealWorldProperties(String prompt) {
        if ("ollama".equalsIgnoreCase(activeProvider)) {
            return ollamaService.searchRealWorldProperties(prompt);
        } else {
            return geminiService.searchRealWorldProperties(prompt);
        }
    }
}
