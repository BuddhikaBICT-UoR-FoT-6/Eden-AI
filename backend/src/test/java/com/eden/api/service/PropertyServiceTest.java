package com.eden.api.service;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.dto.SearchExtractionDTO;
import com.eden.api.entity.Property;
import com.eden.api.entity.PropertyVibe;
import com.eden.api.entity.PropertyVibeId;
import com.eden.api.entity.Vibe;
import com.eden.api.exception.ResourceNotFoundException;
import com.eden.api.repository.PropertyRepository;
import com.eden.api.repository.PropertyVibeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Unit Tests for PropertyService.
 * Uses Mockito to mock all dependencies — no real DB or API calls.
 *
 * Test Logging: Results logged to /test-logs/PropertyServiceTest.log
 * via Maven Surefire plugin configuration in pom.xml.
 */
@ExtendWith(MockitoExtension.class)
@SuppressWarnings("null")
class PropertyServiceTest {

    @Mock private PropertyRepository propertyRepository;
    @Mock private PropertyVibeRepository propertyVibeRepository;
    @Mock private GeminiService geminiService;
    @Mock private GoogleMapsService googleMapsService;
    @Mock private DatasetService datasetService;

    @InjectMocks
    private PropertyService propertyService;

    private Property testProperty;
    private Vibe testVibe;
    private UUID propertyId;

    @BeforeEach
    void setUp() {
        propertyId = UUID.randomUUID();

        testVibe = Vibe.builder()
                .id(UUID.randomUUID())
                .name("Jungle Luxury")
                .description("High-end villas surrounded by lush nature")
                .build();

        testProperty = Property.builder()
                .id(propertyId)
                .name("The Wild Coast Lodge")
                .description("A spectacular safari camp in Yala")
                .location("Yala")
                .pricePerNight(new BigDecimal("850.00"))
                .imageUrl("https://example.com/yala.jpg")
                .build();
    }

    @Test
    @DisplayName("getAllProperties() should return mapped DTOs for all properties")
    void getAllProperties_ShouldReturnMappedDTOs() {
        // Arrange
        PropertyVibe link = PropertyVibe.builder()
                .id(new PropertyVibeId(propertyId, testVibe.getId()))
                .property(testProperty)
                .vibe(testVibe)
                .confidenceScore(new BigDecimal("0.98"))
                .build();

        when(propertyRepository.findAll()).thenReturn(List.of(testProperty));
        when(propertyVibeRepository.findByPropertyId(propertyId)).thenReturn(List.of(link));

        // Act
        List<PropertyResponseDTO> result = propertyService.getAllProperties();

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("The Wild Coast Lodge");
        assertThat(result.get(0).getVibes()).containsExactly("Jungle Luxury");
        verify(propertyRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getPropertyById() should throw ResourceNotFoundException for unknown ID")
    void getPropertyById_WhenNotFound_ShouldThrowException() {
        // Arrange
        UUID unknownId = UUID.randomUUID();
        when(propertyRepository.findById(unknownId)).thenReturn(Optional.empty());

        // Act + Assert
        assertThatThrownBy(() -> propertyService.getPropertyById(unknownId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Property");
    }

    @Test
    @DisplayName("searchByNaturalLanguage() should filter by AI-extracted location")
    void searchByNaturalLanguage_ShouldFilterByLocation() {
        // Arrange
        SearchExtractionDTO extraction = SearchExtractionDTO.builder()
                .location("Yala")
                .vibes(List.of())
                .maxBudget(null)
                .build();

        Property nonMatchingProperty = Property.builder()
                .id(UUID.randomUUID())
                .name("Mirissa Beach Villa")
                .location("Mirissa")
                .pricePerNight(new BigDecimal("200.00"))
                .build();

        when(geminiService.extractSearchParameters(anyString())).thenReturn(extraction);
        when(propertyRepository.findAll()).thenReturn(List.of(testProperty, nonMatchingProperty));
        when(propertyVibeRepository.findByPropertyId(propertyId)).thenReturn(List.of());

        // Act
        List<PropertyResponseDTO> result = propertyService.searchByNaturalLanguage("jungle in Yala");

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getLocation()).isEqualTo("Yala");
    }

    @Test
    @DisplayName("searchByNaturalLanguage() should filter by AI-extracted budget")
    void searchByNaturalLanguage_ShouldFilterByBudget() {
        // Arrange
        SearchExtractionDTO extraction = SearchExtractionDTO.builder()
                .maxBudget(new BigDecimal("500.00"))
                .vibes(List.of())
                .build();

        Property cheapVilla = Property.builder()
                .id(UUID.randomUUID())
                .name("Budget Hut")
                .location("Mirissa")
                .pricePerNight(new BigDecimal("100.00"))
                .build();

        when(geminiService.extractSearchParameters(anyString())).thenReturn(extraction);
        when(propertyRepository.findAll()).thenReturn(List.of(testProperty, cheapVilla));
        when(propertyVibeRepository.findByPropertyId(cheapVilla.getId())).thenReturn(List.of());

        // Act — testProperty costs $850, which exceeds the $500 budget
        List<PropertyResponseDTO> result = propertyService.searchByNaturalLanguage("under 500");

        // Assert
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Budget Hut");
    }
}
