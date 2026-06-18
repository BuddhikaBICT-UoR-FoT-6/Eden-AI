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

import com.eden.api.service.OtpService;
import com.eden.api.entity.OtpSession;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@SuppressWarnings("null")
public class UserController {

    private final UserRepository userRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final OtpService otpService;
    private final ObjectMapper objectMapper;

    @Data
    public static class AuthRequest {
        private String name;
        private String email;
        private String username;
        private String password;
        private boolean consent;
        private String otpCode;
    }

    @Data
    public static class ProfileUpdateRequest {
        private String email; // Used to identify user during password reset
        private String name;
        private String newPassword;
        private String otpCode;
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

    @PostMapping("/register/initiate")
    public ResponseEntity<?> initiateRegister(@RequestBody AuthRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        // Assuming there is a findByEmail method (will add to UserRepository)
        // For simplicity, checking if email is already in use by querying all (or add findByEmail in repo)
        
        try {
            String pendingData = objectMapper.writeValueAsString(request);
            otpService.generateAndSendOtp(request.getEmail(), "REGISTER", pendingData);
            return ResponseEntity.ok("OTP sent to " + request.getEmail());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error initiating registration");
        }
    }

    @PostMapping("/register/verify")
    public ResponseEntity<?> verifyRegister(@RequestBody AuthRequest request) {
        Optional<OtpSession> sessionOpt = otpService.verifyOtp(request.getEmail(), request.getOtpCode(), "REGISTER");
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }
        
        try {
            AuthRequest originalData = objectMapper.readValue(sessionOpt.get().getPendingData(), AuthRequest.class);
            User user = User.builder()
                    .name(originalData.getName())
                    .email(originalData.getEmail())
                    .username(originalData.getUsername())
                    .password(originalData.getPassword())
                    .consent(originalData.isConsent())
                    .build();
            User saved = userRepository.save(user);
            otpService.clearOtpSession(request.getEmail(), "REGISTER");
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error creating user");
        }
    }

    @PostMapping("/login/initiate")
    public ResponseEntity<?> initiateLogin(@RequestBody AuthRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(request.getPassword())) {
            return ResponseEntity.badRequest().body("Invalid credentials");
        }
        User user = userOpt.get();
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("No email on this account. Please re-register.");
        }
        otpService.generateAndSendOtp(user.getEmail(), "LOGIN", user.getUsername());
        return ResponseEntity.ok(user.getEmail());
    }

    @PostMapping("/login/verify")
    public ResponseEntity<?> verifyLogin(@RequestBody AuthRequest request) {
        Optional<OtpSession> sessionOpt = otpService.verifyOtp(request.getEmail(), request.getOtpCode(), "LOGIN");
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }
        
        String username = sessionOpt.get().getPendingData();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            otpService.clearOtpSession(request.getEmail(), "LOGIN");
            return ResponseEntity.ok(userOpt.get());
        }
        return ResponseEntity.badRequest().body("User not found");
    }

    @PostMapping("/profile/update-name")
    public ResponseEntity<?> updateName(@RequestBody ProfileUpdateRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        User user = userOpt.get();
        user.setName(request.getName());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/profile/change-password/initiate")
    public ResponseEntity<?> initiatePasswordChange(@RequestBody ProfileUpdateRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found");
        }
        
        try {
            String pendingData = request.getNewPassword(); // Store new password temporarily
            otpService.generateAndSendOtp(request.getEmail(), "PASSWORD_RESET", pendingData);
            return ResponseEntity.ok("OTP sent to " + request.getEmail());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error initiating password change");
        }
    }

    @PostMapping("/profile/change-password/verify")
    public ResponseEntity<?> verifyPasswordChange(@RequestBody ProfileUpdateRequest request) {
        Optional<OtpSession> sessionOpt = otpService.verifyOtp(request.getEmail(), request.getOtpCode(), "PASSWORD_RESET");
        if (sessionOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Invalid or expired OTP");
        }
        
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String newPassword = sessionOpt.get().getPendingData();
            user.setPassword(newPassword);
            userRepository.save(user);
            otpService.clearOtpSession(request.getEmail(), "PASSWORD_RESET");
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.badRequest().body("User not found");
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
        // Save query history
        SearchHistory history = SearchHistory.builder()
                .userId(request.getUserId())
                .query(request.getQuery())
                .build();
        searchHistoryRepository.save(history);
        return ResponseEntity.ok(history);
    }
}
