# Requirements Document

## Introduction

Tính năng cho phép chatbot AI tự động tạo flashcard từ vựng trong quá trình hội thoại. Khi người dùng yêu cầu tạo flashcard (hoặc khi chatbot nhận diện từ vựng quan trọng), AI sẽ trả về dữ liệu flashcard dưới dạng JSON nhúng trong phản hồi. Backend sẽ trích xuất JSON này, validate, và lưu vào MongoDB. Frontend sẽ hiển thị flashcard được tạo ngay trong giao diện chat.

## Glossary

- **AI_Chat_Service**: Service backend xử lý hội thoại với AI (Gemini/OpenAI-compatible), nhận tin nhắn và trả phản hồi
- **Flashcard_Service**: Service backend quản lý flashcard (tạo, lưu, truy vấn lịch sử)
- **Chat_Controller**: Controller xử lý request chat trong ai-chat-service
- **Flashcard_Parser**: Module trích xuất và validate JSON flashcard từ phản hồi AI
- **Prompt_Builder**: Module xây dựng system prompt cho AI, hướng dẫn AI cách trả lời
- **Flashcard_JSON**: Cấu trúc JSON chứa thông tin flashcard gồm: word, ipa, meaning, example
- **Chat_Response**: Phản hồi từ AI bao gồm nội dung text và có thể chứa Flashcard_JSON nhúng
- **Inline_Flashcard**: Flashcard được tạo trực tiếp trong luồng chat, không cần gọi endpoint riêng
- **Flashcard_Marker**: Ký hiệu đặc biệt đánh dấu vùng JSON flashcard trong phản hồi AI (ví dụ: ```flashcards ... ```)

## Requirements

### Requirement 1: Cập nhật System Prompt để AI tạo Flashcard JSON

**User Story:** Là một sinh viên, tôi muốn chatbot tự động tạo flashcard từ vựng khi tôi yêu cầu, để tôi có thể học từ mới hiệu quả hơn.

#### Acceptance Criteria

1. WHEN người dùng gửi tin nhắn yêu cầu tạo flashcard (ví dụ: "tạo flashcard", "cho tôi flashcard về chủ đề X", "tạo từ vựng"), THE Prompt_Builder SHALL bổ sung hướng dẫn vào prompt yêu cầu AI trả về Flashcard_JSON nhúng trong phản hồi
2. WHEN AI tạo flashcard, THE AI_Chat_Service SHALL yêu cầu AI trả về JSON theo cấu trúc: mảng các object chứa trường word (string), ipa (string), meaning (string), example (string)
3. WHEN AI trả về flashcard, THE AI_Chat_Service SHALL yêu cầu AI bọc JSON trong Flashcard_Marker với format: ```flashcards\n[...JSON...]\n```
4. THE Prompt_Builder SHALL giữ nguyên chức năng dạy học hiện tại và chỉ bổ sung khả năng tạo flashcard khi được yêu cầu

### Requirement 2: Trích xuất và Validate Flashcard JSON từ phản hồi AI

**User Story:** Là một developer, tôi muốn backend tự động trích xuất và validate JSON flashcard từ phản hồi AI, để đảm bảo dữ liệu flashcard luôn đúng format trước khi lưu.

#### Acceptance Criteria

1. WHEN phản hồi AI chứa Flashcard_Marker, THE Flashcard_Parser SHALL trích xuất nội dung JSON nằm giữa marker ```flashcards và ```
2. WHEN JSON được trích xuất, THE Flashcard_Parser SHALL validate rằng mỗi flashcard chứa đầy đủ 4 trường bắt buộc: word, ipa, meaning, example
3. IF JSON trích xuất không hợp lệ (sai cú pháp hoặc thiếu trường), THEN THE Flashcard_Parser SHALL bỏ qua các flashcard không hợp lệ và chỉ giữ lại các flashcard hợp lệ
4. IF phản hồi AI không chứa Flashcard_Marker, THEN THE Flashcard_Parser SHALL trả về mảng rỗng và không ảnh hưởng đến luồng chat bình thường
5. FOR ALL chuỗi JSON flashcard hợp lệ, trích xuất rồi serialize lại SHALL tạo ra object tương đương với input ban đầu (thuộc tính round-trip)

### Requirement 3: Lưu Flashcard vào Database

**User Story:** Là một sinh viên, tôi muốn flashcard được tạo từ chat tự động lưu vào tài khoản của tôi, để tôi có thể ôn tập lại sau.

#### Acceptance Criteria

1. WHEN Flashcard_Parser trả về danh sách flashcard hợp lệ (mảng không rỗng), THE Chat_Controller SHALL gọi Flashcard_Service để lưu các flashcard vào database
2. WHEN lưu flashcard, THE Flashcard_Service SHALL gán user_id của người dùng hiện tại, conversation_id của cuộc hội thoại, và source là "chat-inline"
3. WHEN flashcard có trường word trùng với flashcard đã tồn tại của cùng user_id, THE Flashcard_Service SHALL bỏ qua flashcard trùng lặp và không tạo bản ghi mới
4. IF quá trình lưu flashcard gặp lỗi database, THEN THE Chat_Controller SHALL vẫn trả về phản hồi chat bình thường cho người dùng và ghi log lỗi

### Requirement 4: Trả về Flashcard trong Chat Response

**User Story:** Là một sinh viên, tôi muốn thấy flashcard được tạo ngay trong cuộc hội thoại, để tôi biết những từ nào đã được lưu.

#### Acceptance Criteria

1. WHEN phản hồi AI chứa flashcard, THE Chat_Controller SHALL trả về response bao gồm cả text reply (đã loại bỏ Flashcard_Marker) và mảng flashcard đã được lưu
2. THE Chat_Controller SHALL trả về response theo cấu trúc: { success: true, reply: string, flashcards: array, conversationId: string }
3. WHEN phản hồi AI không chứa flashcard, THE Chat_Controller SHALL trả về response theo cấu trúc hiện tại: { success: true, reply: string }
4. THE Chat_Controller SHALL loại bỏ hoàn toàn Flashcard_Marker và JSON khỏi trường reply để người dùng chỉ thấy nội dung text

### Requirement 5: Hiển thị Flashcard trên Frontend

**User Story:** Là một sinh viên, tôi muốn thấy flashcard được hiển thị đẹp mắt trong giao diện chat, để tôi có thể xem nhanh từ vựng mới.

#### Acceptance Criteria

1. WHEN response từ API chứa mảng flashcards không rỗng, THE ChatPage SHALL hiển thị danh sách flashcard dưới dạng card component bên dưới tin nhắn AI
2. WHEN hiển thị flashcard, THE ChatPage SHALL hiển thị đầy đủ 4 trường: word (in đậm), ipa (in nghiêng), meaning, và example
3. THE ChatPage SHALL hiển thị flashcard với giao diện phân biệt rõ ràng với tin nhắn chat thông thường (khác màu nền, có border, có icon)
4. WHEN response không chứa flashcards hoặc mảng rỗng, THE ChatPage SHALL hiển thị tin nhắn chat bình thường như hiện tại

### Requirement 6: Tích hợp Flashcard Chat với Flashcard History

**User Story:** Là một sinh viên, tôi muốn flashcard tạo từ chat xuất hiện trong thư viện flashcard của tôi, để tôi có thể ôn tập tập trung.

#### Acceptance Criteria

1. WHEN flashcard được tạo từ chat, THE Flashcard_Service SHALL lưu với cùng schema như flashcard tạo từ endpoint /generate hiện tại
2. THE Flashcard_Service SHALL đảm bảo flashcard tạo từ chat xuất hiện trong kết quả của endpoint GET /history khi query theo user_id
3. WHEN người dùng truy cập trang FlashcardStudyPage, THE FlashcardStudyPage SHALL hiển thị tất cả flashcard bao gồm cả flashcard tạo từ chat (source: "chat-inline") và flashcard tạo từ generate (source: "ai")
