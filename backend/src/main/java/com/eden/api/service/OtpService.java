package com.eden.api.service;

import com.eden.api.entity.OtpSession;
import com.eden.api.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final Random random = new Random();

    @Transactional
    public void generateAndSendOtp(String email, String purpose, String pendingData) {
        // Clear any existing OTP for this email and purpose
        otpRepository.deleteByEmailAndPurpose(email, purpose);

        // Generate 6-digit OTP
        String otpCode = String.format("%06d", random.nextInt(1000000));

        OtpSession session = OtpSession.builder()
                .email(email)
                .otpCode(otpCode)
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(10)) // 10 minutes expiry
                .verified(false)
                .pendingData(pendingData)
                .build();

        otpRepository.save(session);
        emailService.sendOtpEmail(email, otpCode, purpose);
    }

    @Transactional
    public Optional<OtpSession> verifyOtp(String email, String otpCode, String purpose) {
        Optional<OtpSession> sessionOpt = otpRepository.findByEmailAndOtpCodeAndPurpose(email, otpCode, purpose);
        if (sessionOpt.isPresent()) {
            OtpSession session = sessionOpt.get();
            if (session.getExpiresAt().isAfter(LocalDateTime.now()) && !session.isVerified()) {
                session.setVerified(true);
                otpRepository.save(session);
                return Optional.of(session);
            }
        }
        return Optional.empty();
    }

    @Transactional
    public void clearOtpSession(String email, String purpose) {
        otpRepository.deleteByEmailAndPurpose(email, purpose);
    }
}
