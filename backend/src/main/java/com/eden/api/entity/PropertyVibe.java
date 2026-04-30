package com.eden.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * Represents the many-to-many relationship between a Property and a Vibe,
 * storing the confidence score calculated by the AI.
 */
@Entity
@Table(name = "property_vibes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyVibe {

    @EmbeddedId
    private PropertyVibeId id; // The composite primary key.

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("propertyId")
    @JoinColumn(name = "property_id")
    private Property property; // The property associated with this vibe.

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("vibeId")
    @JoinColumn(name = "vibe_id")
    private Vibe vibe; // The vibe associated with this property.

    @Column(name = "confidence_score", nullable = false, precision = 3, scale = 2) // 3 = total number of digits, 2 =
                                                                                   // number of digits after the decimal
                                                                                   // point
    private BigDecimal confidenceScore; // The confidence score of the vibe.
}
