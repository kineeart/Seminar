# 🎓 Vibe Coding: Hệ Thống Gia Sư AI Học Tiếng Anh — Bài Nộp Seminar

## Tóm Tắt Điều Hành

**Dự Án**: Nền Tảng Học Tiếng Anh Bằng AI  
**Chủ Đề**: "Vibe Coding/Low-Code/No-Code trong Tương Lai của Kỹ Nghệ Phần Mềm"  
**Thời Lượng**: Chu Kỳ MVP 12 Tuần  
**Kiến Trúc**: Microservices + Thiết Kế Phi Phụ Thuộc Vào AI  
**Đổi Mới Chính**: Tạo Nguyên Mẫu Nhanh Chóng Sử Dụng Phát Triển Tăng Cường AI (Vibe Coding)

---

## 1. Tình Huống Kinh Doanh

### 1.1 Vấn Đề Thị Trường
- **Đối Tượng Mục Tiêu**: Gen Z (16-25 tuổi) có thời gian chú ý ngắn
- **Điểm Đau**: Các ứng dụng học tiếng Anh hiện tại tốn quá nhiều thời gian, chưa thực dụng
- **Cơ Hội**: Thiết kế mobile-first, hỗ trợ AI, học theo kiểu nhỏ giọt (<30 giây mỗi lần tương tác)

### 1.2 Tầm Nhìn Sản Phẩm: "Hỏi Gì Đáp Nấy, Học Được Gì"
- **Lời Hứa Cốt Lõi**: Nhận nội dung học tiếng Anh hữu ích trong dưới 30 giây
- **Góc Nhìn Độc Đáo**: 
  - Ưu tiên hội thoại (Chat là kênh học tập chính)
  - Cá nhân hóa theo trình độ + mục tiêu thi cử (TOEIC, IELTS, VSTEP)
  - Từ vựng + cấu trúc thực tế, thực dụng
  - Hạ thấp rào cản tâm lý khi hỏi câu hỏi

### 1.3 Phạm Vi MVP (12 Tuần Đầu Tiên)
**Tính Năng Bắt Buộc**:
1. **Chat AI** (2 chế độ: Giải Thích + Tình Huống)
2. **Tự Động Tạo Flashcard** từ nội dung chat
3. **Tạo & Chấm Điểm Quiz** bằng AI
4. **Bảng Điều Khiển Tiến Độ** theo dõi chuỗi học tập
5. **Xác Thực** (Google OAuth + Email/Password)
6. **Hướng Dẫn Onboarding** (Trình độ → Mục tiêu → Chứng chỉ → Chủ đề)
7. **Chế Độ Khách** với 7 ngày dùng thử
8. **Bảng Điều Khiển Admin** quản lý người dùng/nội dung

**Ngoài Phạm Vi**:
- Ứng dụng di động native (chỉ responsive web)
- Chế độ PWA/Offline
- Chấm điểm phát âm/Giọng nói
- Học tập xã hội hoặc multiplayer

---

## 2. Triết Lý Vibe Coding Trong Dự Án Này

### 2.1 "Vibe Coding" Là Gì?
Vibe Coding = **Phát triển nhanh, tăng cường bằng AI** khi:
- AI Copilot viết 60-70% mã boilerplate + mã theo mẫu
- Lập trình viên tập trung vào logic kinh doanh + quyết định kiến trúc
- Tài liệu bàn giao rõ ràng cho phép quy trình AI→Con người→AI liền mạch
- Nhấn mạnh: PRD rõ ràng, lịch sử Git sạch sẽ, tài liệu nhúng

### 2.2 Cách Dự Án Này Thực Hiện Vibe Coding
1. **Cấu Trúc Rõ Ràng**: Cách ly Microservices giúp bàn giao dễ dàng
2. **Tài Liệu Nhúng**: Mỗi service có README + bình luận nội dòng
3. **Quy Tắc Quy Trình**: `COPILOT_WORKFLOW_RULES.md` + `.prompt.md` hướng dẫn trợ giúp AI
4. **Kiến Trúc Có Thể Kiểm Thử**: Mỗi service có bài kiểm thử Jest; dễ xác minh mã AI-generated
5. **Mở Rộng Mô-đun**: Các tính năng mới được thêm dưới dạng dịch vụ mới, không phải thay đổi monolithic

### 2.3 Tốc Độ Phát Triển
- **Giai Đoạn 0** (Thiết Lập): 2 tuần — Cơ sở hạ tầng, Docker, CI/CD
- **Giai Đoạn 1** (Xác Thực): 2 tuần — Cách ly dịch vụ được chứng minh
- **Giai Đoạn 2** (Chat AI): 3 tuần — Vòng lặp học tập cốt lõi
- **Giai Đoạn 3** (Flashcard): 2 tuần — Tích hợp lặp lại khoảng cách
- **Giai Đoạn 4** (Quiz): 2 tuần — Đánh giá + chấm điểm
- **Giai Đoạn 5** (Cơ Sở Dữ Liệu): 1 tuần — Lưu trữ MongoDB Atlas

**Tổng Cộng: ~12 tuần với 80%+ mã AI-generated trong boilerplate & tiện ích**

---

## 3. Stack Công Nghệ — "Low-Code Theo Thiết Kế"

### Frontend
- **Framework**: React 18 + Vite (HMR, build nhanh)
- **Tại Sao**: Dựa trên thành phần, khả năng tái sử dụng cao, hệ sinh thái rộng lớn
- **Chiến Lược Low-Code**: Sử dụng thư viện thành phần UI (shadcn/ui hoặc headless)

### Backend
- **Kiến Trúc**: Microservices (mô hình API Gateway)
- **Các Dịch Vụ**:
  - `auth-service` — Xác thực người dùng, JWT
  - `ai-chat-service` — Quản lý hội thoại
  - `ai-worker` — Tích hợp LLM (Gemini API)
  - `flashcard-service` — Lặp lại khoảng cách (thuật toán SM-2)
  - `quiz-service` — Tạo câu hỏi + chấm điểm
  - `gateway` — Định tuyến yêu cầu, xác thực JWT, hạn chế tốc độ

### Cơ Sở Dữ Liệu
- **MongoDB** (chính) — Lược đồ linh hoạt cho bản ghi chat, dữ liệu người dùng linh hoạt
- **PostgreSQL** (nếu cần) — Dữ liệu quan hệ (người dùng, token, nội dung có cấu trúc)
- **Redis** — Bộ nhớ cache phiên, hạn chế tốc độ
- **RabbitMQ** — Hàng đợi công việc không đồng bộ để xử lý AI

### Tích Hợp AI
- **Nhà Cung Cấp**: Google Gemini API (`gemini-2.5-flash`)
- **Fallback**: Phản hồi dựa trên quy tắc cục bộ nếu hạn ngạch hết
- **Phương Pháp**: Giống như agent (không có trạng thái) hiện tại; tương lai: bộ nhớ có trạng thái

### DevOps
- **Containerization**: Docker + Docker Compose (phát triển cục bộ)
- **CI/CD**: GitHub Actions (lint, build, deploy stubs)
- **Deployment**: Sẵn sàng cho cloud (mục tiêu GCP/AWS)

---

## 4. Tổng Quan Kiến Trúc Hệ Thống

### 4.1 Luồng Cấp Cao
```
Người Dùng (Trình Duyệt)
    ↓
Frontend (React/Vite)
    ↓ HTTP/WebSocket
API Gateway (Cổng 3000)
    ├→ Auth Service (xác thực JWT)
    ├→ AI Chat Service (Chat CRUD + streaming)
    ├→ Flashcard Service (CRUD + lịch)
    ├→ Quiz Service (Tạo + chấm điểm)
    └→ [Thêm dịch vụ khi cần]
    ↓ Không Đồng Bộ
Message Broker (RabbitMQ)
    ↓
AI Worker (tích hợp Gemini API)
    ↓
Cơ Sở Dữ Liệu (MongoDB, PostgreSQL, Redis)
```

### 4.2 Tương Tác Dịch Vụ Chính

#### Luồng Chat (Vòng Lặp Học Tập Cốt Lõi)
1. Người dùng gửi tin nhắn → Frontend
2. Frontend POST tới Gateway `/chat/create`
3. Gateway xác thực JWT, định tuyến tới `ai-chat-service`
4. AI Chat Service:
   - Tạo phiên (nếu mới)
   - Lưu tin nhắn vào MongoDB
   - Xuất bản công việc tới RabbitMQ
5. AI Worker tiêu thụ công việc:
   - Gọi Gemini API
   - Stream phản hồi lại
6. AI Chat Service cập nhật bản ghi
7. Frontend nhận phản hồi qua HTTP/WS
8. Người dùng thấy phản hồi từ gia sư AI (chế độ Giải Thích hoặc Tình Huống)

#### Sinh Flashcard (Lặp Lại Khoảng Cách)
1. Người dùng thủ công/tự động gắn thẻ tin nhắn dưới dạng flashcard
2. AI Chat Service tạo tài liệu flashcard trong MongoDB
3. Flashcard Service lập lịch xem xét bằng thuật toán SM-2
4. Bảng điều khiển hiển thị "Flashcard Hôm Nay"
5. Người dùng vuốt (Lặp lại/Khó/Tốt/Dễ)
6. Thuật toán tính toán lại ngày xem xét tiếp theo
7. Tiến độ được theo dõi trong bộ sưu tập `progress`

#### Luồng Quiz (Đánh Giá)
1. Người dùng nhấp vào "Làm Quiz"
2. Quiz Service truy vấn trình độ, chủ đề gần đây
3. AI Worker tạo câu hỏi qua Gemini (prompt: trình độ + chủ đề)
4. Quiz Service lưu trữ tài liệu quiz
5. Frontend hiển thị giao diện Q&A
6. Người dùng gửi câu trả lời
7. Quiz Service chấm điểm & tạo giải thích
8. Kết quả lưu trữ trong bộ sưu tập `quiz_results`
9. Tiến độ cập nhật (quizzes_completed ++, tính toán chuỗi)

#### Theo Dõi Tiến Độ (Bảng Điều Khiển)
- Bộ sưu tập `progress` chính được lập chỉ mục theo user_id
- Các trường: `quizzes_completed`, `flashcards_completed`, `total_chat_sessions`, `learned_words_count`, `streak_days`, `last_active_date`
- Cập nhật qua tín hiệu dịch vụ chéo (cố gắng quiz → quiz-service xuất bản sự kiện → quiz-service cập nhật tiến độ)
- Dashboard Frontend truy vấn điểm cuối tiến độ để hiển thị trực quan

---

## 5. Chiến Lược AI Agent

### 5.1 Trạng Thái Hiện Tại (MVP)
**Chưa hoàn toàn agent** — giống hơn "AI như một Hàm":
- Mỗi truy vấn người dùng → Cuộc gọi API Gemini không có trạng thái
- Prompt bao gồm: trình độ người dùng, mục tiêu thi cử, chủ đề hiện tại
- Phản hồi tối ưu cho <80 từ, ví dụ thực tế

### 5.2 Các Thành Phần Hành Vi AI
1. **Kỹ Thuật Prompt** (trong `SYSTEM_PROMPTS.md`):
   - Chế độ Giải Thích: Giải thích khái niệm → Công thức → Ví dụ
   - Chế độ Tình Huống: Mô phỏng hội thoại thực tế, điều chỉnh độ khó

2. **Nhận Thức Bối Cảnh**:
   - Kéo trình độ hiện tại + mục tiêu từ auth context
   - Tham chiếu lịch sử chat gần đây để tiếp tục
   - Truy vấn chủ đề flashcard/quiz liên quan

3. **Chiến Lược Fallback**:
   - Nếu hạn ngạch Gemini hết → phản hồi dựa trên quy tắc mẫu
   - Nếu lỗi → suy giảm dễ dàng (không làm hỏng UX)

### 5.3 Mở Rộng Agentic Trong Tương Lai
- **Lập Kế Hoạch Đa Bước**: AI quyết định việc chat/quiz/flashcard tiếp theo
- **Chuỗi Thích Ứng**: AI đề xuất chuỗi học tập tối ưu
- **Bộ Nhớ**: Hồ sơ học tập người dùng bền vững trong Vector DB
- **Sử Dụng Công Cụ**: AI gọi flashcard-service, quiz-service trực tiếp để điều phối học tập

---

## 6. Cách Ly Microservices & Lợi Ích Low-Code

### 6.1 Tại Sao Microservices Cho MVP?
| Khía Cạnh | Lợi Ích |
|-----------|---------|
| **Mở Rộng Quy Mô** | Mở rộng quy mô AI worker độc lập từ chat |
| **Cách Ly Lỗi** | Auth bị lỗi ≠ Quiz bị lỗi |
| **Song Song Đội** | 1 dev mỗi dịch vụ = ít xung đột merge |
| **Bàn Giao AI** | AI tạo dịch vụ → con người xem xét → dịch vụ tiếp theo |
| **Linh Hoạt Ngôn Ngữ** | Tương lai: trộn Python (ML), Node.js (API), Go (worker) |

### 6.2 Mỗi Dịch Vụ = Ứng Viên Low-Code
Mỗi dịch vụ tuân theo mô hình này:
```
tên-dịch-vụ/
├── src/
│   ├── controllers/ (Express routes)
│   ├── services/    (logic kinh doanh)
│   ├── models/      (lược đồ cơ sở dữ liệu)
│   └── utils/       (trợ giúp, trình xác thực)
├── tests/
├── package.json
├── Dockerfile
└── README.md
```

AI có thể tạo 70% của điều này cho mỗi dịch vụ mới, lập trình viên điền vào logic kinh doanh.

---

## 7. Mô Hình Dữ Liệu (Đơn Giản Hóa)

### 7.1 Bộ Sưu Tập Cốt Lõi
```
users
├─ _id, email, password_hash, google_id, auth_provider
├─ display_name, avatar_url, current_level, target_exam
├─ learning_goals[], favorite_topics[]
└─ onboarding_completed, created_at, updated_at

chat_sessions
├─ _id, user_id, guest_session_id
├─ title, current_mode (knowledge|roleplay), message_count
└─ last_message_at, created_at

chat_messages
├─ _id, session_id, role (user|assistant)
├─ content, tokens_used
└─ created_at

flashcards
├─ _id, user_id, front, back, source_message_id
├─ current_interval (SM-2), next_review_date, ease_factor
└─ created_at, last_reviewed_at

quizzes
├─ _id, user_id, title, questions[], difficulty_level
├─ topic, generated_by (ai|manual)
└─ created_at

quiz_results
├─ _id, user_id, quiz_id, answers[], score, time_spent
└─ attempted_at

progress
├─ _id, user_id
├─ quizzes_completed, flashcards_completed, total_chat_sessions
├─ learned_words_count, streak_days, last_active_date
└─ updated_at
```

---

## 8. Quy Trình Phát Triển (Quy Trình Vibe Coding)

### Tổng Quan Giai Đoạn
| Giai Đoạn | Tuần | Tiêu Điểm | Vai Trò AI | Vai Trò Con Người |
|-----------|------|---------|-----------|------------------|
| 0 | 1-2 | Cơ sở hạ tầng, Docker, DB | Tạo cấu hình Docker | Thiết kế arch, quyết định dịch vụ |
| 1 | 3-4 | Auth Service, JWT, frontend login | Tạo boilerplate, tests | Logic kinh doanh, xem xét bảo mật |
| 2 | 5-7 | Chat AI, tích hợp Gemini | Tạo scaffold dịch vụ, API stubs | Tinh chỉnh prompt, logic streaming |
| 3 | 8-9 | Flashcard + thuật toán SM-2 | Tạo điểm cuối CRUD | Thuật toán cốt lõi, lập lịch |
| 4 | 10-11 | Tạo quiz + chấm điểm | Tạo mẫu câu hỏi | Logic chấm điểm, giải thích |
| 5 | 12 | Xác minh cơ sở dữ liệu, polish | Tạo kịch bản di chuyển | Xác minh tính toàn vẹn dữ liệu |

### Nhịp Độ Phát Triển
1. **Thứ Hai**: Xác định phạm vi tuần, tạo các vấn đề GitHub
2. **Thứ Ba-Tư**: AI tạo dịch vụ + tests (xem xét trong PR)
3. **Thứ Năm**: Kiểm thử tích hợp, sửa lỗi
4. **Thứ Sáu**: Triển khai lên staging, thu thập phản hồi

---

## 9. Tại Sao Dự Án Này Thể Hiện Vibe Coding