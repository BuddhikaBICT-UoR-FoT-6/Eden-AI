package com.eden.api.controller;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.service.DatasetService;
import com.eden.api.service.PropertyService;
import lombok.RequiredArgsConstructor;
import com.eden.api.service.RoutingAiSearchProvider;
import com.eden.api.service.OllamaService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiVibeSearchController {

    private final PropertyService propertyService;
    private final DatasetService datasetService;
    private final RoutingAiSearchProvider routingProvider;
    private final OllamaService ollamaService;

    @GetMapping("/search")
    public ResponseEntity<List<PropertyResponseDTO>> searchByVibe(@RequestParam String prompt) {
        return ResponseEntity.ok(propertyService.searchByNaturalLanguage(prompt));
    }

    /**
     * GET /api/dataset/export
     * Streams the full search record DB as a JSONL file.
     * Used by the Colab notebook to retrain the Llama model with real user data.
     * Format matches eden_ai_synthetic_dataset.jsonl exactly.
     */
    @GetMapping(value = "/dataset/export", produces = "application/x-ndjson")
    public ResponseEntity<String> exportDataset() {
        String jsonl = datasetService.exportAsJsonl();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"eden_ai_dataset.jsonl\"")
                .contentType(MediaType.parseMediaType("application/x-ndjson"))
                .body(jsonl);
    }

    /**
     * GET /api/ai/config
     * Returns the current active AI provider configuration.
     */
    @GetMapping("/config")
    public ResponseEntity<java.util.Map<String, String>> getConfig() {
        return ResponseEntity.ok(java.util.Map.of(
            "activeProvider", routingProvider.getActiveProvider(),
            "ollamaUrl", ollamaService.getOllamaUrl() == null ? "" : ollamaService.getOllamaUrl()
        ));
    }

    /**
     * POST /api/ai/config
     * Updates the active AI provider and optionally the Ollama API URL.
     */
    @PostMapping("/config")
    public ResponseEntity<java.util.Map<String, String>> updateConfig(@RequestBody java.util.Map<String, String> payload) {
        if (payload.containsKey("activeProvider")) {
            routingProvider.setActiveProvider(payload.get("activeProvider"));
        }
        if (payload.containsKey("ollamaUrl")) {
            ollamaService.setOllamaUrl(payload.get("ollamaUrl"));
        }
        return ResponseEntity.ok(java.util.Map.of(
            "status", "success",
            "activeProvider", routingProvider.getActiveProvider(),
            "ollamaUrl", ollamaService.getOllamaUrl() == null ? "" : ollamaService.getOllamaUrl()
        ));
    }
}
