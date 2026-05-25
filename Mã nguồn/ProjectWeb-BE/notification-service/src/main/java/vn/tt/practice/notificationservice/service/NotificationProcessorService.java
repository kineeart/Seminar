package vn.tt.practice.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tt.practice.notificationservice.domain.NotificationRecord;
import vn.tt.practice.notificationservice.domain.NotificationRecordRepository;
import vn.tt.practice.notificationservice.domain.NotificationStatus;
import vn.tt.practice.notificationservice.dto.OrderNotificationEvent;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationProcessorService {

    private final EmailService emailService;
    private final NotificationRecordRepository notificationRecordRepository;

    @Transactional
    public void handleOrderNotification(OrderNotificationEvent event) {
    log.info("notification.processor.start orderNumber={} message={}", event.getOrderNumber(), event.getMessage());

    NotificationRecord notificationRecord = NotificationRecord.builder()
        .orderNumber(event.getOrderNumber())
        .message(event.getMessage())
        .status(NotificationStatus.PROCESSING)
        .build();

    NotificationRecord savedRecord = notificationRecordRepository.save(notificationRecord);

        try {
            emailService.sendEmail(
                    "customer@demo.local",
                    "Order Confirmation - " + savedRecord.getOrderNumber(),
                    event.getMessage()
            );

            savedRecord.setStatus(NotificationStatus.SENT);
            notificationRecordRepository.save(savedRecord);
            log.info("notification.processor.completed id={} orderNumber={} status={}", savedRecord.getId(), savedRecord.getOrderNumber(), savedRecord.getStatus());
        } catch (Exception exception) {
            savedRecord.setStatus(NotificationStatus.FAILED);
            notificationRecordRepository.save(savedRecord);
            log.error("notification.processor.failed id={} orderNumber={} reason={}", savedRecord.getId(), savedRecord.getOrderNumber(), exception.getMessage(), exception);
            throw exception;
        }
    }
}