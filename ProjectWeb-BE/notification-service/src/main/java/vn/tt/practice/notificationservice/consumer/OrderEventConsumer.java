package vn.tt.practice.notificationservice.consumer;

import com.fasterxml.jackson.databind.JsonNode;
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

    @KafkaListener(topics = "notificationTopic", groupId = "notification-group")
    public void listen(String rawJson) {
        try {
            JsonNode node = objectMapper.readTree(rawJson);
            OrderNotificationEvent event = OrderNotificationEvent.builder()
                    .orderNumber(node.path("orderNumber").asText("N/A"))
                    .message(node.path("message").asText("Order Placed Successfully"))
                    .build();

            log.info("Received notification event: {}", event);
            notificationProcessorService.handleOrderNotification(event);
        } catch (Exception e) {
            log.error("Failed to parse notification message: {}", rawJson, e);
        }
    }

}