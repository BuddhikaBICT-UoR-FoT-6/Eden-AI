package com.eden.api.config;

import com.eden.api.entity.*;
import com.eden.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import java.math.BigDecimal;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final PropertyRepository propertyRepository;
    private final VibeRepository vibeRepository;
    private final PropertyVibeRepository propertyVibeRepository;

    @Override
    public void run(String... args) throws Exception {
        if (propertyRepository.count() > 0) return; // Don't seed if data exists

        // 1. Create Vibes
        Vibe jungle = Vibe.builder().name("Jungle Luxury").description("High-end villas surrounded by lush nature").build();
        Vibe surf = Vibe.builder().name("Surf Chill").description("Relaxed atmosphere near world-class breaks").build();
        Vibe colonial = Vibe.builder().name("Colonial Charm").description("Historic architecture with modern comfort").build();
        vibeRepository.saveAll(List.of(jungle, surf, colonial));

        // 2. Create Properties
        Property villa1 = Property.builder()
                .name("The Wild Coast Lodge")
                .description("A spectacular safari camp in Yala National Park")
                .location("Yala")
                .pricePerNight(new BigDecimal("850.00"))
                .imageUrl("https://example.com/yala.jpg")
                .build();

        Property villa2 = Property.builder()
                .name("Mirissa Surf House")
                .description("Steps away from the best waves in the south")
                .location("Mirissa")
                .pricePerNight(new BigDecimal("120.00"))
                .imageUrl("https://example.com/mirissa.jpg")
                .build();

        propertyRepository.saveAll(List.of(villa1, villa2));

        // 3. Link them (Junction Table)
        PropertyVibe link1 = PropertyVibe.builder()
                .id(new PropertyVibeId(villa1.getId(), jungle.getId()))
                .property(villa1).vibe(jungle).confidenceScore(new BigDecimal("0.98")).build();

        PropertyVibe link2 = PropertyVibe.builder()
                .id(new PropertyVibeId(villa2.getId(), surf.getId()))
                .property(villa2).vibe(surf).confidenceScore(new BigDecimal("0.95")).build();

        propertyVibeRepository.saveAll(List.of(link1, link2));

        System.out.println("✅ Database seeded with Sri Lankan properties and vibes!");
    }
}
