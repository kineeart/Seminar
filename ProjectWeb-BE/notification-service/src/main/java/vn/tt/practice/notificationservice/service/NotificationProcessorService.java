package vn.tt.practice.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import vn.tt.practice.notificationservice.dto.OrderNotificationEvent;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationProcessorService {

    private final EmailService emailService;

    public void handleOrderNotification(OrderNotificationEvent event) {
        log.info("Order notification received for orderNumber={} with message={}", event.getOrderNumber(), event.getMessage());
        log.info("Storing notification record for orderNumber={}", event.getOrderNumber());
        emailService.sendEmail(
                "customer@demo.local",
                "Order Confirmation - " + event.getOrderNumber(),
                event.getMessage()
        );
    }
}