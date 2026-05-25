package vn.tt.practice.notificationservice.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import vn.tt.practice.notificationservice.service.NotificationProcessorService;

import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class OrderEventConsumerTest {

    @Mock
    private NotificationProcessorService notificationProcessorService;

    @Test
    void listen_shouldParseKafkaMessageAndDelegateToProcessor() {
        String rawJson = "{\"orderNumber\":\"ORD123\",\"message\":\"Order Placed Successfully\"}";
        OrderEventConsumer orderEventConsumer = new OrderEventConsumer(notificationProcessorService, new ObjectMapper());

        orderEventConsumer.listen(rawJson);

        verify(notificationProcessorService).handleOrderNotification(org.mockito.ArgumentMatchers.argThat(event ->
                "ORD123".equals(event.getOrderNumber())
                        && "Order Placed Successfully".equals(event.getMessage())));
    }
}