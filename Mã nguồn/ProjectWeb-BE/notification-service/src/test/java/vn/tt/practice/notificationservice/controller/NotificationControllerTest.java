package vn.tt.practice.notificationservice.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import vn.tt.practice.notificationservice.domain.NotificationStatus;
import vn.tt.practice.notificationservice.dto.NotificationResponse;
import vn.tt.practice.notificationservice.service.NotificationQueryService;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(NotificationController.class)
class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationQueryService notificationQueryService;

    @Test
    void getAllNotifications_shouldReturnNotificationHistory() throws Exception {
        NotificationResponse response = NotificationResponse.builder()
                .id(1L)
                .orderNumber("ORD123")
                .message("Order Placed Successfully")
                .status(NotificationStatus.SENT)
                .processedAt(Instant.parse("2026-05-24T10:15:30Z"))
                .build();

        when(notificationQueryService.findAllNotifications()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/notifications").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderNumber").value("ORD123"))
                .andExpect(jsonPath("$[0].status").value("SENT"));
    }

    @Test
    void getNotificationById_shouldReturnSingleNotification() throws Exception {
        NotificationResponse response = NotificationResponse.builder()
                .id(1L)
                .orderNumber("ORD123")
                .message("Order Placed Successfully")
                .status(NotificationStatus.SENT)
                .processedAt(Instant.parse("2026-05-24T10:15:30Z"))
                .build();

        when(notificationQueryService.findNotificationById(1L)).thenReturn(Optional.of(response));

        mockMvc.perform(get("/api/v1/notifications/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.orderNumber").value("ORD123"));
    }
}