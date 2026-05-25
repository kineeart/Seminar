package vn.tt.practice.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

    public void sendEmail(String to, String subject, String text) {
        log.info("notification.email.simulated to={} subject={} body={}", to, subject, text);
    }
}
