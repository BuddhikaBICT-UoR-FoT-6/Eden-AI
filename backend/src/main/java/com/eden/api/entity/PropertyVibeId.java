package com.eden.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.UUID;

/**
 * The composite primary key for the PropertyVibe entity.
 * It consists of the propertyId and vibeId.
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyVibeId implements Serializable {

    @Column(name = "property_id")
    private UUID propertyId; // The ID of the property.

    @Column(name = "vibe_id")
    private UUID vibeId; // The ID of the vibe.
}
