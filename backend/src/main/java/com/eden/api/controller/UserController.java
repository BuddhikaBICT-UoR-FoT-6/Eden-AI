package com.eden.api.controller;

import com.eden.api.entity.User;
import com.eden.api.entity.SearchHistory;
import com.eden.api.repository.UserRepository;
import com.eden.api.repository.SearchHistoryRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "${FRONTEND_URL:https://eden-ai-frontend.azurewebsites.net}"})
public class UserController {

    private final UserRepository userRepository;
    private final SearchHistoryRepository searchHistoryRepository;

    @Data
    public static class AuthRequest {
        private String username;
        private String password;
        private boolean consent;
    }

    @Data
    public static class ConsentRequest {
        private Long userId;
        private boolean consent;
    }

    @Data
    public static class HistoryRequest {
        private Long userId;
        private String query;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        User user = User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .consent(request.isConsent())
                .build();
        User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(request.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
        return ResponseEntity.ok(userOpt.get());
    }

    @PostMapping("/consent")
    public ResponseEntity<?> updateConsent(@RequestBody ConsentRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        user.setConsent(request.isConsent());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}/history")
    public ResponseEntity<List<SearchHistory>> getHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(searchHistoryRepository.findByUserIdOrderByTimestampDesc(userId));
    }

    @PostMapping("/history/add")
    public ResponseEntity<?> addHistory(@RequestBody HistoryRequest request) {
        Optional<User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        // Save query history
        SearchHistory history = SearchHistory.builder()
                .userId(request.getUserId())
                .query(request.getQuery())
                .build();
        searchHistoryRepository.save(history);
        return ResponseEntity.ok(history);
    }
}
