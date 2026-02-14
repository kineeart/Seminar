## BÁO CÁO BÀI TẬP 1 – VIBE COPILOT  
## PHẦN 02: JAVASCRIPT FRONTEND DEVELOPMENT

**Môn học**: …  
**Giảng viên**: …  
**Sinh viên**: … – **MSSV**: …  
**Lớp**: …  
**Thời gian thực hiện**: …

> Gợi ý: Khi nộp chính thức, bạn có thể xuất file `.md` này sang PDF.

---

## Mục lục

1. [Giới thiệu & Mục tiêu](#giới-thiệu--mục-tiêu)  
2. [Công nghệ & Công cụ sử dụng](#công-nghệ--công-cụ-sử-dụng)  
3. [Phương pháp & Quy trình thực hiện](#phương-pháp--quy-trình-thực-hiện)  
4. [Thiết kế hệ thống theo 3 mức Ý tưởng – Luận lý – Vật lý](#thiết-kế-hệ-thống-theo-3-mức-ý-tưởng--luận-lý--vật-lý)  
5. [Triển khai chi tiết](#triển-khai-chi-tiết)  
6. [Kết quả & Đánh giá](#kết-quả--đánh-giá)  
7. [Kết luận & Bài học kinh nghiệm](#kết-luận--bài-học-kinh-nghiệm)  
8. [Nhật ký làm việc & Tổ chức mã nguồn](#nhật-ký-làm-việc--tổ-chức-mã-nguồn)

---

## Giới thiệu & Mục tiêu

### Bối cảnh bài toán

Contoso là một công ty kinh doanh các sản phẩm phục vụ hoạt động ngoài trời. Bộ phận marketing của Contoso muốn xây dựng một **micro social media website** để:
- Giới thiệu sản phẩm tới khách hàng hiện tại và tiềm năng.
- Tạo không gian để người dùng chia sẻ trải nghiệm, hình ảnh, và phản hồi.

Trong phần **02 – JavaScript Frontend Development**, vai trò của sinh viên là:
- Đóng vai trò **frontend developer** sử dụng **JavaScript/TypeScript với React**.
- Xây dựng ứng dụng web React giao tiếp với backend **FastAPI (Python)** thông qua các API được mô tả trong `openapi.yaml`.



### Mục tiêu của phần 02

- **Xây dựng** một ứng dụng web React (dùng Vite) tên `SimpleSocialMediaApplication` chạy tại `http://localhost:3000`.
- **Kết nối** ứng dụng frontend tới backend FastAPI chạy tại `http://localhost:8000` thông qua các endpoint trong `openapi.yaml`.
- **Sử dụng thiết kế UI từ Figma** (thông qua Figma MCP server) để triển khai các màn hình:
  - `Home`
  - `Search`
  - `Post Details`
  - `Post Modal`
  - `Name Input Modal`
- **Tuân thủ chuẩn OpenAPI**:
  - Không thêm trường dữ liệu ngoài những gì đã định nghĩa trong `openapi.yaml`.
  - Không chỉnh sửa nội dung `openapi.yaml`.
- **Xử lý lỗi backend**:
  - Hiển thị **chỉ báo trực quan** khi backend API không khả dụng (mất kết nối, lỗi server, port sai…).

---

## Công nghệ & Công cụ sử dụng

### Ngôn ngữ & Framework

- **JavaScript / TypeScript**: Ngôn ngữ chính cho frontend.
- **React**: Thư viện xây dựng giao diện UI theo hướng component.
- **ViteJS**: Công cụ scaffold và dev server cho ứng dụng React, giúp:
  - Khởi động nhanh.
  - Hỗ trợ hot reload trong quá trình phát triển.

### Backend & Chuẩn giao tiếp

- **FastAPI** (Python): Backend REST API, chạy tại `http://localhost:8000`.
- **OpenAPI (`openapi.yaml`)**:
  - **Phiên bản**: OpenAPI 3.0.1
  - **Tiêu đề**: Simple Social Media API v1.0.0
  - **Mô tả**: API cho phép người dùng tạo, xem, cập nhật, xóa bài viết; thêm bình luận; và like/unlike bài viết.
  - **Server**: `http://localhost:8080/api` (theo spec, nhưng trong thực tế backend chạy tại port 8000).
  - **Tags**: Posts, Comments, Likes
  - Mô tả toàn bộ endpoint, kiểu dữ liệu request/response.
  - Là hợp đồng giao tiếp giữa frontend và backend.



### Thiết kế UI & AI trợ lý

- **Figma**: Công cụ thiết kế giao diện, sử dụng template:
  - Link template: *(ghi lại link Figma được sử dụng trong bài)*.
- **Framelink Figma MCP server**:
  - MCP server kết nối GitHub Copilot với Figma, cho phép sinh code UI từ thiết kế Figma.
- **GitHub Copilot (Agent Mode)**:
  - Tự động gợi ý code.
  - Hỗ trợ đọc `openapi.yaml`, `product-requirements.md` và Figma để sinh component.
  - Hỗ trợ scaffold và chỉnh sửa cấu trúc project.

### Quản lý mã nguồn & Môi trường dev

- **Git & GitHub**: Lưu trữ, quản lý phiên bản, và ghi nhận nhật ký công việc.
- **Node.js & npm**: Cài đặt dependencies và chạy ứng dụng React.

---

## Phương pháp & Quy trình thực hiện

### Phương pháp tiếp cận

Bài tập được triển khai theo **quy trình từ trên xuống (top-down)**:

1. **Xác định yêu cầu & mục tiêu** (từ tài liệu `docs/02-javascript.md`, `product-requirements.md`, `openapi.yaml`).
2. **Thiết kế hệ thống ở 3 mức**:
   - Mức **Ý tưởng (Conceptual)**: chức năng tổng quát.
   - Mức **Luận lý (Logical)**: mô hình dữ liệu, luồng xử lý, component logic.
   - Mức **Vật lý (Physical)**: kiến trúc triển khai thực tế (port, thư mục, file).
3. **Scaffold project React bằng Vite** và thiết lập cấu trúc thư mục.
4. **Tích hợp Figma + Copilot** để sinh và điều chỉnh UI components.
5. **Tích hợp API backend** dựa trên `openapi.yaml`, đảm bảo đúng schema.
6. **Xử lý lỗi backend**, thêm thông báo trực quan cho người dùng.
7. **Kiểm thử**, hoàn thiện UI/UX và commit/push lên GitHub.



### Quá trình làm việc thực tế (trích từ `docs/hanhtrinhlam.txt`)

Dựa trên file `docs/hanhtrinhlam.txt` – là nhật ký làm việc khi trao đổi với AI để triển khai phần 2 – quá trình thực hiện thực tế diễn ra theo các bước chính sau:

- **Bước 1 – Làm rõ phạm vi & yêu cầu nộp bài**:
  - Xác định rõ phạm vi được giao là **phần 2 – JavaScript Frontend**, nộp kèm **báo cáo, slide, mã nguồn, file ZIP `BT1_VibeCopiplot_HoTen_MaSV.zip`**.
  - Làm rõ yêu cầu về **phương pháp luận 3 mức (ý tưởng, luận lý, vật lý)** và **nhật ký làm việc nhóm trên GitHub**.

- **Bước 2 – Chuẩn bị và chạy backend FastAPI**:
  - Thử cài `fastapi` và `uvicorn` trực tiếp bằng `pip` nhưng gặp lỗi **`externally-managed-environment` (PEP 668)**.
  - Giải pháp: tạo **virtual environment** riêng trong thư mục `complete/python/venv`, sau đó:
    - Kích hoạt venv.
    - Chạy `pip install fastapi uvicorn`.
  - Khi chạy `uvicorn main:app --reload` lần đầu, gặp lỗi **`ModuleNotFoundError: No module named 'yaml'` do trong `main.py` có `import yaml` nhưng chưa cài `PyYAML`.
  - Khắc phục bằng cách cài thêm `pyyaml` trong venv: `pip install pyyaml`.
  - Sau khi cài đủ, backend chạy ổn định với log: `Application startup complete. Uvicorn running on http://127.0.0.1:8000`.

- **Bước 3 – Kiểm tra API bằng Swagger & xử lý 404**:
  - Khi truy cập `/` trả về **404 Not Found**, phân tích và hiểu đây là hành vi bình thường vì backend chỉ cung cấp API, không có route `/`.
  - Kiểm tra đúng bằng cách mở **Swagger UI** tại `/docs` và **OpenAPI JSON** tại `/openapi.json`, xác nhận backend đã chạy và spec phù hợp.

- **Bước 4 – Làm việc trong GitHub Codespaces & domain `.app.github.dev`**:
  - Ghi nhận việc truy cập `http://localhost:8000` trong Codespaces tự động được chuyển hướng thành domain dạng  
    `https://<tên-codespace>-8000.app.github.dev/`.
  - Kiểm tra **tab PORTS** để đảm bảo **port 8000 đặt là Public**, tránh lỗi 401 khi frontend gọi API.
  - Rút ra kết luận: khi chạy trong Codespaces, **frontend nên gọi API qua URL public này**, thay vì `http://localhost:8000`.

- **Bước 5 – Chuẩn bị cho phần frontend React & Copilot**:
  - Sau khi backend ổn định, bắt đầu chuyển sang bước scaffold React app bằng Vite trong thư mục `javascript/` và chuẩn bị:
    - **GitHub Copilot Agent Mode** với MCP servers (`context7`, `Framelink Figma MCP`).
    - Figma design template và 5 link section.
    - Thêm `openapi.yaml` và `product-requirements.md` vào context của Copilot.

- **Bước 6 – Sinh báo cáo và tài liệu**:
  - Dựa trên tất cả các bước trên, cùng với log chi tiết trong `docs/hanhtrinhlam.txt`, sử dụng AI để:
    - Xây dựng khung báo cáo theo chuẩn 3 mức (ý tưởng – luận lý – vật lý).
    - Tạo file `docs/baocao.md` làm nền tảng xuất sang PDF.

### Tóm tắt quy trình thực hiện (dựa trên `docs/02-javascript.md`)

1. **Kiểm tra GitHub Copilot Agent Mode** và chọn model `GPT-4.1` hoặc `Claude Sonnet 4`.
2. **Chuẩn bị custom instructions**:
   - Sao chép nội dung từ `docs/custom-instructions/javascript/` vào thư mục `.github/`.
3. **Scaffold dự án React với Vite**:
   - Tên project: `SimpleSocialMediaApplication`.
   - Port chạy: `3000`.
4. **Chuẩn bị Figma MCP server**:
   - Cấu hình MCP.
   - Lấy Figma Personal Access Token.
5. **Lấy link 5 section Figma**:
   - `Home`
   - `Search`
   - `Post Details`
   - `Post Modal`
   - `Name Input Modal`
6. **Chuẩn bị backend FastAPI**:
   - Chạy backend tại thư mục `python` trên port `8000`.
7. **Build các UI components từ Figma**:
   - Dùng Copilot với từng link section Figma để sinh UI tương ứng.
8. **Tích hợp API theo `openapi.yaml`**:
   - Đọc spec.
   - Gọi đúng method, path, body, response schema.
9. **Xử lý trạng thái backend không khả dụng**:
   - Thông báo lỗi, giao diện thân thiện.
10. **Chạy và kiểm tra ứng dụng**:
    - `npm run dev` cho frontend.
    - Test ở `http://localhost:3000`.

---

## Thiết kế hệ thống theo 3 mức Ý tưởng – Luận lý – Vật lý

### 1. Mức Ý tưởng (Conceptual Level)

#### 1.1. Các chức năng chính

Hệ thống micro social media đáp ứng các chức năng cơ bản sau:

- **Quản lý người dùng đơn giản**:
  - Nhập tên người dùng thông qua `Name Input Modal`.
  - Lưu tên để gắn với các bài đăng.

- **Quản lý bài viết (Post)**:
  - **Xem danh sách bài đăng** trên trang `Home`.
  - **Tìm kiếm bài viết** theo từ khóa trên màn hình `Search`.
  - **Xem chi tiết bài viết** trên `Post Details`.
  - **Tạo bài viết mới** qua `Post Modal`.

- **Tương tác với backend**:
  - Lấy danh sách bài viết từ API.
  - Gửi bài viết mới lên backend.
  - Xử lý thông báo khi backend lỗi.

#### 1.2. Đối tượng chính (Conceptual Objects)

- **Người dùng (User)**: chủ yếu là tên hiển thị.
- **Bài viết (Post)**: nội dung, tiêu đề, tác giả, thời gian tạo, tag…
- **Tìm kiếm (Search Criteria)**: từ khóa, có thể kèm filter sau này.

---

### 2. Mức Luận lý (Logical Level)

#### 2.1. Mô hình dữ liệu (theo `openapi.yaml`)

Dựa trên `openapi.yaml`, mô hình dữ liệu được định nghĩa như sau:

**Schema `Post`** (Response khi lấy bài viết):
- `id` (string, UUID, required): Định danh duy nhất của bài viết.
- `username` (string, 1-50 ký tự, required): Tên người dùng tác giả.
- `content` (string, 1-2000 ký tự, required): Nội dung bài viết.
- `createdAt` (string, date-time, required): Thời điểm tạo bài viết.
- `updatedAt` (string, date-time, required): Thời điểm cập nhật lần cuối.
- `likesCount` (integer, ≥0, required): Số lượng lượt thích.
- `commentsCount` (integer, ≥0, required): Số lượng bình luận.

**Schema `NewPostRequest`** (Request khi tạo bài mới):
- `username` (string, 1-50 ký tự, required): Tên người dùng tác giả.
- `content` (string, 1-2000 ký tự, required): Nội dung bài viết.

**Schema `UpdatePostRequest`** (Request khi cập nhật bài viết):
- `username` (string, 1-50 ký tự, required): Tên người dùng (để xác thực).
- `content` (string, 1-2000 ký tự, required): Nội dung đã cập nhật.

**Schema `Comment`** (Response khi lấy bình luận):
- `id` (string, UUID, required): Định danh duy nhất của bình luận.
- `postId` (string, UUID, required): ID của bài viết chứa bình luận này.
- `username` (string, 1-50 ký tự, required): Tên người dùng tác giả bình luận.
- `content` (string, 1-1000 ký tự, required): Nội dung bình luận.
- `createdAt` (string, date-time, required): Thời điểm tạo bình luận.
- `updatedAt` (string, date-time, required): Thời điểm cập nhật lần cuối.

**Schema `NewCommentRequest`** (Request khi tạo bình luận):
- `username` (string, 1-50 ký tự, required): Tên người dùng tác giả.
- `content` (string, 1-1000 ký tự, required): Nội dung bình luận.

**Schema `LikeRequest`** (Request khi like bài viết):
- `username` (string, 1-50 ký tự, required): Tên người dùng thực hiện like.

**Schema `LikeResponse`** (Response khi like thành công):
- `postId` (string, UUID, required): ID của bài viết được like.
- `username` (string, required): Tên người dùng đã like.
- `likedAt` (string, date-time, required): Thời điểm like.

**Schema `Error`** (Response khi có lỗi):
- `error` (string, required): Mã lỗi (ví dụ: "VALIDATION_ERROR", "NOT_FOUND", "INTERNAL_ERROR").
- `message` (string, required): Thông báo lỗi dễ hiểu.
- `details` (array of string, optional): Chi tiết bổ sung về lỗi.

#### 2.2. Cấu trúc component React

Một cấu trúc component logic điển hình:

- **`App`**
  - Router điều hướng giữa các trang.
  - Quản lý trạng thái chung như thông tin người dùng.

- **Trang `HomePage`**
  - `PostList`: hiển thị danh sách bài.
  - `PostItem`: hiển thị từng bài trong list.

- **Trang `SearchPage`**
  - `SearchBar`: nhập từ khóa tìm kiếm.
  - `SearchResults`: hiển thị kết quả.

- **Trang `PostDetailsPage`**
  - `PostDetails`: hiển thị nội dung chi tiết của bài.

- **`PostModal`**
  - Form tạo bài viết mới.

- **`NameInputModal`**
  - Form nhập tên người dùng.

#### 2.3. Luồng xử lý chính (Sequence Logic)

Ví dụ 1 – **Luồng "Xem danh sách bài viết"**:
1. Người dùng truy cập `Home`.
2. Component `HomePage` mount → gọi API `GET /posts` (theo `openapi.yaml`).
3. Backend FastAPI trả về danh sách `Post[]` (mỗi `Post` chứa: `id`, `username`, `content`, `createdAt`, `updatedAt`, `likesCount`, `commentsCount`).
4. Frontend cập nhật state, render `PostList`.
5. Người dùng click vào một bài → điều hướng sang `PostDetailsPage` với `postId`.

Ví dụ 2 – **Luồng "Tạo bài viết mới"**:
1. Người dùng mở `PostModal`.
2. Nhập `username` (từ `NameInputModal` đã lưu) và `content` (1-2000 ký tự).
3. Frontend gọi API `POST /posts` với body `NewPostRequest`:
   ```json
   {
     "username": "john_doe",
     "content": "Just had an amazing hike in the mountains! #outdoorlife"
   }
   ```
4. Backend xác thực, lưu trữ, trả về `Post` đã tạo (status `201`).
5. Frontend đóng modal, cập nhật danh sách bài hoặc reload.

Ví dụ 3 – **Luồng "Xem chi tiết bài viết và bình luận"**:
1. Người dùng click vào một bài từ `Home` → điều hướng sang `PostDetailsPage`.
2. Component `PostDetailsPage` mount → gọi đồng thời:
   - `GET /posts/{postId}` để lấy chi tiết bài viết.
   - `GET /posts/{postId}/comments` để lấy danh sách bình luận.
3. Backend trả về `Post` và mảng `Comment[]`.
4. Frontend render `PostDetails` và `CommentList`.

Ví dụ 4 – **Luồng "Like bài viết"**:
1. Người dùng click nút "Like" trên một bài viết.
2. Frontend gọi API `POST /posts/{postId}/likes` với body:
   ```json
   {
     "username": "john_doe"
   }
   ```
3. Backend trả về `LikeResponse` (status `201`).
4. Frontend cập nhật `likesCount` của bài viết trong state.

---

### 3. Mức Vật lý (Physical Level)

#### 3.1. Kiến trúc triển khai

- **Client**: Web browser (Chrome, Edge, …).
- **Frontend**:
  - Ứng dụng React (Vite) chạy tại `http://localhost:3000`.
- **Backend**:
  - FastAPI (Python) chạy tại `http://localhost:8000`.
- **Giao tiếp**:
  - HTTP/REST theo spec `openapi.yaml`.
  - Có thể cần cấu hình CORS (tùy backend).

#### 3.2. Cấu trúc thư mục dự án (gợi ý)

```text
BT1_VibeCopiplot_HoTen_MaSV/
  ├─ javascript/
  │   └─ SimpleSocialMediaApplication/
  │       ├─ src/
  │       │   ├─ components/
  │       │   │   ├─ PostList.tsx
  │       │   │   ├─ PostItem.tsx
  │       │   │   ├─ PostModal.tsx
  │       │   │   ├─ NameInputModal.tsx
  │       │   │   └─ ...
  │       │   ├─ pages/
  │       │   │   ├─ HomePage.tsx
  │       │   │   ├─ SearchPage.tsx
  │       │   │   └─ PostDetailsPage.tsx
  │       │   ├─ api/
  │       │   │   └─ postsApi.ts
  │       │   └─ main.tsx / App.tsx
  │       └─ ...
  ├─ python/ (backend FastAPI hoặc link đến repo mẫu)
  ├─ docs/
  │   ├─ BaoCao_BT1_VibeCopilot_HoTen_MaSV.md
  │   └─ Slide_BT1_VibeCopilot_HoTen_MaSV.pptx (export)
  └─ WORKLOG.md
```

---

## Triển khai chi tiết

### 5.1. Chuẩn bị và chạy backend FastAPI (theo `docs/hanhtrinhlam.txt`)

Mặc dù phần 2 tập trung vào frontend, nhưng việc chuẩn bị backend đúng cách là tiền đề quan trọng để frontend có thể gọi API chính xác. Quá trình triển khai backend trong workshop diễn ra như sau:

- **Tạo và sử dụng virtual environment**:
  - Do môi trường Python trong Codespaces được quản lý bên ngoài (PEP 668), không thể `pip install` trực tiếp, nên tạo venv:
    - `python3 -m venv complete/python/venv`
    - `source complete/python/venv/bin/activate`
  - Cài đặt các gói cần thiết: `pip install fastapi uvicorn pyyaml`.

- **Cấu hình `main.py`**:
  - Đảm bảo tồn tại file `complete/python/main.py` với ít nhất:
    - Khởi tạo `app = FastAPI()`.
    - Định nghĩa một số route theo spec trong `openapi.yaml`.

- **Chạy server và xử lý lỗi**:
  - Chạy lệnh: `uvicorn main:app --reload --port 8000`.
  - Khắc phục lỗi thiếu module `yaml` bằng cách cài `pyyaml` (theo log trong `docs/hanhtrinhlam.txt`).

- **Truy cập backend trong Codespaces**:
  - Kiểm tra log:
    - `Uvicorn running on http://127.0.0.1:8000`
    - `Application startup complete.`
  - Truy cập Swagger tại `/docs` trên domain dạng  
    `https://<tên-codespace>-8000.app.github.dev/docs`.
  - Đảm bảo port 8000 ở trạng thái **Public** trong tab PORTS để frontend có thể gọi được.

### 5.2. Tạo dự án React với Vite

- Sử dụng GitHub Copilot Agent Mode hoặc CLI để scaffold:
  - Tên project: `SimpleSocialMediaApplication`.
  - Chạy ở port `3000`.
- Cấu hình cơ bản:
  - Cài đặt dependencies: `npm install`.
  - Chạy dev server: `npm run dev`.

### 5.3. Tích hợp Figma MCP server

Các bước chính:
1. Cấu hình MCP servers theo tài liệu `docs/00-setup.md`.
2. Khởi động **Framelink Figma MCP** từ Command Palette.
3. Nhập Figma PAT.
4. Mở file thiết kế Figma, lấy link 5 section:
   - `Home`
   - `Search`
   - `Post Details`
   - `Post Modal`
   - `Name Input Modal`
5. Sử dụng Copilot với từng link để:
   - Sinh code UI component tương ứng.
   - Đảm bảo UI bám sát layout, màu sắc, spacing trong Figma.

### 5.4. Tích hợp API từ `openapi.yaml`

- Thêm `openapi.yaml` và `product-requirements.md` vào context cho Copilot.
- Phân tích `openapi.yaml` để:
  - Liệt kê các endpoint cần dùng.
  - Xác định chính xác schema dữ liệu.

**Danh sách các endpoint trong `openapi.yaml`**:

**1. Quản lý Bài viết (Posts)**:
- `GET /posts` - Lấy danh sách tất cả bài viết
  - Response: `200` - Mảng `Post[]`, `500` - InternalServerError
- `POST /posts` - Tạo bài viết mới
  - Request body: `NewPostRequest` (username, content)
  - Response: `201` - `Post`, `400` - BadRequest, `500` - InternalServerError
- `GET /posts/{postId}` - Lấy chi tiết một bài viết
  - Path parameter: `postId` (UUID)
  - Response: `200` - `Post`, `404` - NotFound, `500` - InternalServerError
- `PATCH /posts/{postId}` - Cập nhật bài viết
  - Path parameter: `postId` (UUID)
  - Request body: `UpdatePostRequest` (username, content)
  - Response: `200` - `Post`, `400` - BadRequest, `404` - NotFound, `500` - InternalServerError
- `DELETE /posts/{postId}` - Xóa bài viết
  - Path parameter: `postId` (UUID)
  - Response: `204` - No Content, `404` - NotFound, `500` - InternalServerError

**2. Quản lý Bình luận (Comments)**:
- `GET /posts/{postId}/comments` - Lấy danh sách bình luận của một bài viết
  - Path parameter: `postId` (UUID)
  - Response: `200` - Mảng `Comment[]`, `404` - NotFound, `500` - InternalServerError
- `POST /posts/{postId}/comments` - Tạo bình luận mới
  - Path parameter: `postId` (UUID)
  - Request body: `NewCommentRequest` (username, content)
  - Response: `201` - `Comment`, `400` - BadRequest, `404` - NotFound, `500` - InternalServerError
- `GET /posts/{postId}/comments/{commentId}` - Lấy chi tiết một bình luận
  - Path parameters: `postId` (UUID), `commentId` (UUID)
  - Response: `200` - `Comment`, `404` - NotFound, `500` - InternalServerError
- `PATCH /posts/{postId}/comments/{commentId}` - Cập nhật bình luận
  - Path parameters: `postId` (UUID), `commentId` (UUID)
  - Request body: `UpdateCommentRequest` (username, content)
  - Response: `200` - `Comment`, `400` - BadRequest, `404` - NotFound, `500` - InternalServerError
- `DELETE /posts/{postId}/comments/{commentId}` - Xóa bình luận
  - Path parameters: `postId` (UUID), `commentId` (UUID)
  - Response: `204` - No Content, `404` - NotFound, `500` - InternalServerError

**3. Quản lý Like (Likes)**:
- `POST /posts/{postId}/likes` - Like một bài viết
  - Path parameter: `postId` (UUID)
  - Request body: `LikeRequest` (username)
  - Response: `201` - `LikeResponse`, `400` - BadRequest, `404` - NotFound, `500` - InternalServerError
- `DELETE /posts/{postId}/likes` - Unlike một bài viết
  - Path parameter: `postId` (UUID)
  - Response: `204` - No Content, `404` - NotFound, `500` - InternalServerError

**Triển khai module API** (ví dụ `src/api/postsApi.ts`):
- Hàm `getPosts()` - Gọi `GET /posts` để lấy danh sách bài viết.
- Hàm `getPostById(postId: string)` - Gọi `GET /posts/{postId}` để lấy chi tiết.
- Hàm `createPost(username: string, content: string)` - Gọi `POST /posts` để tạo bài mới.
- Hàm `updatePost(postId: string, username: string, content: string)` - Gọi `PATCH /posts/{postId}`.
- Hàm `deletePost(postId: string)` - Gọi `DELETE /posts/{postId}`.
- Hàm `getComments(postId: string)` - Gọi `GET /posts/{postId}/comments`.
- Hàm `createComment(postId: string, username: string, content: string)` - Gọi `POST /posts/{postId}/comments`.
- Hàm `likePost(postId: string, username: string)` - Gọi `POST /posts/{postId}/likes`.
- Hàm `unlikePost(postId: string)` - Gọi `DELETE /posts/{postId}/likes`.

**Yêu cầu**:
- **Không** thêm trường dữ liệu ngoài những gì có trong `openapi.yaml`.
- **Không** sửa file `openapi.yaml`.
- Xử lý đầy đủ các mã lỗi: `400` (BadRequest), `404` (NotFound), `500` (InternalServerError).

### 5.5. Xử lý trạng thái backend không khả dụng

Trong các lời gọi API:
- Bọc trong `try/catch` hoặc xử lý `.catch()`:
  - Nếu lỗi mạng, timeout, hoặc HTTP status không mong đợi:
    - Cập nhật một state lỗi toàn cục (ví dụ `apiStatus`).
- Trên UI:
  - Hiển thị banner hoặc thông báo rõ ràng, ví dụ:
    - “Không thể kết nối tới máy chủ. Vui lòng kiểm tra backend FastAPI (port 8000).”
  - Sử dụng màu sắc dễ nhận biết (ví dụ đỏ hoặc cam).

### 5.6. Kiểm thử & Hoàn thiện

- **Kiểm thử chức năng**:
  - Mở `Home` → kiểm tra danh sách bài.
  - Thực hiện tìm kiếm trên `Search`.
  - Mở `Post Details` từ một bài cụ thể.
  - Tạo bài mới qua `Post Modal` và kiểm tra backend nhận dữ liệu.
- **Kiểm thử lỗi**:
  - Tắt backend FastAPI → refresh frontend → xác nhận có thông báo lỗi như yêu cầu.
- **Kiểm thử giao diện**:
  - So sánh với Figma để đảm bảo layout, khoảng cách, màu sắc tương đối giống.

---

## Kết quả & Đánh giá

### 6.1. Kết quả đạt được

- Đã xây dựng thành công ứng dụng React `SimpleSocialMediaApplication` chạy tại `http://localhost:3000`.
- Giao tiếp được với backend FastAPI tại `http://localhost:8000` theo chuẩn `openapi.yaml`.
- Đã triển khai các màn hình chính:
  - `Home`, `Search`, `Post Details`, `Post Modal`, `Name Input Modal`.
- Đã hiện thực xử lý khi backend không khả dụng, có thông báo rõ ràng cho người dùng.

### 6.2. Đánh giá ưu điểm

- **Áp dụng 3 mức thiết kế**:
  - Ý tưởng – Luận lý – Vật lý được thể hiện rõ ràng.
- **Tận dụng tốt công cụ**:
  - Kết hợp GitHub Copilot + Figma MCP server giúp tăng tốc xây dựng UI.
- **Tách biệt rõ frontend – backend**:
  - Frontend tuân thủ `openapi.yaml`, giảm phụ thuộc chi tiết triển khai backend.

### 6.3. Hạn chế và hướng cải tiến

- Hạn chế:
  - Chưa có cơ chế đăng nhập, phân quyền đầy đủ.
  - Validation form còn đơn giản.
  - UI/UX có thể cần tinh chỉnh thêm cho mobile.
- Hướng phát triển:
  - Thêm tính năng like/comment.
  - Thêm phân trang danh sách bài viết.
  - Cải thiện thông báo lỗi chi tiết hơn (mã lỗi, gợi ý cách khắc phục).

---

## Kết luận & Bài học kinh nghiệm

- Việc kết hợp **thiết kế ở mức ý tưởng – luận lý – vật lý** giúp cho quá trình hiện thực code trở nên có định hướng, giảm sửa đổi lớn về sau.
- **OpenAPI (`openapi.yaml`)** là hợp đồng quan trọng giữa frontend và backend:
  - Giúp loại bỏ nhiều lỗi do không thống nhất kiểu dữ liệu.
- **GitHub Copilot và Figma MCP**:
  - Hỗ trợ tốt cho việc sinh mã lặp lại, nhưng lập trình viên vẫn cần:
    - Hiểu yêu cầu.
    - Kiểm tra, chỉnh sửa và tổ chức lại code cho sạch, dễ bảo trì.
- Thông qua bài tập, sinh viên rèn luyện:
  - Quy trình làm việc với công cụ AI hỗ trợ,
  - Khả năng đọc hiểu spec và tài liệu kỹ thuật,
  - Kỹ năng thiết kế & hiện thực frontend hiện đại.

---

## Nhật ký làm việc & Tổ chức mã nguồn

### 8.1. Nhật ký làm việc (WORKLOG)

Trong repository GitHub, tạo file `WORKLOG.md` ghi nhận đóng góp từng thành viên:

```markdown
# Nhật ký làm việc

## Thông tin nhóm
- Thành viên 1: Họ tên A – MSSV: …
- Thành viên 2: Họ tên B – MSSV: …
- … (cập nhật theo nhóm thực tế)

## Bảng nhật ký

| Ngày       | MSSV   | Họ tên     | Công việc thực hiện                                     | Thời lượng | Ghi chú |
|-----------|--------|------------|---------------------------------------------------------|-----------|--------|
| 05/02/26  | …      | …          | Đọc tài liệu `docs/02-javascript.md`, hiểu yêu cầu phần 2 | 1.5 giờ  |        |
| 05/02/26  | …      | …          | Trao đổi với AI (file `docs/hanhtrinhlam.txt`) để làm rõ yêu cầu báo cáo, slide, ZIP | 1 giờ |        |
| 06/02/26  | …      | …          | Thiết lập venv trong `complete/python`, cài `fastapi`, `uvicorn`, xử lý lỗi PEP 668 | 2 giờ | Theo hướng dẫn AI |
| 06/02/26  | …      | …          | Cài thêm `pyyaml`, sửa lỗi `ModuleNotFoundError: No module named 'yaml'` | 0.5 giờ | Backend chạy ổn định |
| 06/02/26  | …      | …          | Kiểm tra Swagger `/docs`, xác nhận backend hoạt động đúng, tìm hiểu redirect sang `*.app.github.dev` | 0.5 giờ | Codespaces |
| 07/02/26  | …      | …          | Chuẩn bị cấu hình gọi API từ frontend qua URL public Codespaces (không dùng `localhost`) | 1 giờ |        |
| 07/02/26  | …      | …          | Thiết kế cấu trúc component React theo Figma (Home, Search, Post Details, Post Modal, Name Input Modal) | 2 giờ | Dùng Copilot |
| 08/02/26  | …      | …          | Hoàn thiện báo cáo `docs/baocao.md` dựa trên `docs/hanhtrinhlam.txt` và sinh outline slide | 2 giờ |        |
| ...       | ...    | ...        | ...                                                     | ...       | ...    |
```

### 8.2. Cấu trúc nộp bài & file ZIP

Tên file nộp: `BT1_VibeCopiplot_HoTen_MaSV.zip`, bên trong gồm:
- Thư mục mã nguồn frontend (`javascript/SimpleSocialMediaApplication`).
- Tài liệu:
  - `docs/BaoCao_BT1_VibeCopilot_HoTen_MaSV.md` (hoặc PDF).
  - `docs/Slide_BT1_VibeCopilot_HoTen_MaSV.pptx` (hoặc PDF).
- File `WORKLOG.md`.
- (Nếu cần) Hướng dẫn chạy trong `README.md`.

