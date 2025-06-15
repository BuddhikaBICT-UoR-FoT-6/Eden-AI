package com.eden.api.repository;

import com.eden.api.entity.OtpSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<OtpSession, Long> {
    Optional<OtpSession> findByEmailAndOtpCodeAndPurpose(String email, String otpCode, String purpose);
    void deleteByEmailAndPurpose(String email, String purpose);
}
