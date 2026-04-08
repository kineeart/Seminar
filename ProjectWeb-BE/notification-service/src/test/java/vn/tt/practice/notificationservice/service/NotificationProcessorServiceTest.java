package vn.tt.practice.notificationservice.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.tt.practice.notificationservice.dto.OrderNotificationEvent;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class NotificationProcessorServiceTest {

    @Mock
    private EmailService emailService;

    @InjectMocks
    private NotificationProcessorService notificationProcessorService;

    @Test
    void handleOrderNotification_shouldSimulateEmailForOrderEvent() {
        OrderNotificationEvent event = OrderNotificationEvent.builder()
                .orderNumber("ORD123")
                .message("Order Placed Successfully")
                .build();

        notificationProcessorService.handleOrderNotification(event);

        verify(emailService).sendEmail(
                "customer@demo.local",
                "Order Confirmation - ORD123",
                "Order Placed Successfully"
        );
    }
}