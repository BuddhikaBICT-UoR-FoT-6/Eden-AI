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
        try {
            if (configDTO.getProvider() != null && !configDTO.getProvider().isEmpty()) {
                routingAiSearchProvider.setActiveProvider(configDTO.getProvider());
            }
            
            if (configDTO.getOllamaUrl() != null && !configDTO.getOllamaUrl().isEmpty()) {
                // Trim any trailing slashes just in case
                String cleanUrl = configDTO.getOllamaUrl().replaceAll("/+$", "");
                ollamaService.setOllamaUrl(cleanUrl);
            }

            Map<String, String> response = new java.util.HashMap<>();
            response.put("status", "success");
            response.put("message", "AI provider configuration updated successfully");
            response.put("activeProvider", String.valueOf(routingAiSearchProvider.getActiveProvider()));
            response.put("ollamaUrl", String.valueOf(ollamaService.getOllamaUrl()));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new java.util.HashMap<>();
            error.put("status", "error");
            error.put("message", "Exception in AdminController: " + e.getClass().getName() + " - " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
