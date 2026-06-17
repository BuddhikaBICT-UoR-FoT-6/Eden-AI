package com.eden.api.service;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.dto.SearchExtractionDTO;
import com.eden.api.entity.Property;
import com.eden.api.entity.SearchHistory;
import com.eden.api.exception.ResourceNotFoundException;
import com.eden.api.repository.PropertyRepository;
import com.eden.api.repository.PropertyVibeRepository;
import com.eden.api.repository.SearchHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
@SuppressWarnings("null")
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final PropertyVibeRepository propertyVibeRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final AiSearchProvider aiSearchProvider;

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
        SearchExtractionDTO extraction = aiSearchProvider.extractSearchParameters(prompt);
        System.out.println("🤖 AI Extracted: " + extraction);

        // Smart fallback if AI extraction failed or returned nothing
        if ((extraction.getLocation() == null || extraction.getLocation().isBlank())
                && (extraction.getVibes() == null || extraction.getVibes().isEmpty())
                && extraction.getMaxBudget() == null) {
            System.out.println("⚠️ AI extraction empty/failed. Running keyword-based fallback extraction.");
            extraction = extractParametersByKeywords(prompt);
            System.out.println("🔑 Keyword Fallback Extracted: " + extraction);
        }

        final SearchExtractionDTO finalExtraction = extraction;

        List<PropertyResponseDTO> dbResults = propertyRepository.findAll().stream()
                .filter(p -> isMatchingLocation(p, finalExtraction))
                .filter(p -> isWithinBudget(p, finalExtraction))
                .filter(p -> hasMatchingVibe(p, finalExtraction))
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());

        // Sort results by vibe priority match (higher priority vibes first)
        if (finalExtraction.getVibes() != null && !finalExtraction.getVibes().isEmpty()) {
            dbResults.sort((p1, p2) -> {
                double score1 = calculatePriorityScore(p1, finalExtraction.getVibes());
                double score2 = calculatePriorityScore(p2, finalExtraction.getVibes());
                return Double.compare(score2, score1);
            });
        }

        // Fetch real-world results using the AI provider instead of Google Maps API directly
        // This avoids the strict Maps API billing requirements while still providing accurate real-world locations
        List<PropertyResponseDTO> realWorldResults = aiSearchProvider.searchRealWorldProperties(prompt);

        List<PropertyResponseDTO> combined = new java.util.ArrayList<>(dbResults);
        if (realWorldResults != null) {
            List<String> dbNames = dbResults.stream()
                    .map(PropertyResponseDTO::getName)
                    .map(String::toLowerCase)
                    .collect(Collectors.toList());
                    
            for (PropertyResponseDTO p : realWorldResults) {
                if (!dbNames.contains(p.getName().toLowerCase())) {
                    combined.add(p);
                }
            }
        }
        return combined;
    }

    /**
     * Recommends properties based on user search history and vibes,
     * or returns default highlights if no history exists.
     */
    @Transactional(readOnly = true)
    public List<PropertyResponseDTO> getSuggestions(Long userId) {
        if (userId == null) {
            return propertyRepository.findAll().stream().limit(3)
                    .map(this::mapToResponseDTO).collect(Collectors.toList());
        }

        List<SearchHistory> history = searchHistoryRepository.findByUserIdOrderByTimestampDesc(userId);
        if (history.isEmpty()) {
            return propertyRepository.findAll().stream().limit(3)
                    .map(this::mapToResponseDTO).collect(Collectors.toList());
        }

        // Combine top 3 queries for broader semantic context
        String combinedQuery = history.stream().limit(3)
                .map(SearchHistory::getQuery)
                .collect(Collectors.joining(" "));

        SearchExtractionDTO extraction = aiSearchProvider.extractSearchParameters(combinedQuery);

        List<PropertyResponseDTO> suggested = propertyRepository.findAll().stream()
                .filter(p -> isMatchingLocation(p, extraction) || hasMatchingVibe(p, extraction))
                .limit(4)
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());

        if (suggested.isEmpty()) {
            return propertyRepository.findAll().stream().limit(3)
                    .map(this::mapToResponseDTO).collect(Collectors.toList());
        }

        return suggested;
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
                .contactDetails(property.getContactDetails())
                .vibes(vibeNames)
                .build();
    }

    /**
     * Smart local keyword-based extraction when the AI service is rate-limited or unavailable.
     */
    private SearchExtractionDTO extractParametersByKeywords(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return new SearchExtractionDTO();
        }

        String lower = prompt.toLowerCase();

        // 1. Extract Location
        String location = null;
        if (lower.contains("yala")) location = "Yala";
        else if (lower.contains("mirissa")) location = "Mirissa";
        else if (lower.contains("galle")) location = "Galle";
        else if (lower.contains("hatton")) location = "Hatton";
        else if (lower.contains("ella")) location = "Ella";
        else if (lower.contains("bentota")) location = "Bentota";
        else if (lower.contains("kandy")) location = "Kandy";
        else if (lower.contains("arugam")) location = "Arugam Bay";
        else if (lower.contains("hikkaduwa")) location = "Hikkaduwa";
        else if (lower.contains("colombo")) location = "Colombo";
        else if (lower.contains("sigiriya")) location = "Sigiriya";
        else if (lower.contains("nuwara")) location = "Nuwara Eliya";

        // 2. Extract Vibes
        List<String> vibes = new java.util.ArrayList<>();
        if (lower.contains("jungle") || lower.contains("nature") || lower.contains("forest") || lower.contains("canopy")) {
            vibes.add("Jungle Luxury");
        }
        if (lower.contains("surf") || lower.contains("wave") || lower.contains("breaks")) {
            vibes.add("Surf Chill");
        }
        if (lower.contains("colonial") || lower.contains("historic") || lower.contains("heritage") || lower.contains("dutch") || lower.contains("fort")) {
            vibes.add("Colonial Charm");
        }
        if (lower.contains("beach") || lower.contains("ocean") || lower.contains("sea") || lower.contains("coast") || lower.contains("zen")) {
            vibes.add("Beachfront Zen");
        }
        if (lower.contains("safari") || lower.contains("wild") || lower.contains("animal") || lower.contains("leopard") || lower.contains("national park")) {
            vibes.add("Safari Wild");
        }
        if (lower.contains("highland") || lower.contains("mountain") || lower.contains("hill") || lower.contains("tea") || lower.contains("mist")) {
            vibes.add("Highland Escape");
        }
        if (lower.contains("party") || lower.contains("nightlife") || lower.contains("bar") || lower.contains("club") || lower.contains("dj") || lower.contains("social")) {
            vibes.add("Party Vibe");
        }
        if (lower.contains("wellness") || lower.contains("spa") || lower.contains("yoga") || lower.contains("meditate") || lower.contains("retreat") || lower.contains("sanctuary") || lower.contains("detox")) {
            vibes.add("Wellness Retreat");
        }

        // 3. Extract Budget limit (e.g. "under 500" or "$300")
        BigDecimal maxBudget = null;
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(?:under|below|less than|budget of|max|limit)\\s*\\$?(\\d+)");
        java.util.regex.Matcher matcher = pattern.matcher(lower);
        if (matcher.find()) {
            try {
                maxBudget = new BigDecimal(matcher.group(1));
            } catch (Exception e) {
                // ignore
            }
        } else {
            // Check for simple numbers like "$500" or "500" in the text
            java.util.regex.Pattern simpleNumberPattern = java.util.regex.Pattern.compile("\\$?(\\d+)");
            java.util.regex.Matcher simpleMatcher = simpleNumberPattern.matcher(lower);
            while (simpleMatcher.find()) {
                try {
                    int val = Integer.parseInt(simpleMatcher.group(1));
                    if (val >= 10 && val <= 10000) { // filter out years/dates/etc.
                        maxBudget = BigDecimal.valueOf(val);
                        break;
                    }
                } catch (Exception e) {
                    // ignore
                }
            }
        }

        // Sort vibes by their index of occurrence in the prompt to preserve priority
        if (vibes.size() > 1) {
            vibes.sort(java.util.Comparator.comparingInt(v -> {
                String cleanV = v.toLowerCase();
                int idx = lower.indexOf(cleanV);
                if (idx != -1) return idx;
                
                // Check keywords/aliases
                if (cleanV.contains("jungle")) {
                    int i1 = lower.indexOf("jungle");
                    int i2 = lower.indexOf("forest");
                    if (i1 != -1 && i2 != -1) return Math.min(i1, i2);
                    return i1 != -1 ? i1 : (i2 != -1 ? i2 : Integer.MAX_VALUE);
                }
                if (cleanV.contains("surf")) return lower.indexOf("surf");
                if (cleanV.contains("colonial")) return lower.indexOf("colonial");
                if (cleanV.contains("beach")) return lower.indexOf("beach");
                if (cleanV.contains("safari")) return lower.indexOf("safari");
                if (cleanV.contains("highland")) return lower.indexOf("highland");
                if (cleanV.contains("party")) return lower.indexOf("party");
                if (cleanV.contains("wellness")) return lower.indexOf("wellness");
                return Integer.MAX_VALUE;
            }));
        }

        return SearchExtractionDTO.builder()
                .location(location)
                .vibes(vibes)
                .maxBudget(maxBudget)
                .build();
    }

    /**
     * Calculates a priority-based match score for a property.
     * Matches for higher-priority vibes yield exponentially higher scores.
     */
    private double calculatePriorityScore(PropertyResponseDTO p, List<String> prioritizedVibes) {
        if (prioritizedVibes == null || prioritizedVibes.isEmpty()) return 0.0;
        
        double score = 0.0;
        int N = prioritizedVibes.size();
        for (int i = 0; i < N; i++) {
            String v = prioritizedVibes.get(i).toLowerCase();
            for (String pv : p.getVibes()) {
                if (pv.toLowerCase().equals(v)) {
                    score += Math.pow(10, N - 1 - i);
                    break;
                }
            }
        }
        return score;
    }
}