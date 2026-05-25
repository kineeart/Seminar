package vn.tt.practice.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    public void sendEmail(String to, String subject, String text) {
        log.info("Simulated email sent to={}, subject={}, text={}", to, subject, text);
    }
}
