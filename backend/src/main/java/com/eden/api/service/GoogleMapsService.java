package com.eden.api.service;

import com.eden.api.dto.PropertyResponseDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleMapsService {

    @Value("${google.maps.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    public List<PropertyResponseDTO> searchRealWorldProperties(String location, List<String> vibes) {
        List<PropertyResponseDTO> results = new ArrayList<>();
        
        // Build the query strictly around location to prevent Google Maps from returning properties outside the requested area
        String query = "hotels in " + (location != null && !location.isBlank() ? location : "Sri Lanka");
        // We do NOT append vibes to the query here, as it confuses Google Maps into returning results 
        // from other cities that better match the vibe keyword.


        String url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + 
                     query.replace(" ", "+") + "&key=" + apiKey;

        try {
            System.out.println("🗺️ Querying Google Maps API: " + query);
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            String status = root.path("status").asText();
            if (!"OK".equals(status)) {
                String errorMessage = root.path("error_message").asText();
                System.err.println("❌ Google Maps API Error: " + status + " - " + errorMessage);
                // Return gracefully so DB results still work
                return results;
            }

            JsonNode resultsNode = root.path("results");

            for (int i = 0; i < Math.min(5, resultsNode.size()); i++) {
                JsonNode place = resultsNode.get(i);
                
                String name = place.path("name").asText();
                String address = place.path("formatted_address").asText();
                double rating = place.path("rating").asDouble(0.0);
                int reviewsCount = place.path("user_ratings_total").asInt(0);
                
                // Get a photo if available
                String imageUrl = "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800"; // fallback
                JsonNode photos = place.path("photos");
                if (photos.isArray() && photos.size() > 0) {
                    String photoReference = photos.get(0).path("photo_reference").asText();
                    imageUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=" + photoReference + "&key=" + apiKey;
                }

                results.add(PropertyResponseDTO.builder()
                        .id(UUID.randomUUID())
                        .name(name)
                        .description("A highly rated property found via Google Maps.")
                        .location(address)
                        .pricePerNight(BigDecimal.valueOf(150.0)) // Placeholder as Maps API doesn't always give hotel prices
                        .imageUrl(imageUrl)
                        .contactDetails("N/A")
                        .rating(rating > 0 ? rating : null)
                        .reviewsCount(reviewsCount > 0 ? reviewsCount : null)
                        .vibes(vibes != null ? vibes : List.of("Relaxing"))
                        .build());
            }
        } catch (Exception e) {
            System.err.println("Google Maps API search failed: " + e.getMessage());
        }

        return results;
    }

    public List<PropertyResponseDTO> searchNearbyTopRated(Double lat, Double lng) {
        List<PropertyResponseDTO> results = new ArrayList<>();
        
        String query = "top rated hotels and villas";
        String url = "https://maps.googleapis.com/maps/api/place/textsearch/json?query=" + 
                     query.replace(" ", "+");
        
        if (lat != null && lng != null) {
            url += "&location=" + lat + "," + lng + "&radius=10000"; // 10km radius
        }
        url += "&key=" + apiKey;

        try {
            System.out.println("🗺️ Querying Google Maps API for Nearby Featured: " + url);
            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            String status = root.path("status").asText();
            if (!"OK".equals(status)) {
                return results;
            }

            JsonNode resultsNode = root.path("results");
            // Only take top 3 for featured stays
            for (int i = 0; i < Math.min(3, resultsNode.size()); i++) {
                JsonNode place = resultsNode.get(i);
                
                String name = place.path("name").asText();
                String address = place.path("formatted_address").asText();
                double rating = place.path("rating").asDouble(0.0);
                int reviewsCount = place.path("user_ratings_total").asInt(0);
                
                String imageUrl = "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800";
                JsonNode photos = place.path("photos");
                if (photos.isArray() && photos.size() > 0) {
                    String photoReference = photos.get(0).path("photo_reference").asText();
                    imageUrl = "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=" + photoReference + "&key=" + apiKey;
                }

                results.add(PropertyResponseDTO.builder()
                        .id(UUID.randomUUID())
                        .name(name)
                        .description("Top-rated featured stay near your location.")
                        .location(address)
                        .pricePerNight(BigDecimal.valueOf(200.0))
                        .imageUrl(imageUrl)
                        .rating(rating > 0 ? rating : null)
                        .reviewsCount(reviewsCount > 0 ? reviewsCount : null)
                        .vibes(List.of("Featured", "Top Rated"))
                        .build());
            }
        } catch (Exception e) {
            System.err.println("Google Maps Nearby search failed: " + e.getMessage());
        }

        return results;
    }
}
