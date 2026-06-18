package com.eden.api.controller;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller dedicated exclusively to AI-powered vibe-based search.
 * 
 * SRP: Handles ONLY Gemini AI search requests. Standard queries
 * belong to PropertyController. This separation ensures the AI endpoint
 * can evolve independently (e.g., rate limiting, caching).
 * 
 * OCP (Open/Closed): New AI search strategies can be introduced by
 * extending the service layer, without modifying this controller.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiVibeSearchController {

    private final PropertyService propertyService;

    /**
     * GET /api/ai/search?prompt=I want a peaceful jungle villa under $500
     * 
     * Accepts a free-text natural language prompt from the user and
     * returns a semantically filtered list of properties.
     *
     * @param prompt Raw user input describing their desired vibe.
     * @return Filtered list of properties matching the AI-extracted parameters.
     */
    @GetMapping("/search")
    public ResponseEntity<List<PropertyResponseDTO>> searchByVibe(
            @RequestParam String prompt) {
        return ResponseEntity.ok(propertyService.searchByNaturalLanguage(prompt));
    }
}
