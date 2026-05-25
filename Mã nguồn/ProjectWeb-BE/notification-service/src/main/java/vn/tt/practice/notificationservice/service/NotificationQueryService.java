package vn.tt.practice.notificationservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.tt.practice.notificationservice.domain.NotificationRecordRepository;
import vn.tt.practice.notificationservice.dto.NotificationResponse;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationQueryService {

    private final NotificationRecordRepository notificationRecordRepository;

    @Transactional(readOnly = true)
    public List<NotificationResponse> findAllNotifications() {
        return notificationRecordRepository.findAll(Sort.by(Sort.Direction.DESC, "processedAt"))
                .stream()
                .map(record -> NotificationResponse.builder()
                        .id(record.getId())
                        .orderNumber(record.getOrderNumber())
                        .message(record.getMessage())
                        .status(record.getStatus())
                        .processedAt(record.getProcessedAt())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public Optional<NotificationResponse> findNotificationById(Long id) {
        return notificationRecordRepository.findById(id)
                .map(record -> NotificationResponse.builder()
                        .id(record.getId())
                        .orderNumber(record.getOrderNumber())
                        .message(record.getMessage())
                        .status(record.getStatus())
                        .processedAt(record.getProcessedAt())
                        .build());
    }
}