# Báo Cáo: Cơ Sở Lập Trình Với GenAI


## 1. Từ Tự động hóa đến Chu kỳ Phát triển Phần mềm Hoàn chỉnh: Cơ hội Hiện tại cho GenAI

**Tóm tắt lý thuyết (2025-2026):**  
Generative AI (GenAI) đã chuyển từ giai đoạn tự động hóa đơn lẻ (code completion, test generation) sang tích hợp toàn bộ **Software Development Lifecycle (SDLC)**. Theo các báo cáo gần đây:

- GenAI giúp giảm 40–60% thời gian phát triển phần mềm (LinkedIn, Deloitte 2025-2026).
- Dự báo đến 2026: >80% doanh nghiệp triển khai GenAI trong ứng dụng sản xuất; AI agents chiếm 40% ứng dụng doanh nghiệp (Gartner).
- Các giai đoạn SDLC được hỗ trợ mạnh mẽ: yêu cầu → user story → thiết kế → code generation → unit test → debug → refactor → migrate code cũ → documentation.
- Xu hướng lớn: Agentic AI (AI tự hành động theo mục tiêu), SLM (Small Language Models) cho triển khai cục bộ/on-premise, và tích hợp sâu vào CI/CD, DevOps.

**Lab minh họa:**  
- **lab42.py** & **lab42.txt**: Minh họa GenAI (hoặc lập trình viên với sự hỗ trợ AI) tạo bài kiểm tra nhân ngẫu nhiên, xử lý input người dùng, feedback, và tính điểm.  
  → Code ban đầu có lỗi về reproducibility (random.seed đặt sai vị trí), scoping (score không tăng đúng), error handling input.  
  → Sau khi fix: random seed đặt đúng, xử lý try-except tốt, kết quả chạy ổn định và cho output như mong đợi (ví dụ: 8/10 đúng).

→ **Kết luận**: GenAI rất mạnh ở việc sinh code lặp lại (như quiz), validation input, nhưng vẫn cần con người fix logic scoping và reproducibility.

## 2. Làm việc với API OpenAI

**Tóm tắt lý thuyết:**  
OpenAI API (và các proxy như dacdev.com) cho phép tích hợp LLM vào ứng dụng Python một cách linh hoạt. Các điểm chính:

- Sử dụng `openai` library, client = OpenAI(api_key, base_url nếu proxy).
- Phương thức chính: `client.chat.completions.create()` với model (gpt-4o, o1,...), messages (system + user), temperature, max_tokens.
- Cần quản lý API key an toàn (environment variables), xử lý usage (completion_tokens), và streaming nếu cần.
- Best practices 2025-2026: Sử dụng model mới nhất, developer messages thay system messages (đối với o1), tránh chain-of-thought thủ công (model tự suy luận), dùng delimiters (XML, markdown), few-shot prompting khi cần.

**Lab minh họa:**  
- **import_openai.py**: Script kết nối OpenAI (hoặc dacdev proxy), đặt system prompt tiếng Việt, hỏi về số sao trong dải Ngân Hà, in ra completion tokens và output.  
  → Minh họa cách setup client, bảo mật key, và lấy response từ LLM.

→ **Kết luận**: API cho phép xây dựng ứng dụng thông minh (chatbot, trợ lý code, QA), nhưng cần chú ý chi phí token và prompt chất lượng.

## 3. Sử dụng GitHub Copilot với PyCharm, VS Code và Jupyter Notebook

**Tóm tắt lý thuyết:**  
GitHub Copilot là AI pair programmer tích hợp trực tiếp vào IDE, hỗ trợ inline suggestion, chat, agent mode (2025+).  

- **Setup**:
  - **VS Code**: Cài extension GitHub Copilot → sign in GitHub → bật AI features.
  - **PyCharm**: Settings → Plugins → tìm "GitHub Copilot" → install → login.
  - **Jupyter Notebook** (VS Code): Extension hoạt động tốt trong .ipynb; JupyterLab có package notebook-intelligence hoặc tương tự.
- **Usage**: Viết comment mô tả → Copilot sinh code; chat để hỏi giải thích/refactor; agent mode (2025+) tự chạy task lớn (nhưng cần hướng dẫn rõ).

**Lab minh họa:**  
- **lab41.txt**: Chuyển GUI steps trong PyCharm sang CLI git commands (commit & push).  
  → Minh họa workflow thực tế: git status → git add → git commit -m → git branch → git push origin branch.  
  → Copilot rất giỏi sinh các lệnh git chuẩn hoặc script automation từ mô tả tiếng Anh/Việt.

→ **Kết luận**: Copilot tăng tốc coding 2-3x ở các tác vụ lặp (git, boilerplate, quiz logic), đặc biệt khi kết hợp comment chi tiết làm prompt.

## 4. Các Phương pháp Tốt nhất để Hỏi đáp với ChatGPT

**Tóm tắt lý thuyết:**  
ChatGPT (web) phù hợp hỏi nhanh, brainstorm, học khái niệm. Best practices (2025):

- Cụ thể, chi tiết: Vai trò (persona), mục tiêu, format output (bullet, table, code).
- Few-shot: Đưa 1-3 ví dụ input-output.
- Chain of Thought: Yêu cầu "think step by step" (với model cũ); model mới như o1 tự suy luận.
- Iterate: Hỏi tiếp dựa trên câu trả lời trước.
- Sử dụng delimiters (""", ###, XML) để phân đoạn.

**Lab minh họa gián tiếp:** Qua các prompt trong lab (quiz logic, git commands) → cho thấy prompt rõ ràng giúp LLM sinh kết quả chính xác hơn.

## 5. Các Phương pháp Tốt nhất để Hỏi đáp với API OpenAI và GitHub Copilot

**Tóm tắt lý thuyết:**  

**Với OpenAI API**:
- Sử dụng model mới nhất, temperature thấp (0.0-0.3) cho task chính xác.
- Developer messages (o1+), delimiters rõ ràng, tránh CoT thủ công.
- Few/zero-shot, điều chỉnh max_tokens, frequency penalty.
- Theo dõi usage để tối ưu chi phí.

**Với GitHub Copilot**:
- Viết comment/docstring chi tiết làm prompt.
- Cụ thể yêu cầu (language, style, framework).
- Break task lớn thành bước nhỏ.
- Review & refine suggestion (cycle qua các gợi ý).
- Tạo file copilot-instructions.md cho agent mode.
- Kết hợp chat để debug/refactor.

**Lab minh họa:**  
- lab42: Fix code quiz → cần prompt rõ ràng về random seed, error handling.
- import_openai.py: Prompt system tiếng Việt → output đúng ngôn ngữ.
- lab41: Chuyển GUI → CLI → Copilot giỏi sinh lệnh git từ mô tả.

→ **Kết luận tổng quát**: GenAI đang thay đổi cách lập trình từ "viết code" sang "hướng dẫn và review code do AI sinh". Kỹ năng prompt engineering và hiểu scoping/logic vẫn rất quan trọng để đạt kết quả tốt.

**Tài liệu tham khảo bổ sung:** OpenAI Help Center, GitHub Docs Copilot, Gartner 2025-2026, Deloitte Insights.