package vn.tt.practice.notificationservice.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.tt.practice.notificationservice.domain.NotificationRecord;
import vn.tt.practice.notificationservice.domain.NotificationRecordRepository;
import vn.tt.practice.notificationservice.domain.NotificationStatus;
import vn.tt.practice.notificationservice.dto.OrderNotificationEvent;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationProcessorServiceTest {

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationRecordRepository notificationRecordRepository;

    @InjectMocks
    private NotificationProcessorService notificationProcessorService;

    @Test
    void handleOrderNotification_shouldSimulateEmailForOrderEvent() {
        OrderNotificationEvent event = OrderNotificationEvent.builder()
                .orderNumber("ORD123")
                .message("Order Placed Successfully")
                .build();

        when(notificationRecordRepository.save(any(NotificationRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ArgumentCaptor<NotificationRecord> recordCaptor = ArgumentCaptor.forClass(NotificationRecord.class);

        notificationProcessorService.handleOrderNotification(event);

        verify(notificationRecordRepository, times(2)).save(recordCaptor.capture());
        verify(emailService).sendEmail(
                "customer@demo.local",
                "Order Confirmation - ORD123",
                "Order Placed Successfully"
        );

        List<NotificationRecord> savedRecords = recordCaptor.getAllValues();
        assertThat(savedRecords).hasSize(2);
        assertThat(savedRecords.get(0).getStatus()).isEqualTo(NotificationStatus.PROCESSING);
        assertThat(savedRecords.get(1).getStatus()).isEqualTo(NotificationStatus.SENT);
    }
}