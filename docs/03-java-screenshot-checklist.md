# Screenshot Checklist - Java Migration Evidence

## 📸 Danh sách hình ảnh cần chụp (16 hình)

### Group 1: Python FastAPI (Chứng minh gốc hoạt động)

#### 1️⃣ Python App Startup
- **Mục đích:** Chứng minh Python app chạy thành công
- **Cách chụp:**
  1. CD vào `complete/python/`
  2. Chạy: `python main.py`
  3. Chụp console output khi "Application startup complete"
- **Lưu:** `docs/images/03-java/01-python-startup.png`
- **Ghi chú:** Hiển thị Uvicorn server đang chạy trên port 8000

#### 2️⃣ Python Swagger UI
- **Mục đích:** Chứng minh contract API gốc
- **Cách chụp:**
  1. Mở: `http://localhost:8000/docs`
  2. Chụp toàn bộ trang (hoặc từng phần)
  3. Nên chụp danh sách endpoint để thấy /api/posts, /api/posts/{postId}/comments, etc.
- **Lưu:** `docs/images/03-java/02-python-swagger-ui.png`
- **Ghi chú:** Swagger UI cơ bản của FastAPI

#### 3️⃣ Python POST API Test (Create Post)
- **Mục đích:** Chứng minh endpoint tạo post hoạt động
- **Cách chụp:**
  1. Từ Swagger UI, mở section POST /api/posts
  2. Nhập: `{"content": "Hello from FastAPI", "username": "test.user"}`
  3. Click "Execute"
  4. Chụp response (201 Created + body)
- **Lưu:** `docs/images/03-java/03-python-post-test.png`
- **Ghi chú:** Hiển thị response JSON có id, content, username, created_at

#### 4️⃣ Python GET API Test (List Posts)
- **Mục đích:** Chứng minh endpoint lấy danh sách hoạt động
- **Cách chụp:**
  1. Từ Swagger UI, mở section GET /api/posts
  2. Click "Execute"
  3. Chụp response (200 + array of posts)
- **Lưu:** `docs/images/03-java/04-python-get-posts.png`
- **Ghi chú:** Hiển thị danh sách bài viết vừa tạo

#### 5️⃣ Python Database (SQLite Query)
- **Mục đích:** Chứng minh dữ liệu lưu trữ đúng
- **Cách chụp:**
  1. Mở SQLite Browser (hoặc DBeaver)
  2. Mở file `complete/python/sns_api.db`
  3. Query: `SELECT * FROM post LIMIT 5`
  4. Chụp kết quả
- **Lưu:** `docs/images/03-java/05-python-database-posts.png`
- **Ghi chú:** Hiển thị structure: id, content, username, created_at, updated_at

---

### Group 2: Java Spring Boot (Chứng minh migrate thành công)

#### 6️⃣ Java App Startup Log
- **Mục đích:** Chứng minh Java app chạy thành công
- **Cách chụp:**
  1. CD vào `java/socialapp-mvn/`
  2. Chạy: `.\mvnw spring-boot:run`
  3. Chụp console khi "Tomcat started on port 8080"
  4. Nên chụp khoảng 5-10 dòng cuối cùng
- **Lưu:** `docs/images/03-java/06-java-startup.png`
- **Ghi chú:** Hiển thị Tomcat khởi động và app ready

#### 7️⃣ Java Swagger UI - Full Page
- **Mục đích:** Chứng minh contract API được bảo tồn
- **Cách chụp:**
  1. Mở: `http://localhost:8080/swagger-ui.html`
  2. Chụp toàn bộ trang (scroll nếu cần)
  3. Hoặc chụp từng section (POST /api/posts, comments, likes)
- **Lưu:** `docs/images/03-java/07-java-swagger-full.png`
- **Ghi chú:** So sánh với Python Swagger - struktur endpoint phải giống

#### 8️⃣ Java Swagger UI - POST Endpoint Detail
- **Mục đích:** Chứng minh request/response schema
- **Cách chụp:**
  1. Từ Swagger UI, mở section POST /api/posts
  2. Chụp "Request body", "Responses", "Schema"
  3. Nên thấy NewPostRequest với fields: content, username
- **Lưu:** `docs/images/03-java/08-java-swagger-post-detail.png`
- **Ghi chú:** Hiển thị schema validations

#### 9️⃣ Java POST API Test (Create Post)
- **Mục đích:** Chứng minh endpoint hoạt động giống Python
- **Cách chụp:**
  1. Từ Swagger UI, click "Try it out" trên POST /api/posts
  2. Nhập: `{"content": "Hello from Java Spring Boot", "username": "copilot.assistant"}`
  3. Click "Execute"
  4. Chụp response (201 + body)
- **Lưu:** `docs/images/03-java/09-java-post-test.png`
- **Ghi chú:** Response phải giống Python (id, content, username, created_at)

#### 🔟 Java GET API Test (List Posts)
- **Mục đích:** Chứng minh endpoint lấy danh sách giống Python
- **Cách chụp:**
  1. Từ Swagger UI, click "Try it out" trên GET /api/posts
  2. Click "Execute"
  3. Chụp response (200 + array)
- **Lưu:** `docs/images/03-java/10-java-get-posts.png`
- **Ghi chú:** Hiển thị danh sách, so sánh format với Python

#### 1️⃣1️⃣ Java Comment Endpoint - Create Comment
- **Mục đích:** Chứng minh nested endpoint hoạt động
- **Cách chụp:**
  1. Post ID từ bước trước (ví dụ: 1)
  2. Từ Swagger UI, click "Try it out" trên POST /api/posts/{postId}/comments
  3. Nhập postId=1, body: `{"content": "Nice post!", "username": "user2"}`
  4. Click "Execute", chụp response
- **Lưu:** `docs/images/03-java/11-java-comment-create.png`
- **Ghi chú:** Chứng minh relationship Post-Comment hoạt động

#### 1️⃣2️⃣ Java Like Endpoint - Add Like
- **Mục đích:** Chứng minh like functionality hoạt động
- **Cách chụp:**
  1. Post ID từ bước trước (ví dụ: 1)
  2. Từ Swagger UI, click "Try it out" trên POST /api/posts/{postId}/likes
  3. Nhập postId=1, body: `{"username": "user3"}`
  4. Click "Execute", chụp response
- **Lưu:** `docs/images/03-java/12-java-like-add.png`
- **Ghi chú:** Chứng minh relationship Post-Like hoạt động

#### 1️⃣3️⃣ Java GET Post with Related Data
- **Mục đích:** Chứng minh post đầy đủ với comments, likes
- **Cách chụp:**
  1. Từ bước trước, chúng ta có Post ID=1 với comment và like
  2. Từ Swagger UI, click "Try it out" trên GET /api/posts/{postId}
  3. Nhập postId=1, click "Execute"
  4. Chụp response (POST object + nested comments + likeCount)
- **Lưu:** `docs/images/03-java/13-java-get-post-full.png`
- **Ghi chú:** Hiển thị structure đầy đủ

#### 1️⃣4️⃣ Java Database (SQLite Query) - Posts
- **Mục đích:** Chứng minh dữ liệu Java lưu đúng giống Python
- **Cách chụp:**
  1. Mở SQLite Browser (hoặc DBeaver)
  2. Mở file `java/socialapp-mvn/sns_api.db`
  3. Query: `SELECT * FROM post LIMIT 5`
  4. Chụp kết quả (so sánh schema với Python)
- **Lưu:** `docs/images/03-java/14-java-database-posts.png`
- **Ghi chú:** Schema phải giống Python

#### 1️⃣5️⃣ Java Database - Comments & Relationship
- **Mục đích:** Chứng minh foreign key, relationship hoạt động
- **Cách chụp:**
  1. Từ SQLite Browser
  2. Query: `SELECT * FROM comment WHERE post_id = 1`
  3. Chụp kết quả
- **Lưu:** `docs/images/03-java/15-java-database-comments.png`
- **Ghi chú:** Hiển thị post_id FK

#### 1️⃣6️⃣ Java Database - Complete Schema Overview
- **Mục đích:** Chứng minh 3 tables + relationships
- **Cách chụp:**
  1. Từ SQLite Browser, xem schema (ERD view nếu có)
  2. Hoặc chạy query: `SELECT name FROM sqlite_master WHERE type='table'`
  3. Chụp danh sách tables: post, comment, like
- **Lưu:** `docs/images/03-java/16-java-database-schema.png`
- **Ghi chú:** Chứng minh 3 tables đều tồn tại

---

## 📋 Checklist để theo dõi

### Python Evidence (5 hình)
- [ ] 01 - Python App Startup
- [ ] 02 - Python Swagger UI
- [ ] 03 - Python POST Test
- [ ] 04 - Python GET Test
- [ ] 05 - Python Database

### Java Evidence (11 hình)
- [ ] 06 - Java App Startup
- [ ] 07 - Java Swagger Full Page
- [ ] 08 - Java Swagger POST Detail
- [ ] 09 - Java POST Test
- [ ] 10 - Java GET Test
- [ ] 11 - Java Comment Test
- [ ] 12 - Java Like Test
- [ ] 13 - Java GET Full Post
- [ ] 14 - Java Database Posts
- [ ] 15 - Java Database Comments
- [ ] 16 - Java Database Schema

---

## 🎬 Thứ tự chụp hình (thực hành)

**Lần 1: Chuẩn bị Python**
```bash
# Terminal 1: Run Python
cd complete/python
python main.py
# Chụp: #01, #02, #03, #04, #05
```

**Lần 2: Chuyển sang Java**
```bash
# Terminal 2: Run Java (giữ Python chạy nếu muốn so sánh)
cd java/socialapp-mvn
.\mvnw spring-boot:run
# Chụp: #06, #07, #08, #09, #10, #11, #12, #13
```

**Lần 3: Database Evidence**
```bash
# Mở SQLite Browser
# So sánh Python và Java database
# Chụp: #14, #15, #16
```

---

## ⚠️ Ghi chú quan trọng

1. **Port khác nhau:**
   - Python: `http://localhost:8000` (Uvicorn)
   - Java: `http://localhost:8080` (Tomcat)

2. **Database files:**
   - Python: `complete/python/sns_api.db`
   - Java: `java/socialapp-mvn/sns_api.db`
   - Chúng là những file khác nhau, bạn cần chụp cả hai

3. **Request format giống nhau:**
   - Content, username fields phải giống
   - Response format phải giống (id, created_at, updated_at, etc.)

4. **Timing:**
   - Chụp hình tối thiểu 30 phút
   - Chọn múi giờ/timezone để hiển thị created_at

---

**Tổng cộng: 16 hình ảnh minh chứng → Nộp cùng báo cáo**
