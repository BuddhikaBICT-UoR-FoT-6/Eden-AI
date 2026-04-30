package com.eden.api.repository;

import com.eden.api.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Repository for managing Property entities.
 * Provides standard CRUD operations and custom methods for property management.
 */

@Repository
public interface PropertyRepository extends JpaRepository<Property, UUID> {
    /**
     * Finds all properties that match the given location.
     * 
     * @param location The location to search for.
     * @return A list of properties that match the given location.
     */
    List<Property> findByLocationIgnoreCase(String location);
}
