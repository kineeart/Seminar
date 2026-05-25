package vn.tt.practice.notificationservice.consumer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import vn.tt.practice.notificationservice.dto.OrderNotificationEvent;
import vn.tt.practice.notificationservice.service.NotificationProcessorService;

@RequiredArgsConstructor
@Service
@Slf4j
public class OrderEventConsumer {

    private final NotificationProcessorService notificationProcessorService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${app.kafka.topics.notification-topic}", groupId = "${spring.kafka.consumer.group-id}")
    public void listen(String rawJson) {
        try {
            OrderNotificationEvent event = parseNotificationEvent(rawJson);
            log.info("notification.consumer.received orderNumber={} message={}", event.getOrderNumber(), event.getMessage());
            notificationProcessorService.handleOrderNotification(event);
        } catch (Exception exception) {
            log.error("notification.consumer.failed payload={} reason={}", rawJson, exception.getMessage(), exception);
        }
    }

    private OrderNotificationEvent parseNotificationEvent(String rawJson) throws JsonProcessingException {
        return objectMapper.readValue(rawJson, OrderNotificationEvent.class);
    }

}