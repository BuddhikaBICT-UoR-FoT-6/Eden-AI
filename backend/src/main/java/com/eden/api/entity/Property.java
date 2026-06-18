package com.eden.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a "Property" (e.g., a house, cabin, or apartment) in the
 * Eden AI platform.
 * Properties are the core inventory items that travelers search for. The
 * system uses
 * these entities to provide rich, descriptive listings that go beyond simple
 * hotel data,
 * aligning with the "back-to-nature" and unique experience focus of the
 * platform.
 */

@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id; // Auto-generated unique identifier for the property.

    @Column(nullable = false, length = 100)
    private String name; // The name of the property (e.g., "Whispering Pines Cabin").

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description; // The description of the property.

    @Column(nullable = false, length = 100)
    private String location; // The location of the property.

    @Column(name = "price_per_night", nullable = false)
    private BigDecimal pricePerNight; // The price per night of the property.

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl; // The image URL of the property.

    @Column(name = "contact_details", length = 255)
    private String contactDetails; // The contact details (phone/email).

    @Column(name = "rating")
    private Double rating; // Google Maps rating, e.g., 4.7

    @Column(name = "reviews_count")
    private Integer reviewsCount; // Google Maps reviews count, e.g., 148

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // Timestamp of when the property was created.

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt; // Timestamp of when the property was updated.

    /**
     * Callback method invoked before the entity is persisted to the database.
     * Ensures the createdAt and updatedAt timestamps are set to the current time
     * upon creation.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    /**
     * Callback method invoked before the entity is updated in the database.
     * Ensures the updatedAt timestamp is set to the current time upon update.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
