package com.eden.api.controller;

import com.eden.api.dto.PropertyResponseDTO;
import com.eden.api.service.DatasetService;
import com.eden.api.service.PropertyService;
import lombok.RequiredArgsConstructor;
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
}
