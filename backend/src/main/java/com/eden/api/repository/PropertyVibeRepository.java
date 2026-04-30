package com.eden.api.repository;

import com.eden.api.entity.PropertyVibe;
import com.eden.api.entity.PropertyVibeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for managing PropertyVibe entities.
 * Provides standard CRUD operations and a custom method to find vibes by name,
 * ignoring case.
 */
@Repository
public interface PropertyVibeRepository extends JpaRepository<PropertyVibe, PropertyVibeId> {

    /**
     * Finds all property vibes for a given property id.
     * 
     * @param propertyId The ID of the property.
     * @return A list of property vibes for the given property id.
     */
    List<PropertyVibe> findByPropertyId(UUID propertyId);

    /**
     * Finds all property vibes for a given vibe id.
     * 
     * @param vibeId The ID of the vibe.
     * @return A list of property vibes for the given vibe id.
     */
    List<PropertyVibe> findByVibeId(UUID vibeId);

}
