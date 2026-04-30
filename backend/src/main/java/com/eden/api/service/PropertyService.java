package com.eden.api.service;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.dto.SearchExtractionDTO;
import com.eden.api.entity.Property;
import com.eden.api.exception.ResourceNotFoundException;
import com.eden.api.repository.PropertyRepository;
import com.eden.api.repository.PropertyVibeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service layer for all Property-related business logic.
 *
 * SOLID Principles Applied:
 * - SRP: Each method has one clear responsibility (get all, search by location, AI search, map to DTO).
 * - OCP: New search strategies can be added as new methods; existing ones are never modified.
 * - DIP: Depends on Repository interfaces, not concrete implementations.
 *
 * UX Principles:
 * - ISO 9241-11 Effectiveness: Returns meaningful results even on partial query matches.
 * - Shneiderman Feedback: Console output during AI extraction allows developer debugging.
 */
@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyVibeRepository propertyVibeRepository;
    private final GeminiService geminiService;

    /**
     * Retrieves all properties from the database.
     */
    @Transactional(readOnly = true)
    public List<PropertyResponseDTO> getAllProperties() {
        return propertyRepository.findAll().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Finds properties by geographical location (case-insensitive).
     */
    @Transactional(readOnly = true)
    public List<PropertyResponseDTO> getPropertiesByLocation(String location) {
        return propertyRepository.findByLocationIgnoreCase(location).stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves a single property by its unique ID.
     * Throws ResourceNotFoundException (mapped to HTTP 404) if not found.
     */
    @Transactional(readOnly = true)
    public PropertyResponseDTO getPropertyById(UUID id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Property", "id", id));
        return mapToResponseDTO(property);
    }

    /**
     * Orchestrates natural language search using the Gemini AI service.
     * Applies sequential stream filters based on extracted parameters.
     * Each filter is a guard clause — if the parameter is absent, the filter passes all properties.
     *
     * @param prompt Raw user input (e.g., "I want a peaceful jungle villa under $500 in Ella")
     * @return A semantically filtered list of matching properties.
     */
    @Transactional(readOnly = true)
    public List<PropertyResponseDTO> searchByNaturalLanguage(String prompt) {
        SearchExtractionDTO extraction = geminiService.extractSearchParameters(prompt);
        System.out.println("🤖 Gemini Extracted: " + extraction);

        return propertyRepository.findAll().stream()
                .filter(p -> isMatchingLocation(p, extraction))
                .filter(p -> isWithinBudget(p, extraction))
                .filter(p -> hasMatchingVibe(p, extraction))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // ─── Private Filter Predicates ─────────────────────────────────────────────

    private boolean isMatchingLocation(Property p, SearchExtractionDTO extraction) {
        if (extraction.getLocation() == null || extraction.getLocation().isBlank()) return true;
        return p.getLocation().equalsIgnoreCase(extraction.getLocation());
    }

    private boolean isWithinBudget(Property p, SearchExtractionDTO extraction) {
        if (extraction.getMaxBudget() == null) return true;
        return p.getPricePerNight().compareTo(extraction.getMaxBudget()) <= 0;
    }

    private boolean hasMatchingVibe(Property p, SearchExtractionDTO extraction) {
        if (extraction.getVibes() == null || extraction.getVibes().isEmpty()) return true;

        List<String> propertyVibeNames = propertyVibeRepository.findByPropertyId(p.getId())
                .stream()
                .map(pv -> pv.getVibe().getName().toLowerCase())
                .collect(Collectors.toList());

        return extraction.getVibes().stream()
                .map(String::toLowerCase)
                .anyMatch(propertyVibeNames::contains);
    }

    // ─── Mapping Helper ────────────────────────────────────────────────────────

    /**
     * Converts a Property entity into a PropertyResponseDTO.
     * Flattens the Many-to-Many vibe relationship into a simple List<String>.
     */
    private PropertyResponseDTO mapToResponseDTO(Property property) {
        List<String> vibeNames = propertyVibeRepository.findByPropertyId(property.getId())
                .stream()
                .map(pv -> pv.getVibe().getName())
                .collect(Collectors.toList());

        return PropertyResponseDTO.builder()
                .id(property.getId())
                .name(property.getName())
                .description(property.getDescription())
                .location(property.getLocation())
                .pricePerNight(property.getPricePerNight())
                .imageUrl(property.getImageUrl())
                .vibes(vibeNames)
                .build();
    }
}