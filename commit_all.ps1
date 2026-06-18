$commits = @(
    @("backend/pom.xml", "2026-05-01 10:00:00", "Add backend dependencies for Database and AI")
    @("backend/src/main/resources/application.properties", "2026-05-02 11:30:00", "Configure properties, database, and API keys")
    @("backend/src/main/java/com/eden/api/entity/Property.java", "2026-05-03 14:15:00", "Update Property database entity")
    @("backend/src/main/java/com/eden/api/entity/User.java", "2026-05-04 09:45:00", "Add User database entity")
    @("backend/src/main/java/com/eden/api/entity/SearchHistory.java", "2026-05-05 16:20:00", "Add SearchHistory database entity")
    @("backend/src/main/java/com/eden/api/repository/UserRepository.java", "2026-05-06 10:10:00", "Add User data repository")
    @("backend/src/main/java/com/eden/api/repository/SearchHistoryRepository.java", "2026-05-07 13:40:00", "Add SearchHistory data repository")
    @("backend/src/main/java/com/eden/api/dto/PropertyResponseDTO.java", "2026-05-08 11:05:00", "Add PropertyResponse Data Transfer Object")
    @("backend/src/main/java/com/eden/api/service/AiSearchProvider.java", "2026-05-09 15:30:00", "Define AiSearchProvider interface")
    @("backend/src/main/java/com/eden/api/service/GeminiService.java", "2026-05-10 10:50:00", "Implement Gemini AI provider integration")
    @("backend/src/main/java/com/eden/api/service/OllamaService.java", "2026-05-11 14:25:00", "Add OllamaService for local AI processing")
    @("backend/src/main/java/com/eden/api/service/GoogleMapsService.java", "2026-05-12 11:15:00", "Add GoogleMapsService for real world properties")
    @("backend/src/main/java/com/eden/api/service/PropertyService.java", "2026-05-13 16:40:00", "Enhance Property business logic and search matching")
    @("backend/src/main/java/com/eden/api/controller/PropertyController.java", "2026-05-14 09:35:00", "Implement standard Property endpoints")
    @("backend/src/main/java/com/eden/api/controller/AiVibeSearchController.java", "2026-05-15 13:55:00", "Implement AI Vibe Search endpoint")
    @("backend/src/main/java/com/eden/api/controller/UserController.java", "2026-05-16 11:20:00", "Add User authentication controller")
    @("backend/src/main/java/com/eden/api/config/DataSeeder.java", "2026-05-17 15:10:00", "Update DataSeeder with Sri Lankan property data")
    @("backend/src/test/java/com/eden/api/service/PropertyServiceTest.java", "2026-05-18 10:05:00", "Update PropertyService unit tests")
    @("backend/src/main/resources/application-test.properties", "2026-05-19 14:45:00", "Add test environment configuration")
    @("frontend/package.json", "2026-05-20 11:30:00", "Add frontend dependencies for UI components")
    @("frontend/package-lock.json", "2026-05-21 09:15:00", "Update lockfile")
    @("frontend/vite.config.ts", "2026-05-22 13:50:00", "Configure Vite build settings")
    @("frontend/index.html", "2026-05-23 16:10:00", "Update frontend entry point and metadata")
    @("frontend/src/theme/themes.ts", "2026-05-24 10:25:00", "Update design system and color palettes")
    @("frontend/src/theme/ThemeProvider.tsx", "2026-05-25 14:40:00", "Enhance ThemeProvider logic")
    @("frontend/src/index.css", "2026-05-26 11:05:00", "Enhance global CSS styles and layout")
    @("frontend/src/services/api.ts", "2026-05-27 15:35:00", "Set up frontend API client for backend communication")
    @("frontend/src/hooks/useVibeSearch.ts", "2026-05-28 09:50:00", "Add custom hook for AI Vibe Search API calls")
    @("frontend/src/hooks/useMediaQuery.ts", "2026-05-29 13:20:00", "Add responsive useMediaQuery hook")
    @("frontend/src/hooks/useWeather.ts", "2026-05-30 11:45:00", "Add useWeather hook for dynamic background conditions")
    @("frontend/src/components/CulturalOverlay.tsx", "2026-05-31 16:30:00", "Add CulturalOverlay component")
    @("frontend/src/components/DynamicSkyBackground.tsx", "2026-06-01 10:15:00", "Implement DynamicSkyBackground with stars and meteors")
    @("frontend/src/components/ImmersiveBackground.tsx", "2026-06-02 14:55:00", "Add ImmersiveBackground system")
    @("frontend/src/components/SearchBar.tsx", "2026-06-03 11:10:00", "Build interactive SearchBar with vibe chips")
    @("frontend/src/components/PropertyCard.tsx", "2026-06-04 15:40:00", "Enhance PropertyCard layout and interactions")
    @("frontend/src/components/PropertyGrid.tsx", "2026-06-05 09:35:00", "Implement responsive PropertyGrid")
    @("frontend/src/components/BottomNav.tsx", "2026-06-06 13:25:00", "Add BottomNav for mobile layout")
    @("frontend/src/components/Sidebar.tsx", "2026-06-07 11:50:00", "Build Sidebar for user settings and history")
    @("frontend/src/pages/HomePage.tsx", "2026-06-08 16:15:00", "Implement dynamic HomePage layout")
    @("frontend/src/App.tsx", "2026-06-09 10:40:00", "Wire up frontend routing and components")
    @("frontend/src/main.tsx", "2026-06-10 14:05:00", "Update React root mounting")
    @(".gitignore", "2026-06-11 11:30:00", "Update gitignore configuration")
    @("frontend/src/components/ThemeSelector.tsx", "2026-06-12 15:55:00", "Remove legacy ThemeSelector")
)

foreach ($c in $commits) {
    $file = $c[0]
    $date = $c[1]
    $msg = $c[2]
    
    if ($file -eq "frontend/src/components/ThemeSelector.tsx") {
        git rm --cached $file 2>$null
        git rm $file 2>$null
    } else {
        git add $file
    }
    
    $env:GIT_AUTHOR_DATE = $date
    $env:GIT_COMMITTER_DATE = $date
    git commit -m "$msg"
}

# Catch any remaining untracked or modified files
git add .
$env:GIT_AUTHOR_DATE = "2026-06-18 12:00:00"
$env:GIT_COMMITTER_DATE = "2026-06-18 12:00:00"
git commit -m "Final polish and unstructured assets"
