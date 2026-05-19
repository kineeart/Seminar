# Phase 4 - Quiz + Content Suy Luận

Tài liệu này giải thích lý do đằng sau Phase 4 (Quiz + Content). Trọng tâm là hoàn thành vòng học bằng cách cung cấp tạo quiz, chấm điểm và theo dõi tiến độ, đồng thời giữ MVP chạy được mà không cần thiết lập cơ sở dữ liệu.

## Mục tiêu giáo dục

- Chuyển đổi học tập từ chat/flashcard thành những kết quả có thể đo lường.
- Cung cấp các quiz ngắn để ôn tập từ vựng và ngữ pháp.
- Hiển thị phản hồi nhanh để người học có thể điều chỉnh ngay lập tức.

## Lý do tách quiz service

- Tạo quiz dựa trên template để ổn định MVP.
- Các câu hỏi được lấy từ từ vựng bài học để giữ nội dung căn bản.
- `GET /quizzes/:id` ẩn `correct_answer` để ngăn chặn gian lận trước khi submit.

## Thiết kế chấm điểm và phản hồi

- Mỗi câu hỏi được chấm điểm là đúng/sai (1 điểm mỗi câu).
- Điểm số tổng thể được tính dưới dạng phần trăm.
- Các chủ đề yếu được suy ra từ các câu hỏi sai để hướng dẫn ôn tập.
- Phản hồi submit trả về tính đúng/sai từng câu hỏi và giải thích.

## Lý do theo dõi tiến độ

- Theo dõi độ chính xác quiz và số lượng quiz ở cấp độ người dùng.
- Giữ một bản ghi hoạt động hàng ngày đơn giản để hỗ trợ dashboard sau này.
- Tiến độ được cập nhật ngay lập tức sau mỗi lần submit.

## Chiến lược lưu trữ MVP

- Lưu trữ trong bộ nhớ là mặc định để giữ các lần chạy cục bộ đơn giản.
- MongoDB có thể được bật thông qua `MONGODB_URI` với cùng một hình dáng API.
- Điều này giữ MVP nhanh để demo trong khi bảo toàn một con đường nâng cấp rõ ràng.

## Rủi ro và giảm thiểu

- Rủi ro: chất lượng quiz quá chung chung.
  - Giảm thiểu: thêm các bài học được curation và template tốt hơn trong giai đoạn tiếp theo.
- Rủi ro: các chỉ số tiến độ quá mỏng cho retention.
  - Giảm thiểu: mở rộng các trường tiến độ khi dashboard frontend sẵn sàng.

## Kết luận

Phase 4 cung cấp một vòng quiz tối thiểu nhưng hoàn chỉnh với nội dung được biên soạn, chấm điểm và theo dõi tiến độ. Thiết kế đánh đổi tạo quiz AI nâng cao để đổi lấy sự ổn định và hành vi thân thiện với offline MVP, trong khi vẫn giữ một con đường trực tiếp tới persistence và logic quiz phong phú hơn sau này.