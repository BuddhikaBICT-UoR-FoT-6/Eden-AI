package com.eden.api.exception;

/**
 * Thrown when a requested property cannot be found in the database.
 * Extends RuntimeException so it integrates cleanly with Spring's
 * exception handling mechanism without requiring checked exception
 * declarations throughout the codebase.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s : '%s'", resourceName, fieldName, fieldValue));
    }
}
