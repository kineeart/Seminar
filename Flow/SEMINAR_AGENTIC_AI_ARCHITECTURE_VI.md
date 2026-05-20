# 🤖 Kiến Trúc AI Agent Trong Hệ Thống Gia Sư AI Học Tiếng Anh

## 1. Tổng Quan: Điều Gì Làm Cho Đây Là "Agentic"?

**AI Agentic** = AI khi:
- ✅ Nhận thức bối cảnh (trình độ người dùng, lịch sử chat, mục tiêu học tập)
- ✅ Suy luận về mục tiêu (người dùng nên học gì tiếp theo?)
- ✅ Thực hiện hành động (tạo nội dung, gọi dịch vụ, điều chỉnh phản hồi)
- ✅ Phản ánh kết quả (vòng phản hồi → hành động tiếp theo)

**Trạng Thái Hiện Tại**: MVP sử dụng "AI Chức Năng" (cuộc gọi Gemini không có trạng thái). **Lộ trình tương lai** bao gồm các vòng lặp agentic đầy đủ.

---

## 2. MVP: Các Thành Phần AI Chức Năng

### 2.1 Chat Agent (Chế Độ Giải Thích)

**Kích Hoạt**: Người dùng đặt câu hỏi ở chế độ Giải Thích

**Luồng Agent**:
```
1. ĐẦU VÀO: Truy vấn người dùng + bối cảnh (trình độ, exam_target, ngôn ngữ)
2. NHẬN THỨC: 
   - Lấy hồ sơ người dùng (trình độ, mục tiêu thi cử)
   - Lấy lịch sử chat gần đây (5 tin nhắn cuối để bối cảnh)
   - Xác định chủ đề từ truy vấn
3. SUY LUẬN:
   - Xác định xem câu hỏi có nằm trong phạm vi (học tiếng Anh)
   - Chọn mẫu phản hồi (Giải Thích → Công Thức → Ví Dụ)
   - Ước tính ngân sách số từ (<80 từ)
4. HÀNH ĐỘNG:
   - Gọi Gemini API với prompt:
     "Bạn là giáo viên tiếng Anh cho học viên trình độ {level}.
      Mục tiêu: {exam_target}.
      Người dùng hỏi: {query}
      Trả lời trong <80 từ theo: Giải Thích → Công Thức → Ví Dụ.
      Sử dụng từ vựng thực tế."
5. ĐIỀU CHỈNH:
   - Gemini trả về phản hồi
   - Nếu quá dài → cắt ngắn cụm từ chính
   - Nếu không có ví dụ → thêm từ bộ nhớ cache
6. ĐẦU RA:
   - Stream phản hồi tới frontend
   - Lưu trữ trong bộ sưu tập chat_messages
7. PHẢN ÁNH:
   - Theo dõi sử dụng token, độ trễ phản hồi
   - Khi lỗi → quay lại phản hồi dựa trên quy tắc
   - Cập nhật sự kiện phân tích người dùng
```

**Kiến Trúc Mã**:
```
ai-chat-service/
├── controllers/
│   └── chat.controller.js → Xử lý yêu cầu
├── services/
│   ├── chat.service.js → Quản lý phiên
│   ├── gemini.service.js → Cuộc gọi Gemini API
│   └── context.service.js → Lấy bối cảnh người dùng
├── middleware/
│   ├── auth.middleware.js → Xác thực JWT
│   └── context.middleware.js → Gắn bối cảnh người dùng vào req
├── prompts/
│   ├── knowledge.prompt.js → System prompt chế độ Giải Thích
│   └── roleplay.prompt.js → System prompt chế độ Tình Huống
└── models/
    └── Message.js → Mongoose schema
```

### 2.2 Chat Agent (Chế Độ Tình Huống)

**Kích Hoạt**: Người dùng chuyển sang chế độ Tình Huống hoặc tiếp tục hội thoại

**Luồng Agent**:
```
1. THIẾT LẬP BỐI CẢNH:
   - Tải lịch sử phiên chat
   - Phát hiện kịch bản (phỏng vấn xin việc, chat bình thường, cuộc họp kinh doanh, v.v.)
   - Suy ra trình độ tiếng Anh của người dùng từ các tin nhắn trước đó
   
2. ĐỊNH NGHĨA VAI TRÒ:
   - AI chọn nhân vật thực tế (người phục vụ, phỏng vấn HR, bạn bè, v.v.)
   - Căn chỉnh độ khó với trình độ người dùng + mục tiêu thi cử
   
3. SINH ĐỐI THOẠI:
   - Gọi Gemini với prompt:
     "Bạn là {role} trong {scenario}. 
      Người dùng là học viên tiếng Anh trình độ {level} nhắm tới {exam}.
      Giữ hội thoại tự nhiên, sử dụng từ vựng cho {exam}.
      Khi người dùng phản hồi, cung cấp:
      - Phản hồi về ngữ pháp/từ vựng (nếu sai, sửa nhẹ)
      - Tiếp tục hội thoại tự nhiên
      - Bao gồm 1-2 từ vựng mới mỗi lần trao đổi"
   
4. STREAMING:
   - Stream phản hồi theo từng ký tự để tạo cảm giác ngập mình
   - Frontend hiển thị chỉ báo gõ
   
5. LƯU TRỮ:
   - Lưu toàn bộ trao đổi trong chat_messages
   - Trích xuất cụm từ chính → gợi ý flashcard
   
6. ĐIỀU CHỈNH:
   - Nếu người dùng gặp khó khăn → đơn giản hóa từ vựng
   - Nếu người dùng xuất sắc → tăng độ phức tạp
   - Theo dõi trong siêu dữ liệu phiên
```

---

## 3. AI Cấp Dịch Vụ: Sinh Flashcard & Quiz

### 3.1 Flashcard Generation Agent

**Kích Hoạt**: Người dùng nhấp "Tạo Flashcard" hoặc hệ thống tự động gợi ý

**Luồng Agent**:
```
ĐẦU VÀO: 
  - Tin nhắn người dùng: "Sự khác biệt giữa 'since' và 'for'?"
  - Trình độ người dùng: Beginner
  - Bối cảnh gần đây: 10 tin nhắn trước

NHẬN THỨC:
  - Phân tích câu hỏi → Trích xuất mục tiêu học tập
  - Quét lịch sử chat tìm điểm thảo luận liên quan
  - Kiểm tra xem flashcard tương tự đã tồn tại chưa

SUY LUẬN:
  - Flashcard hữu ích tối thiểu là gì?
  - Mặt trước: "Sự khác biệt: 'since' vs 'for'"
  - Mặt sau: Bao gồm quy tắc + 2 ví dụ
  - Trình độ khó: Beginner → Ngôn ngữ đơn giản trong giải thích

HÀNH ĐỘNG (Prompt Gemini):
  "Tạo một flashcard cho học viên tiếng Anh.
   Trình độ: Beginner
   Chủ đề: Sự khác biệt giữa 'since' và 'for'
   Mặt trước (câu hỏi): {auto-generated hoặc nhập của người dùng}
   Mặt sau (câu trả lời): Giải thích quy tắc + 2 ví dụ thực tế
   Giữ mặt sau dưới 150 từ."

ĐẦU RA:
  - Lưu trữ trong bộ sưu tập flashcards
  - Đặt các tham số SM-2 ban đầu (interval=1 ngày, ease=2.5, reviewed=false)
  - Thêm vào hàng "Flashcard Hôm Nay" của người dùng

PHẢN ÁNH:
  - Phân tích: sự kiện flashcard_created
  - Liên kết: source_message_id → chat_messages
```

### 3.2 Quiz Generation Agent

**Kích Hoạt**: Người dùng nhấp "Quiz" hoặc hệ thống đề xuất quiz hàng ngày

**Luồng Agent**:
```
ĐẦU VÀO:
  - Trình độ người dùng: Intermediate
  - Mục tiêu thi cử: TOEIC
  - Chủ đề gần đây: phrasal verbs, past perfect, từ vựng kinh doanh
  - Khu vực yếu: (từ theo dõi tiến độ)

NHẬN THỨC:
  - Truy vấn flashcards + lịch sử quiz
  - Xác định khu vực yếu (độ chính xác thấp trong những lần thử gần đây)
  - Chọn 5-10 chủ đề liên quan

SUY LUẬN:
  - Quiz nên bao gồm:
    1. Học tập gần đây (chủ đề gần đây)
    2. Khu vực yếu (kiến thức yếu)
    3. Kết hợp: 30% nhớ lại, 40% hiểu biết, 30% ứng dụng
  - Độ khó: phù hợp với trình độ người dùng + định dạng thi cử

HÀNH ĐỘNG (Prompt Gemini):
  "Tạo quiz kiểu TOEIC cho học viên trình độ Intermediate.
   Chủ đề: {chủ đề đã chọn}
   Định dạng: 
     - 5 câu hỏi trắc nghiệm
     - Mỗi câu 4 lựa chọn (A/B/C/D)
     - Bao gồm 1-2 câu hỏi khó
   Trả về JSON:
   {
     questions: [
       { id, question_text, options[], correct_answer, difficulty }
     ]
   }"

ĐẦU RA:
  - Lưu trữ tài liệu quiz với mảng câu hỏi
  - Tạo giải thích cho mỗi câu hỏi (Cuộc gọi Gemini)
  - Trình bày cho người dùng trong giao diện quiz

CHẤM ĐIỂM:
  - Chấm câu trả lời của người dùng (khớp chuỗi hoặc AI-score cho câu tự do)
  - Tính điểm ∈ [0, 100]
  - Tạo phản hồi được cá nhân hóa

PHẢN ÁNH:
  - Lưu trữ quiz_result
  - Cập nhật tiến độ người dùng (quizzes_completed++, lịch sử điểm)
  - Cập nhật trình theo dõi khu vực yếu
  - Đề xuất quiz tiếp theo: tập trung vào điểm yếu
```

---

## 4. Điều Phối AI Dịch Vụ Chéo (Lập Kế Hoạch)

### 4.1 Learning Path Agent (Tương Lai)

**Tầm Nhìn**: AI quyết định chuỗi học tập tối ưu

**Vòng Lặp Suy Luận Agent**:
```
1. QUAN SÁT trạng thái người dùng:
   - Trình độ hiện tại, mục tiêu thi cử, mục tiêu học tập
   - Điểm quiz gần đây, độ chính xác flashcard
   - Trạng thái chuỗi, thời gian có sẵn hôm nay
   - Người dùng đã biết gì (từ tiến độ)

2. LẬP KẾ HOẠCH hành động tiếp theo:
   - NẾU streak_active VÀ quiz_completed → 
     Đề xuất xem xét flashcard (củng cố)
   - NẾU quiz_score < 60% → 
     Đề xuất chat kiến thức về chủ đề yếu
   - NẾU time > 20 min → 
     Gợi ý quiz toàn diện
   - NẾU time < 5 min → 
     Gợi ý drill flashcard nhanh

3. THỰC HIỆN:
   - Định tuyến người dùng tới hoạt động đề xuất
   - Sưởi ấm bộ nhớ cache (tải nội dung liên quan)
   
4. PHẢN ÁNH:
   - Theo dõi: Người dùng có tuân theo đề xuất không?
   - Nếu có, học tập có cải thiện không?
   - Điều chỉnh mô hình đề xuất
```

### 4.2 Đường Ống Tạo Nội Dung

```
Cuộc gọi Gemini trên các dịch vụ:

ai-chat-service/
  ├─ Trả lời câu hỏi người dùng
  └─ → Kích hoạt: "Gợi ý flashcard?" nút
       → flashcard-service/
           └─ Tạo mặt trước/sau flashcard

quiz-service/
  ├─ "Làm Quiz" → Gemini tạo câu hỏi
  ├─ "Giải Thích" → Gemini tạo giải thích
  └─ quiz hoàn tất → Kích hoạt cập nhật tiến độ → 
      → quiz-service cập nhật bộ sưu tập tiến độ →
      → quiz-service gọi learning-path-agent (tương lai)
```

---

## 5. Chiến Lược Kỹ Thuật Prompt

### 5.1 Hệ Thống Phân Cấp Prompt

**Cấp 1: System Prompt** (định nghĩa vai trò)
```
"Bạn là giáo viên tiếng Anh cho học viên trình độ {level}.
 Mục tiêu: giải thích khái niệm trong <80 từ.
 Định dạng: Giải Thích → Công Thức → Ví Dụ.
 Sử dụng từ vựng phù hợp với {exam_target}.
 Hãy khích lệ và thực dụng."
```

**Cấp 2: Context Prompt** (thêm trạng thái)
```
"Người dùng đã học được {days} ngày.
 Điểm mạnh trước: {strong_topics}
 Điểm yếu trước: {weak_topics}
 Tâm trạng/năng lượng hôm nay: {inferred từ tone chat}
 Điều chỉnh giải thích cho phù hợp."
```

**Cấp 3: Task Prompt** (yêu cầu cụ thể)
```
"Người dùng hỏi: {user_query}
 Trong <80 từ, giải thích {topic}.
 Bao gồm {number} ví dụ.
 Sử dụng {style} tone (bình thường/trang trọng/hài hước)."
```

### 5.2 Tối Ưu Hóa Prompt (Vibe Coding)

Tất cả prompts lưu trữ trong `SYSTEM_PROMPTS.md`:
```markdown
## Chế Độ Giải Thích
### Cho Beginner
"Giải thích khái niệm một cách đơn giản. Không dùng từ kỹ thuật."

### Cho Intermediate
"Bao gồm một ví dụ thực tế."

### Cho Advanced
"Giải thích sắc thái. Tại sao nó quan trọng."

## Chế Độ Tình Huống
### Kịch Bản Phỏng Vấn
"Bạn là phỏng vấn viên HR..."

### Chat Bình Thường
"Bạn là một người bạn..."
```

**AI có thể tự động tạo prompts mới** cho kịch bản mới, lập trình viên xem xét.

---

## 6. Xử Lý Lỗi & Fallback (Khả Năng Phục Hồi Agent)

### 6.1 Chế Độ Lỗi Gemini API

```
TRƯỜNG HỢP LỖI: API trả về 429 (Hạn Ngạch Vượt Quá)
├─ Đếm: thử lại với backoff theo hàm mũ
├─ Hành động: cache phản hồi trước, phục vụ từ cache
└─ Tương lai: định tuyến sang LLM thay thế

TRƯỜNG HỢP LỖI: API trả về rác
├─ Phát hiện: xác thực token, kiểm tra coherence
├─ Hành động: tạo lại với prompt khác
└─ Theo dõi: tăng bộ đếm lỗi

TRƯỜNG HỢP LỖI: Timeout mạng
├─ Hành động: hiển thị "Đang suy nghĩ..." → Timeout sau 30s
├─ Fallback: phục vụ phản hồi dựa trên quy tắc
└─ Ví dụ: "Tôi không hiểu. Hãy cố gắng lại."

TRƯỜNG HỢP LỖI: Nhập của người dùng ngoài phạm vi
├─ Phát hiện: phân loại ý định (đây có phải học tiếng Anh không?)
├─ Hành động: trả lời lịch sự ngắn gọn + chuyển hướng nhẹ
└─ Ví dụ: "Điều đó thú vị, nhưng hãy tập trung vào tiếng Anh. 
            Chủ đề ngữ pháp nào tôi có thể giúp bạn?"
```

---

## 7. Số Liệu & Vòng Phản Hồi

### 7.1 Số Liệu Agentic

| Số Liệu | Ý Nghĩa | Hành Động |
|---------|---------|----------|
| **Độ Trễ** | Thời gian cuộc gọi API | Tối ưu prompt, sử dụng cache |
| **Tỷ Lệ Fallback** | % lần hạn ngạch hết | Mở rộng quy mô bản sao, sử dụng mô hình rẻ hơn |
| **Sự Hài Lòng Người Dùng** (tương lai) | Thumbs up/down trên phản hồi | Huấn luyện lại prompt nếu <50% |
| **Kết Quả Học Tập** | Cải thiện điểm quiz | Điều chỉnh độ khó nội dung |
| **Tỷ Lệ Hoàn Thành** | % người dùng hoàn thành chuỗi hàng ngày | Điều chỉnh thời gian đề xuất |

### 7.2 Tích Hợp Phản Hồi (Agent Học Tập)

```
Người dùng đánh giá phản hồi: 👍 (like) hoặc 👎 (dislike)
├─ Lưu trữ: {quiz_id, response_id, rating, timestamp}
├─ Phân tích: Prompts nào nhận được đánh giá cao?
├─ Cập nhật: Điều chỉnh trọng số system prompt (tương lai: fine-tuning)
└─ Tạo lại: Câu hỏi tương tự → sử dụng prompt chiến thắng
```

---

## 8. Trạng Thái Agentic Hiện Tại vs. Tương Lai

### MVP (Hiện Tại - Giai Đoạn 5)
```
✅ Cuộc gọi Gemini không có trạng thái (mỗi yêu cầu độc lập)
✅ Điều chỉnh dựa trên prompt (trình độ, exam_target trong prompt)
✅ Fallback đơn giản (dựa trên quy tắc nếu hạn ngạch hết)
✅ Không có bộ nhớ (mỗi hội thoại bắt đầu mới ngoài lịch sử)
✅ Không sử dụng công cụ (chỉ Gemini tạo ra văn bản)
```

### Sau MVP (Lộ Trình Tương Lai)
```
🔮 Bộ Nhớ Có Trạng Thái (Vector DB để tìm kiếm ngữ nghĩa)
🔮 Lập Kế Hoạch Đa Bước (AI quyết định chuỗi: chat→quiz→flashcard)
🔮 Sắp Xếp Công Cụ (AI gọi flashcard-service, quiz-service APIs)
🔮 Mô Hình Tinh Chỉnh (Adapter Gemini task phụ)
🔮 Multi-Agent (Các agent chuyên gia cho ngữ pháp, từ vựng, roleplay)
🔮 Điều Chỉnh Thực Thời (Điều chỉnh giữa hội thoại)
```

---

## 9. Ví Dụ Mã Triển Khai

### 9.1 Knowledge Mode Agent (Đơn Giản Hóa)

```javascript
// ai-chat-service/src/services/chat.service.js

class ChatService {
  async generateKnowledgeResponse(userId, query) {
    // 1. NHẬN THỨC: Lấy bối cảnh
    const user = await userService.getUserProfile(userId);
    const history = await this.chatRepository.getRecentMessages(userId, 5);
    
    // 2. SUY LUẬN: Xây dựng prompt
    const systemPrompt = `Bạn là giáo viên tiếng Anh cho học viên trình độ ${user.current_level}.
      Mục tiêu: ${user.target_exam}.
      Định dạng: Giải Thích (1-2 câu) → Công Thức/Quy Tắc → Ví Dụ.
      Tối đa 80 từ. Chỉ từ vựng thực tế.`;
    
    const userPrompt = `${query}\n\nBối cảnh gần đây:\n${history.map(m => m.content).join('\n')}`;
    
    // 3. HÀNH ĐỘNG: Gọi Gemini
    try {
      const response = await geminiService.generateText({
        systemPrompt,
        userPrompt,
        maxTokens: 100,
        temperature: 0.7
      });
      
      // 4. PHẢN ÁNH: Lưu & theo dõi
      await this.chatRepository.saveMessage({
        user_id: userId,
        role: 'assistant',
        content: response,
        tokens_used: response.token_count
      });
      
      analyticsService.track({
        event: 'chat_response_generated',
        user_id: userId,
        latency: Date.now() - start,
        mode: 'knowledge'
      });
      
      return response;
    } catch (error) {
      // Fallback
      return this.fallbackResponse(query, user.current_level);
    }
  }
  
  fallbackResponse(query, level) {
    // Mẫu dựa trên quy tắc
    if (query.includes('ngữ pháp')) {
      return `Mẹo ngữ pháp: Kiểm tra cấu trúc câu. 
              Thứ Tự: Chủ Ngữ → Động Từ → Tân Ngữ.`;
    }
    return `Tôi không hiểu. Hãy diễn đạt lại?`;
  }
}
```

### 9.2 Flashcard Generation Agent

```javascript
// flashcard-service/src/services/flashcard.service.js

class FlashcardService {
  async generateFromMessage(userId, messageId) {
    // 1. NHẬN THỨC
    const message = await chatRepository.getMessage(messageId);
    const user = await userService.getUserProfile(userId);
    
    // 2. SUY LUẬN
    const topic = extractTopic(message.content);
    const existingCard = await this.repository.findByTopic(userId, topic);
    if (existingCard) return existingCard; // Đã tồn tại
    
    // 3. HÀNH ĐỘNG: Gemini tạo flashcard
    const geminiPrompt = `Tạo một flashcard học tiếng Anh.
      Trình độ: ${user.current_level}
      Chủ đề: ${topic}
      Từ tin nhắn: "${message.content}"
      
      Trả về JSON:
      {
        front: "Câu hỏi hoặc gợi ý",
        back: "Giải thích + ví dụ (tối đa 150 từ)"
      }`;
    
    const flashcardData = await geminiService.generateJson(geminiPrompt);
    
    // 4. PHẢN ÁNH: Lưu với thuật toán SM-2
    const flashcard = await this.repository.create({
      user_id: userId,
      front: flashcardData.front,
      back: flashcardData.back,
      source_message_id: messageId,
      difficulty: 'medium',
      interval: 1,
      ease_factor: 2.5,
      next_review_date: tomorrow()
    });
    
    return flashcard;
  }
}
```

---

## 10. Tại Sao Thiết Kế Này Là "Agentic"

✅ **Nhận Thức**: Lấy bối cảnh người dùng, lịch sử chat, dữ liệu hiệu suất  
✅ **Suy Luận**: Đưa ra quyết định (chế độ gì, độ khó bao nhiêu, hoạt động tiếp theo)  
✅ **Hành Động**: Gọi Gemini, gọi hoạt động dịch vụ  
✅ **Phản Ánh**: Theo dõi số liệu, điều chỉnh hành vi trong tương lai  
✅ **Khả Năng Mở Rộng**: Không có trạng thái → sao chép agents trên các container  

**Insight Chính**: Ngay cả các cuộc gọi Gemini "đơn giản" cũng trở nên agentic khi gói bằng:
- Nhận thức bối cảnh
- Kỹ thuật prompt
- Xử lý lỗi
- Vòng phản hồi
- Điều phối dịch vụ

---

## Tham Khảo

- `SYSTEM_PROMPTS.md` — Thư viện prompt đầy đủ
- `PHASE_2_AI_CHAT_NOTES.md` — Chi tiết tích hợp Gemini
- `PHASE_3_FLASHCARD_REASONING.md` — Logic lặp lại khoảng cách
- `PHASE_4_QUIZ_REASONING.md` — Chi tiết sinh quiz
