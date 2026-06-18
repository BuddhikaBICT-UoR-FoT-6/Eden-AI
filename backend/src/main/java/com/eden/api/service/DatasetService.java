package com.eden.api.service;

import com.eden.api.dto.SearchExtractionDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * Manages the living training dataset on Google Drive.
 *
 * Two responsibilities:
 * 1. WRITE — After every real user search, append a JSONL record to the Drive file.
 *    This continuously grows the dataset used to retrain the model in Colab.
 *
 * 2. READ — Before each Gemini call, load the N most recent examples from the file
 *    and return them as few-shot examples to inject into the Gemini prompt.
 *    This is the free "model improvement" loop — no fine-tuning needed.
 *    The more searches that accumulate, the better Gemini's extractions become.
 */
@Service
@RequiredArgsConstructor
public class DatasetService {

    @Value("${google.drive.file.id}")
    private String driveFileId;

    @Value("${google.drive.credentials.json:}")
    private String credentialsJson;

    private final ObjectMapper objectMapper;

    private static final int FEW_SHOT_LIMIT = 5;
    private static final String APP_NAME = "Eden AI Dataset";

    // ─── PUBLIC API ───────────────────────────────────────────────────────────

    /**
     * Appends a completed search record to the Drive JSONL file asynchronously.
     * Called after every search — fire-and-forget, never blocks the response.
     *
     * Format matches the Colab training notebook exactly:
     * {"instruction": "...", "input": "<user prompt>", "output": "<json extraction>"}
     */
    @Async
    public void appendSearchRecord(String userPrompt, SearchExtractionDTO extraction, int resultsCount) {
        try {
            Drive drive = buildDriveClient();
            if (drive == null) return;

            String existingContent = downloadFileContent(drive);

            Map<String, Object> record = new LinkedHashMap<>();
            record.put("instruction", "Extract the location, vibes, and max budget from the travel query.");
            record.put("input", userPrompt);
            record.put("output", objectMapper.writeValueAsString(extraction));
            record.put("results_count", resultsCount);
            record.put("timestamp", System.currentTimeMillis());

            String newLine = objectMapper.writeValueAsString(record);
            String updatedContent = existingContent.isBlank()
                    ? newLine
                    : existingContent.stripTrailing() + "\n" + newLine;

            uploadFileContent(drive, updatedContent);
            System.out.println("📊 Dataset record appended. Prompt: " + userPrompt.substring(0, Math.min(50, userPrompt.length())));

        } catch (Exception e) {
            System.err.println("Dataset append failed (non-critical): " + e.getMessage());
        }
    }

    /**
     * Loads the most recent few-shot examples from the Drive dataset.
     * Returns formatted strings ready to inject into a Gemini prompt.
     * Returns empty list if Drive is unavailable — Gemini still works, just without examples.
     */
    public List<String> loadFewShotExamples() {
        try {
            Drive drive = buildDriveClient();
            if (drive == null) return List.of();

            String content = downloadFileContent(drive);
            if (content.isBlank()) return List.of();

            String[] lines = content.strip().split("\n");
            // Take last FEW_SHOT_LIMIT lines (most recent entries)
            int start = Math.max(0, lines.length - FEW_SHOT_LIMIT);

            List<String> examples = new ArrayList<>();
            for (int i = start; i < lines.length; i++) {
                try {
                    Map<?, ?> record = objectMapper.readValue(lines[i], Map.class);
                    String input = (String) record.get("input");
                    String output = (String) record.get("output");
                    if (input != null && output != null) {
                        examples.add("Query: \"" + input + "\" → " + output);
                    }
                } catch (Exception ignored) {}
            }
            return examples;

        } catch (Exception e) {
            System.err.println("Few-shot load failed (non-critical): " + e.getMessage());
            return List.of();
        }
    }

    // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

    private Drive buildDriveClient() {
        try {
            if (credentialsJson == null || credentialsJson.isBlank()) return null;

            GoogleCredentials credentials = GoogleCredentials
                    .fromStream(new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8)))
                    .createScoped("https://www.googleapis.com/auth/drive");

            return new Drive.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    new HttpCredentialsAdapter(credentials))
                    .setApplicationName(APP_NAME)
                    .build();

        } catch (Exception e) {
            System.err.println("Drive client build failed: " + e.getMessage());
            return null;
        }
    }

    private String downloadFileContent(Drive drive) throws IOException {
        try (InputStream is = drive.files().get(driveFileId).executeMediaAsInputStream();
             BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) sb.append(line).append("\n");
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    private void uploadFileContent(Drive drive, String content) throws IOException {
        byte[] bytes = content.getBytes(StandardCharsets.UTF_8);
        File metadata = new File();
        metadata.setMimeType("application/octet-stream");

        drive.files().update(driveFileId, metadata,
                new com.google.api.client.http.ByteArrayContent("application/octet-stream", bytes))
                .execute();
    }
}
