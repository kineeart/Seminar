# 🚀 Quy Trình Phát Triển & Giai Đoạn

## Chủ Đề Seminar: Vibe Coding Trong Kỹ Nghệ Phần Mềm

Tài liệu này giải thích cách **Vibe Coding** áp dụng trong dự án **Gia Sư AI Học Tiếng Anh** với chu kỳ phát triển 12 tuần.

---

## 1. "Vibe Coding" Là Gì?

**Vibe Coding** = Phát triển với năng lượng tích cực + cộng tác hiệu quả với AI

### 7 Nguyên Tắc Cốt Lõi
| Nguyên Tắc | Ý Nghĩa | Trong Dự Án |
|-----------|---------|-----------|
| **Tầm Nhìn Rõ Ràng** | Hiểu chung mục tiêu | PRD + User Stories + Wireframes |
| **Thiết Kế Mô-đun** | Các đơn vị độc lập, có thể kiểm thử | Microservices (một dịch vụ = một lĩnh vực) |
| **Cộng Tác AI** | AI viết 60-70% mã dự đoán được | Sinh mã boilerplate, test stubs |
| **Con Người Tập Trung** | Con người xử lý logic kinh doanh + quyết định | Prompts, thuật toán, bảo mật |
| **Lặp Lại Nhanh** | Vòng phản hồi nhanh | 2-tuần phase, số liệu hàng ngày |
| **Tài Liệu Nhúng** | Bối cảnh được bảo tồn trong repo | README, bình luận, PHASE_X_NOTES |
| **Thiết Lập Tái Tạo** | Onboard trong <30 min | Docker Compose, hướng dẫn setup |

---

## 2. Tổng Quan 12 Tuần

```
┌────────────────────────────────────────────────────────────────────┐
│ TUẦN 1-2: GIAI ĐOẠN 0 (Thiết Lập & Cơ Sở Hạ Tầng)                 │
│ Mục Tiêu: Nền Tảng Sẵn Sàng Cho Tất Cả Đội                        │
├────────────────────────────────────────────────────────────────────┤
│ Giao Hàng:                                                         │
│ • Docker Compose (Postgres, Redis, RabbitMQ, MinIO)              │
│ • Dịch vụ cơ sở (Express + health checks)                        │
│ • GitHub Actions templates                                       │
│ • Gói mã dùng chung (types, utils, constants)                   │
│ • Tài liệu thiết lập + hướng dẫn phát triển cục bộ             │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ TUẦN 3-4: GIAI ĐOẠN 1 (Xác Thực)                                  │
│ Mục Tiêu: Truy Cập Người Dùng Bảo Mật + Nền Tảng JWT             │
├────────────────────────────────────────────────────────────────────┤
│ Giao Hàng:                                                         │
│ • auth-service (signup, login, token refresh, profile)           │
│ • API Gateway (xác thực JWT + hạn chế tốc độ)                   │
│ • UI Frontend login/signup + quản lý phiên                      │
│ • Schema PostgreSQL (users, refresh_tokens)                     │
│ • Kiểm thử E2E + bộ sưu tập Postman                            │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ TUẦN 5-7: GIAI ĐOẠN 2 (Chat AI - CỐT LÕI)                         │
│ Mục Tiêu: Vòng Lặp Học Tập Chính (Chat + Streaming)             │
├────────────────────────────────────────────────────────────────────┤
│ Giao Hàng:                                                         │
│ • ai-chat-service (REST + WebSocket)                            │
│ • ai-worker (tích hợp Gemini API, logic fallback)              │
│ • Lưu trữ phiên chat (MongoDB conversations)                    │
│ • UI Frontend chat (streaming, chuyển chế độ)                   │
│ • Mẫu Prompt (chế độ Giải Thích + Tình Huống)                  │
│ • Benchmark: <3s phản hồi                                       │
│ • Giám sát hạn ngạch Gemini + suy giảm dễ dàng                │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ TUẦN 8-9: GIAI ĐOẠN 3 (Hệ Thống Flashcard)                        │
│ Mục Tiêu: Lặp Lại Khoảng Cách (Thuật Toán SM-2)                 │
├────────────────────────────────────────────────────────────────────┤
│ Giao Hàng:                                                         │
│ • flashcard-service (CRUD + SM-2 lịch)                          │
│ • UI Frontend xem xét flashcard (vuốt)                          │
│ • Schema MongoDB (flashcards, flashcard_reviews)                │
│ • Tự động sinh flashcard từ chat (tùy chọn)                    │
│ • Hàng đợi flashcard hàng ngày + theo dõi chuỗi                │
│ • Kiểm thử xác thực thuật toán SM-2                            │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ TUẦN 10-11: GIAI ĐOẠN 4 (Hệ Thống Quiz)                           │
│ Mục Tiêu: Đánh Giá + Tăng Cường Học Tập                         │
├────────────────────────────────────────────────────────────────────┤
│ Giao Hàng:                                                         │
│ • quiz-service (sinh + chấm điểm + giải thích)                 │
│ • Sinh câu hỏi dựa trên Gemini (dựa vào prompt)                │
│ • UI Frontend quiz (trắc nghiệm + text tự do)                  │
│ • Engine chấm điểm + xác thực câu trả lời                       │
│ • Schema MongoDB (quizzes, quiz_results)                        │
│ • Phân tích: điểm yếu, chủ đề đề xuất                           │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ TUẦN 12: GIAI ĐOẠN 5 (Cơ Sở Dữ Liệu + Polish)                     │
│ Mục Tiêu: Lưu Trữ + Sẵn Sàng Sản Xuất                            │
├────────────────────────────────────────────────────────────────────┤
│ Giao Hàng:                                                         │
│ • Thiết Lập MongoDB Atlas + kịch bản di chuyển                   │
│ • Tích hợp tiến độ dịch vụ chéo                                  │
│ • Tổng Hợp Số Liệu Bảng Điều Khiển                              │
│ • Tinh Chỉnh Hiệu Suất (indexing, tối ưu query)                │
│ • Sửa Lỗi + Kiểm Thử E2E Smoke                                  │
│ • Hướng Dẫn Triển Khai (GCP/AWS target)                        │
└────────────────────────────────────────────────────────────────────┘
```

---

## 3. Quy Trình Vibe Coding (Chu Kỳ 2 Tuần)

### 3.1 Mẫu Giai Đoạn

**Thứ Hai (Lập Kế Hoạch)**
```
1. Đồng Bộ Đội: Xem Lại Yêu Cầu Giai Đoạn
2. Phân Tích Thành User Stories → GitHub issues
3. Ai Agent Ước Tính Kích Thước
4. Tạo Skeleton PRs Với Bình Luận TODO
```

**Thứ Ba-Tư (Sinh Mã AI)**
```
1. Lập Trình Viên: Viết Bình Luận PRD Trong Mỗi Issue
2. AI Copilot: Sinh Service Scaffolds
3. Xem Xét PR:
   ✓ Cấu Trúc Mã
   ✓ Test Stubs
   ✓ Tài Liệu
4. Phê Duyệt + Merge → Feature Branch
```

**Thứ Năm (Kiểm Thử Tích Hợp)**
```
1. Khởi Động Docker Compose Cục Bộ
2. E2E Kiểm Thử Hợp Đồng Dịch Vụ
3. Sửa Lỗi Tích Hợp
4. Cập Nhật PHASE_X_NOTES.md Với Phát Hiện
```

**Thứ Sáu (Xem Xét & Triển Khai)**
```
1. Xem Xét Đội: Demo Features Trên Staging
2. Thu Thập Phản Hồi Từ Sản Phẩm
3. Tài Liệu Bài Học Được Học
4. Lập Kế Hoạch Cải Thiện Giai Đoạn Tiếp Theo
```

### 3.2 Mô Hình Trợ Giúp AI

```
LẬP TRÌNH VIÊN
    ↓
    Tạo GitHub Issue:
    "Triển Khai /chat/create điểm cuối
     - Chấp Nhận userId, message
     - Xác Thực JWT
     - Xuất Bản Tới RabbitMQ
     - Trả Lại session_id + job_id"
    ↓
AI COPILOT
    ↓
    Sinh Mã:
    - Express controller + route
    - Service layer logic
    - Error handling middleware
    - Jest test stubs
    - README section
    ↓
LẬP TRÌNH VIÊN
    ↓
    Xem Xét Mã:
    - Logic Kinh Doanh Đúng?
    - Ý Nghĩa Bảo Mật?
    - Cân Nhắc Hiệu Suất?
    ↓
    Nếu OK → Merge
    Nếu Thay Đổi → Bình Luận Phản Hồi → AI Sinh Lại
```

---

## 4. Số Liệu Thành Công Vibe Coding

### Mỗi Giai Đoạn
| Số Liệu | Mục Tiêu | Lý Do |
|---------|--------|-------|
| **Thời Gian Xem Xét Mã** | <2 giờ | Mã AI-generated nên dễ đoán |
| **Bao Phủ Kiểm Thử** | >80% | AI sinh test stubs, con người điền logic |
| **Thời Gian Giao Hàng** | 2 tuần | Vòng phản hồi nhanh xác thực giả định |
| **Tỷ Lệ Lỗi** | <5 mỗi 1000 LOC | Boilerplate AI-generated nên lỗi ít |
| **Sự Hài Lòng Dev** | 4/5 | Quy trình rõ ràng giảm bực tức |

### MVP Tổng Thể
| Số Liệu | Mục Tiêu | Trạng Thái |
|---------|--------|-----------|
| **Mã AI-Generated** | 65-70% | Boilerplate, CRUD, test stubs |
| **Mã Con Người-Viết** | 30-35% | Logic kinh doanh, thuật toán, bảo mật |
| **Thời Gian MVP** | 12 tuần | vs. 20+ tuần phương pháp truyền thống |
| **Khả Năng Tái Sử Dụng Mã** | >60% | Dịch vụ = mẫu copy-paste |

---

## 5. Cách Ly Microservices = Sức Mạnh Vibe Coding

### Tại Sao Mỗi Dịch Vụ Sinh Được Bằng AI

```
✅ Mô Hình Dự Đoán:
   Controller → Service → Repository → DB

✅ Có Thể Kiểm Thử Riêng:
   Mock dịch vụ bên ngoài dễ dàng

✅ Hợp Đồng Rõ Ràng:
   Schema OpenAPI định nghĩa giao diện

✅ Scaffold Tái Tạo:
   Dịch vụ mới = sinh từ mẫu

✅ Phụ Thuộc Tối Thiểu:
   Dịch vụ nói qua HTTP + message queue
```

### Mẫu Dịch Vụ (Sinh Tự Động)
```
dịch-vụ-của-tôi/
├── src/
│   ├── controllers/ (AI sinh: routes + middleware)
│   ├── services/ (AI sinh: business logic stubs)
│   ├── models/ (AI sinh: Mongoose schema)
│   ├── middleware/ (AI sao chép: JWT validation)
│   └── utils/ (AI sao chép: tiện ích chung)
├── tests/ (AI sinh: test stubs)
├── package.json (xác định trước)
├── Dockerfile (mẫu xác định trước)
├── README.md (AI sinh với mô tả dịch vụ)
└── index.js (boilerplate Express)
```

**Kết Quả**: Dịch vụ mới sẵn sàng trong 30 phút vs. 2+ giờ thiết lập thủ công.

---

## 6. Tài Liệu Nhúng = Chuyển Giao Tri Thức

### Mỗi Dịch Vụ Có:

**README.md**
```markdown
## Dịch Vụ Của Tôi

Mục Đích: Giải Thích Tại Sao Dịch Vụ Tồn Tại

### Điểm Cuối
- POST /create → Tạo Tài Nguyên
- GET /:id → Lấy Tài Nguyên
- PATCH /:id → Cập Nhật Tài Nguyên

### Cơ Sở Dữ Liệu
Bộ Sưu Tập: my_resource, my_events

### Message Queue
Xuất Bản: resource.created, resource.updated
Tiêu Thụ: auth.validated

### Phụ Thuộc
- auth-service (xác thực JWT)
- shared/database (kết nối MongoDB)
```

**PHASE_X_NOTES.md** (mỗi giai đoạn)
```markdown
## Giai Đoạn 2 Chat AI - Ghi Chú

Ngày: 2026-05-17

### Hoàn Thành:
- Microservice Express ai-chat-service
- Tích Hợp Gemini API
- Proxy WebSocket Trong Gateway

### Vấn Đề Đã Biết:
- Giới Hạn Hạn Ngạch Gemini Trên Tier Miễn Phí
- Cần Giám Sát Độ Trễ

### Giai Đoạn Tiếp Theo:
- Sinh Flashcard Tự Động
```

**Kết Quả**: Bất Kỳ Lập Trình Viên (hoặc AI) Có Thể Hiểu Trạng Thái Mà Không Cần Cuộc Họp.

---

## 7. Nguyên Tắc Vibe Coding Được Áp Dụng

### 1. **Tuyên Bố Vấn Đề Rõ Ràng**
- **PRD.md**: "Học Tiếng Anh Trong <30 Giây"
- **KHÔNG**: "Xây Dựng LMS"

### 2. **Kiến Trúc Mô-đun**
- Mỗi Dịch Vụ Triển Khai Độc Lập
- Ai Có Thể Làm Việc Trên Dịch Vụ Song Song

### 3. **Thiết Kế Có Thể Kiểm Thử**
- Mocked Gemini API → Kiểm Thử Chạy Nhanh
- MongoDB → Kiểm Thử Tích Hợp Dự Đoán Được

### 4. **Tự Động Hóa Đầu Tiên**
- Docker Compose → Env Phát Triển Tái Tạo
- GitHub Actions → CI/CD Tự Động
- Jest → Khám Phá Kiểm Thử Tự Động

### 5. **Mã Ưu Tiên Con Người**
- Async/Await (Không Gọi Lại)
- Tên Biến Mô Tả (KHÔNG `x`, `y`)
- Bình Luận Trên "Tại Sao" (KHÔNG "Là Gì")

### 6. **Phản Hồi Nhanh**
- Xem Xét Hàng Tuần
- Số Liệu Hàng Ngày (Tỷ Lệ Pass Kiểm Thử, Số Lần Triển Khai)
- Retro Bi-tuần

### 7. **Bảo Tồn Tri Thức**
- Commit Git Chi Tiết
- DEVELOPMENT_LOG.md (Mục Nhập Hàng Ngày)
- PHASE_X_REASONING.md (Tại Sao Quyết Định Được Đưa Ra)

---

## 8. Công Cụ & Công Nghệ Cho Quy Trình Vibe Coding

| Công Cụ | Mục Đích | Trong Dự Án |
|--------|---------|-----------|
| **GitHub** | Kiểm Soát Phiên Bản + Xem Xét Mã | Quy Trình Dựa Trên PR |
| **Docker** | Môi Trường Tái Tạo | docker-compose.yml |
| **Jest** | Kiểm Thử Đơn Vị Nhanh | >80% Mục Tiêu Bao Phủ |
| **GitHub Actions** | CI/CD Tự Động | Lint, Build, Deploy |
| **Postman** | Tài Liệu API + Kiểm Thử | Xuất Sang OpenAPI |
| **draw.io** | Sơ Đồ Kiến Trúc | Tài Liệu Thiết Kế Hệ Thống |
| **MongoDB Atlas** | Cơ Sở Dữ Liệu Được Quản Lý | Lưu Trữ Dữ Liệu Sản Xuất |
| **RabbitMQ** | Hàng Đợi Công Việc Không Đồng Bộ | Tách Cách Dịch Vụ |

---

## 9. Giảm Thiểu Rủi Ro Qua Vibe Coding

### Rủi Ro: "Chất Lượng Mã Giảm Với 70% Sinh Mã AI"
**Giảm Thiểu**:
- AI sinh test stubs → Bao phủ 100% code bắt buộc
- Con người xem xét tất cả logic kinh doanh
- Số liệu theo dõi mỗi giai đoạn

### Rủi Ro: "Đội Mất Bối Cảnh Khi Chuyển Dịch Vụ"
**Giảm Thiểu**:
- Cách ly Microservices → Bối cảnh = một dịch vụ
- PHASE_X_NOTES.md → Chụp trạng thái hàng ngày
- Giai đoạn ngắn 2 tuần → Dễ bắt kịp

### Rủi Ro: "Gemini API Hạn Ngạch Hết"
**Giảm Thiểu**:
- Mẫu fallback dựa trên quy tắc
- Giám sát hạn ngạch + cảnh báo
- Chuyển mô hình (swap gemini sang LLM khác)

### Rủi Ro: "Cổ Chai Cơ Sở Dữ Liệu"
**Giảm Thiểu**:
- Redis caching cho truy vấn thường xuyên
- Chiến lược lập chỉ mục MongoDB được tài liệu
- Kiểm thử tải Giai Đoạn 5

---

## 10. Mở Rộng Sau MVP

### Nếu MVP Thành Công:

**Thêm Dịch Vụ** (Vibe Coding Mở Rộng):
- `recommendation-service` (AI gợi ý chủ đề tiếp theo)
- `analytics-service` (ph漏斗, giữ chân số liệu)
- `payment-service` (tính năng premium)

**Mỗi Dịch Vụ Mới**:
- Sử dụng mẫu scaffold giống nhau
- AI sinh 60% trong 30 phút
- Tích hợp qua message broker
- Tác động tối thiểu tới dịch vụ hiện tại

**Kết Quả**: Thêm tính năng = dịch vụ mới = 1 tuần phát triển vs. 2+ tuần nếu monolithic.

---

## 11. Kết Luận Seminar

> **Vibe Coding KHÔNG phải "không có mã"** — đó là **mã thông minh với cấu trúc rõ ràng**  
> Vì vậy AI có thể sinh dự đoán được, và **con người có thể xem xét tự tin**.

### Tại Sao Dự Án Này Là Vibe Coding Trong Hoạt Động:

✅ **Vấn Đề Kinh Doanh Rõ Ràng** (học tiếng Anh thực tế)  
✅ **Kiến Trúc Mô-đun** (microservices)  
✅ **Cộng Tác AI** (70% AI-generated, 30% con người-viết)  
✅ **Giao Hàng Nhanh** (12 tuần MVP)  
✅ **Tài Liệu Nhúng** (bảo tồn tri thức)  
✅ **Thiết Lập Tái Tạo** (Docker + compose)  
✅ **Có Thể Kiểm Thử Theo Thiết Kế** (Jest + kiểm thử tích hợp)  
✅ **Khả Năng Mở Rộng Đội** (dịch vụ = công việc song song)  

---

## Tham Khảo

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Chi Tiết Kỹ Thuật
- [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md) — Phân Tích Giai Đoạn
- [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) — Tiến Độ Hàng Ngày
- [PHASE_X_NOTES.md](./PHASE_2_AI_CHAT_NOTES.md) — Học Tập Giai Đoạn (ví dụ)
