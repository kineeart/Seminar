# Báo cáo CI/CD của chương trình AI English Flashcard App

## 1. Tổng quan

Trong chương trình, nhóm đã xây dựng hệ thống CI/CD bằng **GitHub Actions** nhằm tự động hóa quá trình kiểm tra, build và triển khai ứng dụng.

Hệ thống CI/CD gồm 2 workflow chính:

| Workflow | File cấu hình | Mục đích |
|---|---|---|
| CI | `.github/workflows/ci.yml` | Tự động kiểm tra chất lượng code, chạy test và build ứng dụng |
| CD | `.github/workflows/cd.yml` | Tự động triển khai frontend, backend và kiểm tra hệ thống sau khi deploy |

---

## 2. CI Pipeline - Continuous Integration

### 2.1. Mục đích

CI Pipeline được dùng để kiểm tra code mỗi khi có thay đổi được push lên repository hoặc tạo pull request. Mục tiêu là phát hiện lỗi sớm trước khi merge hoặc deploy.

Pipeline này giúp đảm bảo:

- Code không bị lỗi cú pháp.
- Các service backend chạy đúng logic.
- Frontend build thành công.
- Các luồng chính của hệ thống hoạt động ổn định.
- Hạn chế lỗi khi đưa code lên môi trường production.

### 2.2. Thời điểm CI được kích hoạt

CI workflow sẽ chạy khi có:

- Push vào các branch: `main`, `develop`, `Final_Project`.
- Pull request vào các branch: `main`, `develop`, `Final_Project`.

Ngoài ra, workflow có cấu hình `concurrency`, nếu có một lần push mới trong khi CI cũ đang chạy thì CI cũ sẽ bị hủy để chạy bản mới nhất.

### 2.3. Môi trường CI

CI sử dụng:

- Hệ điều hành: `ubuntu-latest`.
- Node.js: `20.x`.
- MongoDB container: `mongo:7` cho các service cần database.
- Các biến môi trường giả lập cho test như:
  - `JWT_SECRET`
  - `MONGODB_URI`
  - `DATABASE_NAME`
  - `LLM_API_KEY`
  - `LLM_BASE_URL`
  - `FLASHCARD_SERVICE_URL`

Các key này chỉ phục vụ kiểm thử, không dùng trực tiếp dữ liệu production.

---

## 3. Các job trong CI Pipeline

### 3.1. Auth Service - Lint & Test

Job này kiểm tra service xác thực người dùng.

Các bước thực hiện:

1. Checkout source code.
2. Cài Node.js.
3. Cài dependencies bằng `npm ci`.
4. Chạy ESLint cho thư mục `auth-service/src`.
5. Chạy unit test bằng Jest.

Nội dung kiểm thử chính:

- Đăng ký tài khoản.
- Đăng nhập.
- Sinh JWT token.
- Kiểm tra password và thông tin xác thực.

Service này dùng MongoDB container để test các thao tác liên quan đến dữ liệu người dùng.

### 3.2. AI Chat Service - Lint & Test

Job này kiểm tra service xử lý hội thoại AI.

Các bước thực hiện:

1. Checkout code.
2. Cài Node.js.
3. Cài dependencies.
4. Chạy lint.
5. Chạy các bộ test riêng cho từng module.
6. Chạy toàn bộ unit test.

Các phần được kiểm thử:

- Prompt builder.
- Flashcard response parser.
- Conversation schema.
- Các logic liên quan đến xử lý hội thoại và tạo flashcard từ phản hồi AI.

Đây là service quan trọng vì chịu trách nhiệm nhận tin nhắn từ người dùng, xử lý prompt và hỗ trợ tạo flashcard.

### 3.3. Flashcard Service - Lint & Test

Job này kiểm tra service quản lý flashcard.

Các bước thực hiện:

1. Checkout code.
2. Cài Node.js.
3. Cài dependencies.
4. Chạy lint.
5. Chạy unit test.

Nội dung kiểm thử chính:

- Tạo flashcard.
- Lấy danh sách flashcard.
- Tạo flashcard hàng loạt.
- Kiểm tra logic chống trùng lặp.
- Truy vấn lịch sử flashcard.

### 3.4. Quiz Service - Lint & Test

Job này kiểm tra service quiz.

Các bước thực hiện:

1. Checkout code.
2. Cài Node.js.
3. Cài dependencies bằng `npm install`.
4. Chạy lint.
5. Chạy unit test.

Nội dung kiểm thử chính:

- Sinh câu hỏi quiz.
- Nộp bài quiz.
- Theo dõi tiến độ học tập.

### 3.5. Gateway - Lint & Health Check

Gateway là entry point của toàn bộ hệ thống backend, chịu trách nhiệm điều hướng request đến các service tương ứng.

Các bước thực hiện:

1. Checkout code.
2. Cài Node.js.
3. Cài dependencies.
4. Chạy lint.
5. Khởi động gateway và kiểm tra endpoint `/health`.

Mục đích của job này là đảm bảo gateway có thể khởi động và phản hồi trạng thái hoạt động bình thường.

### 3.6. Frontend - Lint, Test & Build

Job này kiểm tra ứng dụng frontend.

Job frontend chỉ chạy sau khi các backend service chính đã pass, gồm:

- Auth Service.
- AI Chat Service.
- Flashcard Service.

Các bước thực hiện:

1. Checkout code.
2. Cài Node.js.
3. Cài dependencies bằng `npm ci`.
4. Chạy lint.
5. Chạy unit test.
6. Build production bằng `npm run build`.
7. Upload artifact `frontend-dist`.

Artifact frontend được lưu trong 7 ngày và có thể dùng cho quá trình deploy.

### 3.7. Integration Tests - Full Flow

Đây là job kiểm thử tích hợp toàn bộ hệ thống backend.

Job này chạy sau khi các job sau hoàn thành:

- Auth Service.
- AI Chat Service.
- Flashcard Service.
- Quiz Service.
- Gateway.

Các service được khởi động trong quá trình test:

- Gateway: port `5000`.
- Auth Service: port `5001`.
- AI Chat Service: port `5002`.
- Flashcard Service: port `3003`.

Các luồng tích hợp được kiểm thử:

1. Kiểm tra health check của Gateway.
2. Kiểm tra health check của Auth Service thông qua Gateway.
3. Đăng ký người dùng mới.
4. Đăng nhập và lấy JWT token.
5. Gửi tin nhắn chat và kiểm tra phản hồi.
6. Tạo flashcard hàng loạt.
7. Truy vấn lịch sử flashcard.
8. Kiểm tra chống trùng lặp flashcard.
9. Đánh dấu flashcard đã ôn tập.
10. Kiểm tra lỗi khi đăng ký email trùng.
11. Kiểm tra lỗi khi đăng nhập sai mật khẩu.

Job integration giúp đảm bảo các service không chỉ đúng riêng lẻ mà còn phối hợp được với nhau trong luồng sử dụng thực tế.

---

## 4. CD Pipeline - Continuous Deployment

### 4.1. Mục đích

CD Pipeline được dùng để tự động triển khai hệ thống sau khi CI chạy thành công. Pipeline này giúp giảm thao tác deploy thủ công và đảm bảo phiên bản được triển khai đã qua kiểm thử.

CD gồm các phần chính:

- Deploy frontend.
- Deploy backend.
- Kiểm tra trạng thái production sau deploy.
- In báo cáo tóm tắt quá trình deploy.

### 4.2. Thời điểm CD được kích hoạt

CD workflow chạy trong hai trường hợp:

1. Khi workflow CI hoàn thành thành công trên branch `main` hoặc `Final_Project`.
2. Khi người dùng chạy thủ công bằng `workflow_dispatch` trên GitHub Actions UI.

Workflow có cấu hình `concurrency` để tránh việc chạy hai lần deploy cùng lúc.

### 4.3. Secrets cần cấu hình

CD sử dụng các GitHub Secrets sau:

| Secret | Mục đích |
|---|---|
| `FRONTEND_DEPLOY_HOOK_URL` | Webhook URL để trigger deploy frontend |
| `BACKEND_DEPLOY_HOOK_URL` | Webhook URL để trigger deploy backend |
| `PRODUCTION_URL` | URL production dùng để kiểm tra health check sau deploy |

Nếu thiếu webhook hoặc URL production, pipeline sẽ bỏ qua bước tương ứng và in cảnh báo.

---

## 5. Các job trong CD Pipeline

### 5.1. Deploy Frontend

Job này dùng để triển khai ứng dụng frontend lên hosting như Vercel, Netlify hoặc nền tảng tương tự.

Cách hoạt động:

1. Kiểm tra secret `FRONTEND_DEPLOY_HOOK_URL`.
2. Nếu secret tồn tại, GitHub Actions gửi request `POST` đến webhook.
3. Hosting service nhận webhook, sau đó tự pull code hoặc build lại frontend.
4. Nếu webhook trả HTTP status từ `200` đến `299`, xem như trigger deploy thành công.

Nếu không có secret, job sẽ bỏ qua deploy frontend và không làm fail workflow.

### 5.2. Deploy Backend

Job này dùng để triển khai các microservice backend.

Các service backend được đề cập trong workflow gồm:

- Gateway.
- Auth Service.
- AI Chat Service.
- Flashcard Service.
- Quiz Service.
- Analytics Service.
- Admin Service.

Cách hoạt động:

1. Kiểm tra secret `BACKEND_DEPLOY_HOOK_URL`.
2. Nếu secret tồn tại, GitHub Actions gửi request `POST` đến webhook backend.
3. Server backend nhận webhook, pull code mới và restart các service.
4. Nếu webhook trả HTTP status thành công, job được xem là pass.

Nếu không có secret, job sẽ bỏ qua deploy backend và in cảnh báo.

### 5.3. Post-Deploy Verification

Job này chạy sau khi deploy frontend và backend hoàn tất.

Các bước thực hiện:

1. Chờ 45 giây để service restart và ổn định.
2. Đọc secret `PRODUCTION_URL`.
3. Gửi request đến endpoint `/health` của production.
4. Retry tối đa 3 lần, mỗi lần cách nhau 15 giây.
5. Nếu response chứa trạng thái `ok`, deploy được xem là thành công.
6. Nếu sau 3 lần vẫn fail, workflow báo lỗi và yêu cầu kiểm tra log hoặc rollback thủ công.

### 5.4. Deploy Summary

Cuối workflow, pipeline in ra thông tin tóm tắt gồm:

- Loại trigger.
- Branch được deploy.
- Thời gian deploy theo UTC.

Thông tin này giúp nhóm dễ theo dõi lịch sử triển khai trên GitHub Actions.

---

## 6. Lợi ích của CI/CD trong chương trình

Việc áp dụng CI/CD mang lại các lợi ích sau:

- Tự động kiểm tra code mỗi khi có thay đổi.
- Phát hiện lỗi sớm trước khi merge hoặc deploy.
- Giảm rủi ro deploy lỗi lên production.
- Đảm bảo backend, frontend và các service chính hoạt động đúng.
- Tự động hóa quá trình build frontend.
- Tự động hóa deploy frontend và backend thông qua webhook.
- Có bước health check sau deploy để xác nhận hệ thống production hoạt động.
- Giúp nhóm phát triển phần mềm nhanh hơn, ổn định hơn và dễ kiểm soát chất lượng hơn.

---

## 7. Kết luận

Hệ thống CI/CD của chương trình AI English Flashcard App được thiết kế theo hướng tự động hóa từ kiểm thử đến triển khai. CI đảm nhiệm việc kiểm tra chất lượng code, chạy test từng service, build frontend và kiểm thử tích hợp toàn hệ thống. CD đảm nhiệm việc triển khai frontend, backend và xác nhận trạng thái production sau deploy.

Nhờ CI/CD, quy trình phát triển phần mềm trở nên chuyên nghiệp hơn, giảm lỗi thủ công và đảm bảo mỗi phiên bản trước khi đưa lên production đều đã được kiểm tra qua nhiều bước.