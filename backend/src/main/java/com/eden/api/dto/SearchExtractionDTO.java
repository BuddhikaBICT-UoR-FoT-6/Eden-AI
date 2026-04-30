package com.eden.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchExtractionDTO {
    
    // The specific geographical location, if mentioned (e.g., "Yala", "Mirissa")
    private String location;
    
    // A list of vibes extracted from the text (e.g., ["Jungle Luxury", "Quiet"])
    private List<String> vibes;
    
    // The maximum nightly budget mentioned by the user
    private BigDecimal maxBudget;
}