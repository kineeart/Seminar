package vn.tt.practice.orderservice.producer;

import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderEventProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;

    public void sendOrderEvent(String orderNumber, String message, String userId) {
        String jsonMessage = String.format(
                "{\"orderNumber\":\"%s\", \"message\":\"%s\", \"userId\":\"%s\"}",
                orderNumber,
                message,
                userId
        );
        kafkaTemplate.send("notificationTopic",jsonMessage);
    }
}