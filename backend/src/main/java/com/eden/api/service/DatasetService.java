package com.eden.api.service;

import com.eden.api.dto.SearchExtractionDTO;
import com.eden.api.entity.SearchRecord;
import com.eden.api.repository.SearchRecordRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Manages the living training dataset stored in PostgreSQL.
 *
 * WRITE — every real user search is saved as a SearchRecord row (async, non-blocking).
 * READ  — the last 5 records are loaded as few-shot examples injected into the Gemini prompt.
 *
 * Training loop:
 *   1. Searches accumulate in DB → Gemini gets smarter via few-shot injection immediately.
 *   2. /api/dataset/export streams the full DB as JSONL → Colab downloads & fine-tunes Llama.
 *   3. New .gguf saved to Drive → Ollama loads it → ai.provider switched to ollama in Azure.
 */
@Service
@RequiredArgsConstructor
public class DatasetService {

    private final SearchRecordRepository searchRecordRepository;
    private final ObjectMapper objectMapper;

    /**
     * Saves a completed search to the DB asynchronously.
     * Never blocks the user-facing response.
     */
    @Async
    public void appendSearchRecord(String userPrompt, SearchExtractionDTO extraction, int resultsCount) {
        try {
            String vibesJson = extraction.getVibes() != null
                    ? objectMapper.writeValueAsString(extraction.getVibes())
                    : "[]";

            SearchRecord record = SearchRecord.builder()
                    .prompt(userPrompt)
                    .extractedLocation(extraction.getLocation())
                    .extractedVibes(vibesJson)
                    .extractedBudget(extraction.getMaxBudget())
                    .resultsCount(resultsCount)
                    .build();

            searchRecordRepository.save(record);
            System.out.println("📊 Search saved to dataset. Total: " + searchRecordRepository.count());

        } catch (Exception e) {
            System.err.println("Dataset save failed (non-critical): " + e.getMessage());
        }
    }

    /**
     * Returns the 5 most recent searches as few-shot example strings.
     * Injected into the Gemini prompt to improve extraction accuracy over time.
     */
    public List<String> loadFewShotExamples() {
        List<String> examples = new ArrayList<>();
        try {
            searchRecordRepository.findTop5ByOrderByCreatedAtDesc().forEach(record -> {
                try {
                    String output = objectMapper.writeValueAsString(new java.util.LinkedHashMap<>() {{
                        put("location", record.getExtractedLocation());
                        put("vibes", objectMapper.readValue(
                                record.getExtractedVibes() != null ? record.getExtractedVibes() : "[]",
                                List.class));
                        put("maxBudget", record.getExtractedBudget());
                    }});
                    examples.add("Query: \"" + record.getPrompt() + "\" → " + output);
                } catch (Exception ignored) {}
            });
        } catch (Exception e) {
            System.err.println("Few-shot load failed (non-critical): " + e.getMessage());
        }
        return examples;
    }

    /**
     * Exports all search records as JSONL — called by /api/dataset/export.
     * Colab downloads this to retrain the Llama model.
     */
    public String exportAsJsonl() {
        StringBuilder sb = new StringBuilder();
        try {
            searchRecordRepository.findAll().forEach(record -> {
                try {
                    java.util.Map<String, Object> expectedOutput = new java.util.LinkedHashMap<>();
                    expectedOutput.put("location", record.getExtractedLocation());
                    expectedOutput.put("vibes", objectMapper.readValue(
                            record.getExtractedVibes() != null ? record.getExtractedVibes() : "[]",
                            List.class));
                    expectedOutput.put("maxBudget", record.getExtractedBudget());

                    java.util.Map<String, Object> row = new java.util.LinkedHashMap<>();
                    row.put("instruction", "Extract the location, vibes, and max budget from the travel query.");
                    row.put("input", record.getPrompt());
                    row.put("output", objectMapper.writeValueAsString(expectedOutput));

                    sb.append(objectMapper.writeValueAsString(row)).append("\n");
                } catch (Exception ignored) {}
            });
        } catch (Exception e) {
            System.err.println("JSONL export failed: " + e.getMessage());
        }
        return sb.toString();
    }
}
