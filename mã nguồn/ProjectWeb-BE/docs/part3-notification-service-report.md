# Báo cáo phần 3: Notification Service

## 1. Mục tiêu
Notification Service được xây dựng theo mô hình microservices hướng sự kiện (event-driven) để nhận thông báo khi đơn hàng được tạo thành công. Service này sử dụng Kafka để nhận message từ Order Service, ghi log, mô phỏng gửi email xác nhận và hỗ trợ giám sát qua Actuator, Prometheus và Zipkin.

## 2. Công nghệ sử dụng
- Spring Boot
- Spring Kafka
- Spring Cloud Eureka Client
- Spring Boot Actuator
- Micrometer Tracing + Zipkin
- Micrometer Registry Prometheus
- Lombok

## 3. Kiến trúc xử lý
Luồng xử lý chính:
1. Order Service tạo đơn hàng thành công.
2. Order Service gửi message lên Kafka topic `notificationTopic`.
3. Notification Service subscribe topic này bằng `@KafkaListener`.
4. Khi nhận message, service parse dữ liệu JSON gồm `orderNumber` và `message`.
5. Service ghi log, mô phỏng gửi email và có thể mở rộng để lưu database.

## 4. Cấu hình chính
- `spring.application.name=notification-service`
- `eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/`
- Kafka bootstrap servers trỏ tới cluster Kafka.
- `/actuator/health` để kiểm tra sức khỏe service.
- `/actuator/prometheus` để xuất metrics cho Prometheus.
- Zipkin endpoint để theo dõi tracing.

## 5. Xử lý message Kafka
Message mẫu:
```json
{
  "orderNumber": "ORD123",
  "message": "Order Placed Successfully"
}
```
Khi message được nhận:
- Service đọc JSON bằng `ObjectMapper`.
- Tạo đối tượng `OrderNotificationEvent`.
- Gọi `NotificationProcessorService` để xử lý.
- `EmailService` chỉ mô phỏng gửi email bằng log, không phụ thuộc SMTP thật.

## 6. Kiểm thử
Đã xây dựng 2 test unit:
- Test consumer nhận JSON và chuyển đúng dữ liệu sang processor.
- Test processor xử lý đúng nội dung và gọi email service với nội dung mong đợi.

## 7. Docker
Notification Service có `Dockerfile` để đóng gói thành image. Khi chạy bằng `docker-compose`, service được cấu hình kèm:
- Kafka
- Eureka Server
- Zipkin

## 8. Kết quả demo mong đợi
- Service khởi động thành công trên cổng `8084`.
- Đăng ký lên Eureka thành công.
- Endpoint health trả về trạng thái `UP`.
- Endpoint Prometheus xuất metrics.
- Khi tạo đơn hàng từ Order Service, Notification Service nhận được Kafka message và ghi log xử lý.

## 9. Kết luận
Notification Service đáp ứng yêu cầu của bài tập: nhận sự kiện qua Kafka, xử lý thông báo khi đơn hàng tạo thành công, tích hợp Eureka, Actuator, Prometheus, Zipkin và có kiểm thử cơ bản.
