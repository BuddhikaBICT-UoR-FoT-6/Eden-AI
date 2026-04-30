package com.eden.api.repository;

import com.eden.api.entity.Vibe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository for managing Vibe entities.
 * Provides standard CRUD operations and a custom method to find vibes by name,
 * ignoring case.
 */
@Repository
public interface VibeRepository extends JpaRepository<Vibe, UUID> {
    /**
     * Finds a vibe by its name, ignoring case.
     * 
     * @param name The name of the vibe to search for.
     * @return An Optional containing the vibe if found, otherwise an empty
     *         Optional.
     */
    Optional<Vibe> findByNameIgnoreCase(String name);
}
