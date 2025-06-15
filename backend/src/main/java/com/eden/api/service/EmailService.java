package com.eden.api.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendOtpEmail(String toEmail, String otpCode, String purpose) {
        // Simulated Email Sending
        System.out.println("=========================================================");
        System.out.println("📧 SIMULATED EMAIL SENT TO: " + toEmail);
        System.out.println("Subject: Eden AI OTP Code for " + purpose);
        System.out.println("Body: Your One-Time Password is: " + otpCode);
        System.out.println("=========================================================");
    }
}
