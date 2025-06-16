package com.eden.api.controller;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for standard property queries.
 * 
 * SRP (Single Responsibility): This controller handles ONLY
 * non-AI data retrieval. AI-powered search lives in AiVibeSearchController.
 */
@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "${FRONTEND_URL:https://eden-ai-frontend.azurewebsites.net}"})
public class PropertyController {

    private final PropertyService propertyService;

    /**
     * GET /api/properties
     * Returns all properties in the database.
     */
    @GetMapping
    public ResponseEntity<List<PropertyResponseDTO>> getAllProperties() {
        return ResponseEntity.ok(propertyService.getAllProperties());
    }

    /**
     * GET /api/properties/search?location=Mirissa
     * Returns properties filtered by location.
     */
    @GetMapping("/search")
    public ResponseEntity<List<PropertyResponseDTO>> searchByLocation(
            @RequestParam String location) {
        return ResponseEntity.ok(propertyService.getPropertiesByLocation(location));
    }

    /**
     * GET /api/properties/suggestions?userId=1
     * Returns suggested properties based on user history, or default recommendations.
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<PropertyResponseDTO>> getSuggestions(
            @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(propertyService.getSuggestions(userId));
    }

    /**
     * GET /api/properties/featured?lat=123&lng=456
     * Returns featured properties, ideally using nearby locations.
     */
    @GetMapping("/featured")
    public ResponseEntity<List<PropertyResponseDTO>> getFeatured(
            @RequestParam(required = false) Double lat,
            @RequestParam(required = false) Double lng) {
        return ResponseEntity.ok(propertyService.getFeaturedNearbyProperties(lat, lng));
    }
}