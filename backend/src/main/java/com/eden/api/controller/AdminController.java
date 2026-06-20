package com.eden.api.controller;

import com.eden.api.dto.AdminConfigDTO;
import com.eden.api.service.OllamaService;
import com.eden.api.service.RoutingAiSearchProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final RoutingAiSearchProvider routingAiSearchProvider;
    private final OllamaService ollamaService;

    @PostMapping("/config/ai-provider")
    public ResponseEntity<?> updateAiProvider(@RequestBody AdminConfigDTO configDTO) {
        if (configDTO.getProvider() != null && !configDTO.getProvider().isEmpty()) {
            routingAiSearchProvider.setActiveProvider(configDTO.getProvider());
        }
        
        if (configDTO.getOllamaUrl() != null && !configDTO.getOllamaUrl().isEmpty()) {
            // Trim any trailing slashes just in case
            String cleanUrl = configDTO.getOllamaUrl().replaceAll("/+$", "");
            ollamaService.setOllamaUrl(cleanUrl);
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "AI provider configuration updated successfully",
                "activeProvider", routingAiSearchProvider.getActiveProvider(),
                "ollamaUrl", ollamaService.getOllamaUrl()
        ));
    }
}
