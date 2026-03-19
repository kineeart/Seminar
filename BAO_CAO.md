# BÁO CÁO HỆ THỐNG PHÂN TÍCH ẢNH ANIME BẰNG AI

## MỤC LỤC
1. [Tổng quan hệ thống](#1-tổng-quan-hệ-thống)
2. [Kiến trúc tổng quan](#2-kiến-trúc-tổng-quan)
3. [Chi tiết từng Node xử lý](#3-chi-tiết-từng-node-xử-lý)
4. [Luồng dữ liệu](#4-luồng-dữ-liệu)
5. [Điểm nhấn công nghệ](#5-điểm-nhấn-công-nghệ)
6. [Kết luận](#6-kết-luận)

---

## 1. TỔNG QUAN HỆ THỐNG

Hệ thống "Anime Siuu Hay" là một giải pháp tự động hóa sử dụng Telegram Bot để nhận diện và phân tích nội dung hình ảnh anime. Hệ thống tích hợp công nghệ Multimodal AI (Google Gemini 2.5 Flash) để xử lý và trả về thông tin chi tiết về anime trong ảnh. Ngoài ra, hệ thống còn hỗ trợ tính năng gợi ý anime đang chiếu trong tuần thông qua tích hợp Jikan API.

---

## 2. KIẾN TRÚC TỔNG QUAN

Hệ thống hoạt động theo mô hình **Event-Driven** (Hướng sự kiện). Dữ liệu được luân chuyển qua một pipeline xử lý gồm 3 giai đoạn chính:

### 2.1. Ingestion (Tiếp nhận)
- **Chức năng**: Lắng nghe Webhook từ Telegram
- **Cơ chế**: Bot hoạt động ở chế độ Webhook để đảm bảo phản hồi thời gian thực (Real-time)
- **Input**: JSON Payload từ Telegram API

### 2.2. Processing (Xử lý)
- **Chức năng**: Định tuyến, tải tài nguyên và chuẩn hóa dữ liệu Binary
- **Các bước**:
  - Phân loại yêu cầu (Request Dispatcher)
  - Truy xuất metadata file từ Telegram
  - Tải dữ liệu binary từ Telegram server
  - Chuẩn hóa MIME type

### 2.3. Analysis (Phân tích)
- **Chức năng**: Sử dụng Multimodal AI (Google Gemini) để nhận diện nội dung
- **Output**: Thông tin về anime (tên, tập, tóm tắt nội dung)

---

## 3. CHI TIẾT TỪNG NODE XỬ LÝ

### 3.0. Tổng quan cấu trúc Workflow

Hệ thống gồm **11 nodes** được tổ chức thành **3 luồng xử lý chính**:

1. **Luồng xử lý ảnh (Image Processing)**:
   - Telegram Trigger → If → Get a file → HTTP Request → Analyze an image → Send a text message2

2. **Luồng gợi ý anime (Anime Suggestion)**:
   - Telegram Trigger → If → Switch → HTTP Request1 → Message a model1 → Send a text message1

3. **Luồng hướng dẫn (Help)**:
   - Telegram Trigger → If → Switch → Send a text message3

**Điểm đặc biệt**:
- Node **If** đóng vai trò phân loại sớm, tách biệt xử lý text và image
- Node **HTTP Request** tự động xử lý MIME type thông qua `outputPropertyName`
- Không cần node "Edit Binary Data" riêng biệt nhờ cấu hình thông minh

---

### 3.1. Node 1: Telegram Trigger

**Vai trò**: Cổng lắng nghe (Listener)

**Cơ chế hoạt động**:
- Bot hoạt động ở chế độ **Webhook** (thay vì Long Polling) để đảm bảo phản hồi thời gian thực (Real-time)
- Tự động kích hoạt workflow khi có tin nhắn mới

**Dữ liệu đầu vào**:
```json
{
  "message": {
    "chat": {
      "id": 123456789
    },
    "text": "Hello",
    "photo": [
      {
        "file_id": "AgACAgUAAxkBA...",
        "file_unique_id": "AQAD...",
        "width": 1280,
        "height": 720
      }
    ]
  }
}
```

**Thành phần dữ liệu**:
- `chat_id`: ID của người gửi
- `text`: Nội dung tin nhắn (nếu có)
- `photo`: Mảng đối tượng hình ảnh với các kích thước khác nhau

---

### 3.2. Node 2: If (Bộ lọc đầu vào)

**Vai trò**: Phân loại loại tin nhắn (Text vs Image)

**Logic xử lý**:
- Kiểm tra sự tồn tại của trường `message.text`
- Condition: `{{ $json.message.text }}` exists

**Các nhánh xử lý**:
- **True (Có text)**: Chuyển đến node **Switch** để xử lý các lệnh text
- **False (Không có text, có ảnh)**: Chuyển đến node **Get a file** để xử lý ảnh

**Ý nghĩa**:
- Tách biệt rõ ràng giữa xử lý text commands và xử lý hình ảnh
- Tối ưu hóa luồng xử lý bằng cách định tuyến sớm

---

### 3.3. Node 3: Switch (Bộ định tuyến thông minh)

**Vai trò**: Phân loại các lệnh text (Text Command Dispatcher)

**Logic xử lý**:
- Sử dụng **Rules-based routing** với điều kiện so sánh chuỗi
- Kiểm tra giá trị `{{ $json.message.text }}`

**Các luồng định tuyến (Routes)**:

| Route | Điều kiện | Hành động |
|-------|-----------|-----------|
| Route 0 | `text === '/tuannaycogi'` | Gợi ý anime đang chiếu (Jikan API + Gemini) |
| Route 1 | `text === '/anime'` | Gửi thông báo hướng dẫn |

**Chi tiết Route 0**:
- Kích hoạt luồng: HTTP Request1 → Message a model1 → Send a text message1
- Mục đích: Lấy danh sách anime đang chiếu từ Jikan API và xử lý bằng Gemini để tạo gợi ý thân thiện

**Chi tiết Route 1**:
- Gửi tin nhắn: "Chỉ gửi một ảnh cho tui thui"
- Mục đích: Hướng dẫn người dùng cách sử dụng bot

**Ưu điểm**:
- Tự động phân loại request mà không cần code phức tạp
- Dễ dàng mở rộng thêm các route mới

---

### 3.4. Node 4: Telegram | Get File (Truy xuất Metadata)

**Vai trò**: Lấy thông tin metadata của file từ Telegram

**Vấn đề**:
- Telegram API không gửi trực tiếp file ảnh trong Webhook để tiết kiệm băng thông
- Chỉ gửi `file_id` - một chuỗi định danh duy nhất

**Giải pháp**:
- Gọi phương thức `getFile` của Telegram Bot API
- Endpoint: `https://api.telegram.org/bot<TOKEN>/getFile?file_id=<FILE_ID>`

**Kỹ thuật xử lý mảng (Array Handling)**:

Telegram gửi nhiều kích thước ảnh (Thumbnail, Medium, Large) trong mảng `photo`. Để chọn ảnh chất lượng tốt nhất:

```javascript
{{ $json.message.photo.reverse()[0].file_id }}
```

**Giải thích thuật toán**:
1. `reverse()`: Đảo ngược mảng để đưa ảnh kích thước lớn nhất lên đầu
2. `[0]`: Lấy phần tử đầu tiên (ảnh có độ phân giải cao nhất)

**Kết quả**:
```json
{
  "ok": true,
  "result": {
    "file_id": "AgACAgUAAxkBA...",
    "file_unique_id": "AQAD...",
    "file_size": 245678,
    "file_path": "photos/file_123.jpg"
  }
}
```

**Output**: `file_path` - đường dẫn lưu trữ trên server Telegram

---

### 3.5. Node 5: HTTP Request (Tải tài nguyên)

**Vai trò**: Chuyển đổi dữ liệu từ Metadata sang Binary Stream

**Cấu hình API**:
- **Method**: `GET`
- **Endpoint**: `https://api.telegram.org/file/bot<TOKEN>/{{ $json.result.file_path }}`
- **Response Format**: `File` ⚠️
- **Output Property Name**: `image/jpeg` ⚠️

**Cấu hình quan trọng**:
- **Response Format: File**: Thiết lập này ép buộc n8n không parse JSON mà giữ nguyên luồng dữ liệu nhị phân
- **Output Property Name: image/jpeg**: Tự động gán MIME type cho dữ liệu binary, thay thế cho node "Edit Binary Data" riêng biệt
- Đảm bảo dữ liệu ảnh không bị biến đổi và có MIME type đúng ngay từ đầu

**Kết quả**:
- Một **Buffer** dữ liệu ảnh với MIME type `image/jpeg` đã được chuẩn hóa
- Dữ liệu sẵn sàng để đưa vào Google Gemini mà không cần xử lý thêm

---

### 3.6. Node 6: Google Gemini (AI Analysis)

**Vai trò**: Bộ não xử lý (Inference Engine)

**Mô hình (Model)**: `gemini-2.5-flash`

**Lý do chọn**:
- Tối ưu hóa độ trễ (Latency) thấp
- Chi phí rẻ cho tác vụ Vision
- Hỗ trợ Multimodal (xử lý cả ảnh và text)
- Phiên bản mới hơn với khả năng xử lý tốt hơn

**Input Configuration**:
- **Resource**: `image`
- **Operation**: `analyze`
- **Input Type**: `binary`
- **Text Prompt**: `"Đây là anime gì?"`

**Prompt Engineering**:
- Prompt ngắn gọn, tập trung vào câu hỏi chính
- Gemini tự động phân tích và trả về thông tin chi tiết về anime

**Output**:
```json
{
  "text": "Đây là phim Naruto, tập 15. Trong cảnh này, Naruto đang chiến đấu với Sasuke tại Thung lũng Kết thúc..."
}
```

---

### 3.7. Node 7: Telegram | Send Message (Phản hồi phân tích ảnh)

**Vai trò**: Giao diện người dùng (Output Interface) cho kết quả phân tích ảnh

**Cấu hình**:
- **Chat ID**: `{{ $('Telegram Trigger').item.json.message.chat.id }}`
- **Message**: `{{ $json.content.parts[0].text }}`

**Kết quả**:
- Gửi tin nhắn phản hồi về cho người dùng
- Hiển thị thông tin phân tích về anime trong ảnh

---

### 3.8. Node 8: HTTP Request1 (Jikan API - Gợi ý anime)

**Vai trò**: Lấy danh sách anime đang chiếu trong tuần

**Cấu hình API**:
- **Method**: `GET`
- **Endpoint**: `https://api.jikan.moe/v4/seasons/now`

**Mô tả**:
- Jikan API là một REST API miễn phí cho dữ liệu anime từ MyAnimeList
- Endpoint `/seasons/now` trả về danh sách anime đang chiếu trong mùa hiện tại

**Output**: JSON chứa danh sách anime với thông tin chi tiết (tên, rating, synopsis, etc.)

---

### 3.9. Node 9: Message a model1 (Gemini Text Processing)

**Vai trò**: Xử lý và tạo gợi ý anime thân thiện từ dữ liệu Jikan

**Mô hình (Model)**: `gemini-2.5-flash`

**Cấu hình**:
- **System Prompt**: 
  ```
  You are an anime assistant bot for Telegram.
  Reply in Vietnamese.
  Be friendly, concise, and clear.
  Use emojis moderately.
  Do not invent information.
  Only use the data provided by the user.
  Format the answer so it looks good in a Telegram message.
  ```

- **User Prompt**:
  ```
  Bạn là một chatbot gợi ý anime thân thiện.
  Người dùng hỏi: "Tuần này có gì đáng xem?"
  - Dựa trên dữ liệu anime đang chiếu được cung cấp
  - Chọn từ 3 đến 5 anime nổi bật nhất
  - Ưu tiên anime đang được nhiều người quan tâm
  - Viết nội dung như một lời gợi ý nhẹ nhàng, dễ đọc
  - Tối đa 6 đến 7 dòng ngắn
  - KHÔNG sử dụng Markdown
  - Chỉ dùng văn bản thuần (plain text)
  ```

**Input**: Dữ liệu JSON từ Jikan API (`{{ JSON.stringify($json.data) }}`)

**Output**: Văn bản gợi ý anime được format phù hợp với Telegram

---

### 3.10. Node 10: Send a text message1 (Phản hồi gợi ý)

**Vai trò**: Gửi gợi ý anime cho người dùng

**Cấu hình**:
- **Chat ID**: `{{ $('Telegram Trigger').item.json.message.chat.id }}`
- **Message**: `{{ $json.content.parts[0].text }}`
- **Parse Mode**: `HTML`

**Kết quả**: Gửi danh sách gợi ý anime đang chiếu cho người dùng

---

### 3.11. Node 11: Send a text message3 (Hướng dẫn)

**Vai trò**: Gửi thông báo hướng dẫn sử dụng

**Cấu hình**:
- **Chat ID**: `{{ $('Telegram Trigger').item.json.message.chat.id }}`
- **Message**: `"Chỉ gửi một ảnh cho tui thui"`

**Kích hoạt**: Khi người dùng gửi lệnh `/anime`

**Vai trò**: Giao diện người dùng (Output Interface)

**Cấu hình**:
- **Chat ID**: Lấy từ `$json.message.chat.id` (Node đầu tiên)
- **Message**: Lấy trường `text` hoặc `content` từ phản hồi JSON của Gemini

**Kết quả**:
- Gửi tin nhắn phản hồi về cho người dùng
- Hiển thị thông tin phân tích về anime trong ảnh

---

## 4. LUỒNG DỮ LIỆU (DATA FLOW DIAGRAM)

### 4.1. Luồng xử lý ảnh (Image Processing Flow)

Quy trình biến đổi dữ liệu khi người dùng gửi ảnh:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. JSON (Start)                                             │
│    {"message": {"photo": [...]}}                           │
│    Telegram Trigger                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. If Node: Kiểm tra text                                   │
│    Condition: message.text exists?                          │
│    Result: FALSE → Chuyển đến Get a file                   │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. String: File ID                                          │
│    "AgACAgUAAxkBA..."                                       │
│    (Trích xuất: photo.reverse()[0].file_id)                │
│    Get a file                                               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. String: File Path                                        │
│    "photos/file_123.jpg"                                    │
│    (Từ API getFile result.file_path)                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Binary Image: Standardized                              │
│    image/jpeg (MIME type đã được gán)                     │
│    HTTP Request với outputPropertyName                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Text (End): Analysis Result                              │
│    "Đây là anime gì?" → "Đây là Naruto..."                 │
│    Analyze an image (Gemini 2.5 Flash)                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Send Message                                             │
│    Gửi kết quả về Telegram                                  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2. Luồng xử lý lệnh text (Text Command Flow)

Quy trình xử lý khi người dùng gửi lệnh `/tuannaycogi`:

```
┌─────────────────────────────────────────────────────────────┐
│ 1. JSON (Start)                                             │
│    {"message": {"text": "/tuannaycogi"}}                   │
│    Telegram Trigger                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. If Node: Kiểm tra text                                   │
│    Condition: message.text exists?                          │
│    Result: TRUE → Chuyển đến Switch                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Switch: Route 0                                          │
│    Condition: text === "/tuannaycogi"                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. JSON: Anime Data                                         │
│    {"data": [...]}                                          │
│    HTTP Request1 (Jikan API)                                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Text: Formatted Suggestion                               │
│    "Tuần này có những anime đáng xem..."                   │
│    Message a model1 (Gemini 2.5 Flash)                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Send Message                                             │
│    Gửi gợi ý về Telegram                                    │
└─────────────────────────────────────────────────────────────┘
```

### 4.3. Mô tả chi tiết các bước chuyển đổi (Image Flow):

1. **JSON → If Check**: Kiểm tra loại tin nhắn (text hay image)
2. **JSON → String (File ID)**: Trích xuất `file_id` từ mảng `photo` bằng thuật toán `reverse()[0]`
3. **String (File ID) → String (File Path)**: Gọi Telegram API `getFile` để lấy `file_path`
4. **String (File Path) → Binary Image**: Tải file từ Telegram server và tự động gán MIME type `image/jpeg` thông qua `outputPropertyName`
5. **Binary Image → Text**: Xử lý bằng Google Gemini 2.5 Flash để phân tích và trích xuất thông tin
6. **Text → User**: Gửi kết quả về Telegram cho người dùng

### 4.4. Điểm khác biệt so với thiết kế ban đầu:

- **Không cần node "Edit Binary Data" riêng biệt**: HTTP Request node đã tự động xử lý MIME type thông qua cấu hình `outputPropertyName: "image/jpeg"`
- **Có thêm node If**: Phân loại sớm giữa text và image để tối ưu hiệu suất
- **Hỗ trợ tính năng gợi ý anime**: Tích hợp Jikan API và Gemini để tạo gợi ý thân thiện

---

## 5. ĐIỂM NHẤN CÔNG NGHỆ

### 5.1. Multimodal Processing

**Khái niệm**: Hệ thống có khả năng xử lý đa phương thức (Ảnh + Chữ) nhờ tích hợp Gemini 2.5 Flash.

**Ưu điểm**:
- Xử lý đồng thời nhiều loại dữ liệu đầu vào
- Phân tích nội dung hình ảnh với độ chính xác cao
- Hỗ trợ nhiều ngôn ngữ (tiếng Việt trong trường hợp này)

**Ứng dụng**:
- Nhận diện anime từ hình ảnh
- Trích xuất thông tin chi tiết (tên phim, số tập, nội dung)
- Tóm tắt nội dung bằng ngôn ngữ tự nhiên

---

### 5.2. Dockerization

**Khái niệm**: Hệ thống được đóng gói trong Docker Container.

**Lợi ích**:

1. **Environment Consistency (Tính nhất quán môi trường)**:
   - Đảm bảo môi trường chạy giống nhau trên mọi máy
   - Tránh lỗi do khác biệt về phiên bản thư viện, hệ điều hành

2. **Easy Deployment (Dễ dàng triển khai)**:
   - Chỉ cần chạy một lệnh `docker-compose up` để khởi động toàn bộ hệ thống
   - Không cần cài đặt thủ công các dependencies

3. **Isolation (Cô lập)**:
   - Mỗi service chạy trong container riêng biệt
   - Dễ dàng scale và quản lý

**Cấu trúc Docker**:
```yaml
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
```

---

### 5.3. No-Code/Low-Code Integration

**Khái niệm**: Sử dụng n8n để giảm thiểu code thủ công (Boilerplate code) cho các tác vụ kết nối API.

**Ưu điểm**:

1. **Rapid Development (Phát triển nhanh)**:
   - Tạo workflow bằng giao diện kéo-thả (Drag & Drop)
   - Không cần viết code cho các tác vụ kết nối API thông thường

2. **Focus on Business Logic (Tập trung vào logic nghiệp vụ)**:
   - Giảm thời gian viết code infrastructure
   - Tập trung vào việc thiết kế logic xử lý dữ liệu

3. **Maintainability (Dễ bảo trì)**:
   - Workflow trực quan, dễ hiểu
   - Dễ dàng chỉnh sửa và mở rộng

**Ví dụ**: Thay vì viết code để:
- Kết nối Telegram API
- Xử lý Webhook
- Gọi Google Gemini API
- Format response

→ Chỉ cần kéo-thả các node và cấu hình tham số

---

### 5.4. Data Pipeline Management

**Khái niệm**: Xử lý triệt để vấn đề chuyển đổi định dạng dữ liệu (MIME Type Handling) trong luồng truyền tải.

**Thách thức**:
- Dữ liệu trải qua nhiều giai đoạn biến đổi
- Mỗi giai đoạn yêu cầu định dạng khác nhau
- Cần đảm bảo tính toàn vẹn dữ liệu

**Giải pháp**:

1. **Type Conversion Pipeline**:
   ```
   JSON → String → Binary Stream → Binary Image → Text
   ```

2. **MIME Type Standardization**:
   - Nhận diện và chuẩn hóa MIME type ở mỗi bước
   - Đảm bảo tương thích với API downstream

3. **Data Validation**:
   - Kiểm tra tính hợp lệ của dữ liệu ở mỗi node
   - Xử lý lỗi một cách graceful

**Kết quả**:
- Hệ thống xử lý được nhiều loại file ảnh khác nhau
- Đảm bảo chất lượng dữ liệu đầu vào cho AI
- Giảm thiểu lỗi do format không tương thích

---

## 6. KẾT LUẬN

Hệ thống phân tích ảnh anime bằng AI đã thành công trong việc:

1. **Tích hợp công nghệ hiện đại**: Kết hợp Telegram Bot, n8n Workflow, và Google Gemini AI
2. **Xử lý pipeline phức tạp**: Chuyển đổi dữ liệu từ JSON → Binary → Text một cách hiệu quả
3. **Tối ưu hóa hiệu suất**: Sử dụng mô hình AI nhẹ (Gemini 2.5 Flash) để đảm bảo độ trễ thấp
4. **Tích hợp đa nguồn dữ liệu**: Kết hợp Jikan API và Gemini AI để cung cấp thông tin anime toàn diện
4. **Dễ dàng triển khai**: Dockerization giúp hệ thống có thể chạy trên mọi môi trường

**Hướng phát triển tương lai**:
- Mở rộng hỗ trợ video (video analysis)
- Tích hợp database để lưu trữ lịch sử phân tích
- Thêm tính năng so sánh và đề xuất anime tương tự
- Tối ưu hóa prompt để tăng độ chính xác nhận diện
- Thêm các lệnh mới như `/search` để tìm kiếm anime theo tên
- Tích hợp thêm các API anime khác để mở rộng nguồn dữ liệu

---

**Tài liệu tham khảo**:
- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [n8n Documentation](https://docs.n8n.io/)
- [Docker Documentation](https://docs.docker.com/)

---

*Báo cáo được tạo tự động dựa trên kiến trúc hệ thống thực tế*
