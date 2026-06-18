package com.eden.api.service;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.dto.SearchExtractionDTO;
import java.util.List;

/**
 * Abstraction for Natural Language search extraction.
 * Allows seamless switching between different AI models (Gemini, Ollama, OpenAI, etc.)
 */
public interface AiSearchProvider {
    
    /**
     * Extracts location, vibes, and budget from a raw user prompt.
     * @param prompt The natural language user input.
     * @return Extracted structured data.
     */
    SearchExtractionDTO extractSearchParameters(String prompt);

    /**
     * Direct natural language query to return real-world property results from the LLM.
     * @param prompt The user prompt.
     * @return List of matching properties.
     */
    List<PropertyResponseDTO> searchRealWorldProperties(String prompt);
}
