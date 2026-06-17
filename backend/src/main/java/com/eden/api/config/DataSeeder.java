package com.eden.api.config;

import com.eden.api.entity.*;
import com.eden.api.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;

@Configuration
@Component
@RequiredArgsConstructor
@SuppressWarnings("null")
public class DataSeeder implements CommandLineRunner {

    private final PropertyRepository propertyRepository;
    private final VibeRepository vibeRepository;
    private final PropertyVibeRepository propertyVibeRepository;

    @Override
    public void run(String... args) throws Exception {
        // Clear outdated mock seed data if it's the old 2-property seed
        if (propertyRepository.count() > 0 && propertyRepository.count() <= 2) {
            System.out.println("⚠️ Outdated seed data detected. Purging old properties/vibes to re-seed...");
            propertyVibeRepository.deleteAll();
            propertyRepository.deleteAll();
            vibeRepository.deleteAll();
        }

        if (propertyRepository.count() > 0) return; // Don't seed if data exists

        // 1. Create Vibes
        Vibe jungle = Vibe.builder().name("Jungle Luxury").description("High-end villas surrounded by lush nature").build();
        Vibe surf = Vibe.builder().name("Surf Chill").description("Relaxed atmosphere near world-class breaks").build();
        Vibe colonial = Vibe.builder().name("Colonial Charm").description("Historic architecture with modern comfort").build();
        Vibe beachfront = Vibe.builder().name("Beachfront Zen").description("Tranquil stays directly on the sandy shores").build();
        Vibe safari = Vibe.builder().name("Safari Wild").description("Thrilling wildlife stays near national parks").build();
        Vibe highland = Vibe.builder().name("Highland Escape").description("Cool mountain retreats amid tea plantations").build();
        Vibe party = Vibe.builder().name("Party Vibe").description("Lively spots with active nightlife and social scenes").build();
        Vibe wellness = Vibe.builder().name("Wellness Retreat").description("Holistic rejuvenation, spa, and yoga sanctuaries").build();
        vibeRepository.saveAll(List.of(jungle, surf, colonial, beachfront, safari, highland, party, wellness));

        // 2. Create Properties
        Property villa1 = Property.builder()
                .name("The Wild Coast Lodge")
                .description("A spectacular luxury tented camp where the jungle meets the Indian Ocean. Nestled at the edge of Yala National Park.")
                .location("Yala")
                .pricePerNight(new BigDecimal("850.00"))
                .imageUrl("https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=80")
                .contactDetails("+94 47 222 3456 | reservations@wildcoastlodge.lk")
                .build();

        Property villa2 = Property.builder()
                .name("Mirissa Surf House")
                .description("Steps away from the best waves in the south coast. Enjoy rooftop yoga and sunset surf sessions.")
                .location("Mirissa")
                .pricePerNight(new BigDecimal("120.00"))
                .imageUrl("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80")
                .contactDetails("+94 41 123 4567 | surf@mirissa.lk")
                .build();

        Property villa3 = Property.builder()
                .name("Galle Fort Heritage Villa")
                .description("A carefully restored 18th-century Dutch colonial villa situated within the historic Galle Fort ramparts.")
                .location("Galle")
                .pricePerNight(new BigDecimal("350.00"))
                .imageUrl("https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80")
                .contactDetails("+94 91 224 4321 | stay@gallefortvilla.lk")
                .build();

        Property villa4 = Property.builder()
                .name("Ceylon Tea Trails")
                .description("Historic tea planter bungalows in the lush central highlands. Panoramic views of Castlereagh lake and tea gardens.")
                .location("Hatton")
                .pricePerNight(new BigDecimal("680.00"))
                .imageUrl("https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=800&q=80")
                .contactDetails("+94 11 230 3888 | info@teatrails.lk")
                .build();

        Property villa5 = Property.builder()
                .name("Arugam Bay Beach Cabanas")
                .description("Rustic beachfront cabanas hosting weekly bonfire gatherings and reggae nights for global surf enthusiasts.")
                .location("Arugam Bay")
                .pricePerNight(new BigDecimal("85.00"))
                .imageUrl("https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&q=80")
                .contactDetails("+94 63 224 8100 | waves@arugambaycabanas.lk")
                .build();

        Property villa6 = Property.builder()
                .name("Ella Canopy Cabins")
                .description("Treehouse-style luxury cabins perched in the canopy of the Ella mountain rainforest. Wake up to mist and mountain monkeys.")
                .location("Ella")
                .pricePerNight(new BigDecimal("220.00"))
                .imageUrl("https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80")
                .contactDetails("+94 57 222 8900 | info@ellacanopy.lk")
                .build();

        Property villa7 = Property.builder()
                .name("Santani Wellness Sanctuary")
                .description("World-renowned minimalist luxury wellness retreat offering detox, yoga, and meditation in the pristine Kandy hills.")
                .location("Kandy")
                .pricePerNight(new BigDecimal("520.00"))
                .imageUrl("https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=800&q=80")
                .contactDetails("+94 81 222 8000 | reservations@santani.lk")
                .build();

        Property villa8 = Property.builder()
                .name("The Beach House Bentota")
                .description("A luxurious beachfront oasis designed by legendary architect Geoffrey Bawa. Features private beach access and an art gallery.")
                .location("Bentota")
                .pricePerNight(new BigDecimal("310.00"))
                .imageUrl("https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80")
                .contactDetails("+94 34 227 5000 | reservations@beachhousebentota.lk")
                .build();

        Property villa9 = Property.builder()
                .name("Hikkaduwa Party Resort")
                .description("Located in the heart of Hikkaduwa's nightlife, featuring pool parties, local DJ events, and beach volleyball.")
                .location("Hikkaduwa")
                .pricePerNight(new BigDecimal("105.00"))
                .imageUrl("https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80")
                .contactDetails("+94 91 555 4321 | party@hikkaduwaresort.lk")
                .build();

        propertyRepository.saveAll(List.of(villa1, villa2, villa3, villa4, villa5, villa6, villa7, villa8, villa9));

        // 3. Link them (Junction Table)
        List<PropertyVibe> links = List.of(
                PropertyVibe.builder().id(new PropertyVibeId(villa1.getId(), safari.getId())).property(villa1).vibe(safari).confidenceScore(new BigDecimal("0.98")).build(),
                PropertyVibe.builder().id(new PropertyVibeId(villa1.getId(), jungle.getId())).property(villa1).vibe(jungle).confidenceScore(new BigDecimal("0.92")).build(),
                
                PropertyVibe.builder().id(new PropertyVibeId(villa2.getId(), surf.getId())).property(villa2).vibe(surf).confidenceScore(new BigDecimal("0.95")).build(),
                PropertyVibe.builder().id(new PropertyVibeId(villa2.getId(), beachfront.getId())).property(villa2).vibe(beachfront).confidenceScore(new BigDecimal("0.85")).build(),
                
                PropertyVibe.builder().id(new PropertyVibeId(villa3.getId(), colonial.getId())).property(villa3).vibe(colonial).confidenceScore(new BigDecimal("0.97")).build(),
                PropertyVibe.builder().id(new PropertyVibeId(villa3.getId(), wellness.getId())).property(villa3).vibe(wellness).confidenceScore(new BigDecimal("0.80")).build(),
                
                PropertyVibe.builder().id(new PropertyVibeId(villa4.getId(), highland.getId())).property(villa4).vibe(highland).confidenceScore(new BigDecimal("0.99")).build(),
                PropertyVibe.builder().id(new PropertyVibeId(villa4.getId(), colonial.getId())).property(villa4).vibe(colonial).confidenceScore(new BigDecimal("0.90")).build(),
                PropertyVibe.builder().id(new PropertyVibeId(villa4.getId(), wellness.getId())).property(villa4).vibe(wellness).confidenceScore(new BigDecimal("0.85")).build(),
                
                PropertyVibe.builder().id(new PropertyVibeId(villa5.getId(), surf.getId())).property(villa5).vibe(surf).confidenceScore(new BigDecimal("0.92")).build(),
                PropertyVibe.builder().id(new PropertyVibeId(villa5.getId(), party.getId())).property(villa5).vibe(party).confidenceScore(new BigDecimal("0.90")).build(),
                
                PropertyVibe.builder().id(new PropertyVibeId(villa6.getId(), jungle.getId())).property(villa6).vibe(jungle).confidenceScore(new BigDecimal("0.95")).build(),
                PropertyVibe.builder().id(new PropertyVibeId(villa6.getId(), highland.getId())).property(villa6).vibe(highland).confidenceScore(new BigDecimal("0.91")).build(),
                
                PropertyVibe.builder().id(new PropertyVibeId(villa7.getId(), wellness.getId())).property(villa7).vibe(wellness).confidenceScore(new BigDecimal("0.99")).build(),
                PropertyVibe.builder().id(new PropertyVibeId(villa7.getId(), highland.getId())).property(villa7).vibe(highland).confidenceScore(new BigDecimal("0.88")).build(),
                
                PropertyVibe.builder().id(new PropertyVibeId(villa8.getId(), beachfront.getId())).property(villa8).vibe(beachfront).confidenceScore(new BigDecimal("0.96")).build(),
                PropertyVibe.builder().id(new PropertyVibeId(villa8.getId(), wellness.getId())).property(villa8).vibe(wellness).confidenceScore(new BigDecimal("0.82")).build(),
                
                PropertyVibe.builder().id(new PropertyVibeId(villa9.getId(), party.getId())).property(villa9).vibe(party).confidenceScore(new BigDecimal("0.98")).build(),
                PropertyVibe.builder().id(new PropertyVibeId(villa9.getId(), surf.getId())).property(villa9).vibe(surf).confidenceScore(new BigDecimal("0.80")).build()
        );

        propertyVibeRepository.saveAll(links);

        System.out.println("✅ Database seeded with 9 diverse Sri Lankan properties and all 8 vibes!");
    }
}
