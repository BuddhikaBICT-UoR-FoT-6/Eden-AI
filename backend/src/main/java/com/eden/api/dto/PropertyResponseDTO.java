package com.eden.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO for representing a property in the response.
 * Includes basic property details and a list of vibe IDs associated with the
 * property.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class PropertyResponseDTO {
    private UUID id;
    private String name;
    private String description;
    private String location;
    private BigDecimal pricePerNight;
    private String imageUrl;
    private String contactDetails;
    private Double rating;
    private Integer reviewsCount;
    private List<String> vibes; // Flattened list of vibe names for the UI
}
