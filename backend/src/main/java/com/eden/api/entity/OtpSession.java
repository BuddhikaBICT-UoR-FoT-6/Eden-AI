package com.eden.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String email;

    @Column(nullable = false, length = 10)
    private String otpCode;

    @Column(nullable = false, length = 50)
    private String purpose; // e.g., REGISTER, LOGIN, PASSWORD_RESET

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private boolean verified;

    @Column(columnDefinition = "TEXT")
    private String pendingData; // Store JSON string of User details during registration
}
