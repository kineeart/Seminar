# Slide outline: Notification Service

## Slide 1 - Title
- Xây dựng Notification Service trong hệ thống Microservices
- Nhóm: ...
- Thành viên thực hiện: ...

## Slide 2 - Problem & Goal
- Nhận thông báo khi đơn hàng được tạo thành công
- Tách xử lý thông báo ra khỏi Order Service
- Tăng khả năng mở rộng bằng event-driven architecture

## Slide 3 - Tech Stack
- Spring Boot
- Spring Kafka
- Eureka Client
- Actuator
- Prometheus
- Zipkin
- Lombok

## Slide 4 - Architecture
- Order Service gửi event lên Kafka topic `notificationTopic`
- Notification Service subscribe topic
- Service xử lý message và mô phỏng gửi email
- Service đăng ký với Eureka để discovery

## Slide 5 - Processing Flow
- Nhận JSON message
- Parse `orderNumber` và `message`
- Ghi log thông báo
- Gọi service mô phỏng gửi email

## Slide 6 - Monitoring
- `/actuator/health`
- `/actuator/prometheus`
- Zipkin tracing
- Mục đích: theo dõi trạng thái service và trace request liên service

## Slide 7 - Testing
- Test consumer nhận Kafka message
- Test processor xử lý đúng event
- Kết quả test: pass

## Slide 8 - Docker Demo
- Build image bằng Dockerfile
- Chạy cùng Kafka, Eureka, Zipkin bằng Docker Compose
- Demo tạo đơn hàng và kiểm tra notification log

## Slide 9 - Conclusion
- Service đáp ứng yêu cầu bài tập
- Có thể mở rộng thêm lưu DB, retry, DLQ, email thật
