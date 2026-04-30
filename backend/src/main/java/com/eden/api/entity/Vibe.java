package com.eden.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity representing a distinct "Vibe" or experience category in the Eden AI
 * platform. Instead of relying purely on traditional checkbox amenities, the
 * application uses these normalized semantic tags (e.g., "digital_detox",
 * "secluded_jungle",
 * "romantic_hideaway") to bridge the gap between a user's natural language
 * query and the database.
 * This allows the Gemini AI to accurately match travelers with properties based
 * on overall atmosphere.
 */
@Entity
@Table(name = "vibes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vibe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id; // Auto-generated unique identifier for the vibe.

    @Column(nullable = false, unique = true, length = 50)
    private String name; // The unique, normalized name of the vibe (e.g., "digital_detox").

    @Column(columnDefinition = "TEXT")
    private String description; // A human-readable description of the vibe experience.

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt; // Timestamp of when the vibe was created.

    /**
     * Callback method invoked before the entity is persisted to the database.
     * Ensures the createdAt timestamp is set to the current time upon creation.
     */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
