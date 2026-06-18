package com.eden.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otpCode, String purpose) {
        String subject = switch (purpose) {
            case "REGISTER" -> "Eden AI — Verify your account";
            case "LOGIN" -> "Eden AI — Your login code";
            case "PASSWORD_RESET" -> "Eden AI — Password change code";
            default -> "Eden AI — Your OTP code";
        };

        String body = """
                Hello,

                Your one-time verification code is:

                %s

                This code expires in 10 minutes. Do not share it with anyone.

                — Eden AI
                """.formatted(otpCode);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("Eden AI <edwarddawnguard@gmail.com>");
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }
}
