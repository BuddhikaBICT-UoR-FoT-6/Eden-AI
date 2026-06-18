package com.eden.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "search_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String prompt;

    @Column(length = 200)
    private String extractedLocation;

    @Column(columnDefinition = "TEXT")
    private String extractedVibes; // JSON array string e.g. ["Jungle Luxury","Surf Chill"]

    @Column
    private BigDecimal extractedBudget;

    @Column(nullable = false)
    private int resultsCount;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
