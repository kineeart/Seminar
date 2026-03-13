import os

from openai import OpenAI

# Improved prompt từ solutions/lab41.txt (copy nguyên từ lab)
IMPROVED_PROMPT = """
CONTEXT: You will be provided with PyCharm GUI steps enclosed with {{{ STEPS }}} to execute a process enclosed with {{{ PROCESS }}}.
TASK: Convert the steps to CLI commands.
PROCESS: {{{ Commit and push files to a remote git branch }}}
STEPS: {{{
1. Review changed files
2. Stage the desired files
3. Add a commit message
4. Commit the files
5. Validate branch name
6. Push the changes to the remote branch
}}}
CLI COMMANDS:
"""

# Bạn có thể thêm cải tiến nếu muốn output tốt hơn (tùy chọn)
ENHANCED_PROMPT = IMPROVED_PROMPT + """
Hãy trả lời bằng tiếng Việt.
Sử dụng các lệnh Git chuẩn, giả sử remote tên là 'origin'.
Liệt kê từng lệnh một kèm giải thích ngắn gọn.
Bắt đầu bằng git status để kiểm tra an toàn.
Sử dụng branch 'main' làm ví dụ nếu không chỉ định.
Định dạng output trong code block markdown để dễ copy.
"""

if __name__ == "__main__":
    # Lấy API key linh hoạt (hỗ trợ dacdev hoặc openai gốc)
    api_key = (os.getenv("DACDEV_API_KEY") or os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        raise ValueError("Hãy set biến môi trường DACDEV_API_KEY hoặc OPENAI_API_KEY trước khi chạy script.")

    # Khởi tạo client (dùng base_url nếu bạn dùng dacdev proxy)
    base_url = "https://dacdev.com/api/v1" if "DACDEV_API_KEY" in os.environ else None
    client = OpenAI(api_key=api_key, base_url=base_url)

    # Messages cho request
    messages = [
        {
            "role": "system",
            "content": "Bạn là chuyên gia Git và trợ lý AI, luôn trả lời bằng tiếng Việt rõ ràng, chính xác. Chuyên chuyển hướng dẫn GUI PyCharm sang lệnh CLI Git."
        },
        {
            "role": "user",
            "content": ENHANCED_PROMPT  # hoặc dùng IMPROVED_PROMPT nếu muốn nguyên bản từ sách
        },
    ]

    print("=== Chạy Lab 4.1: Chuyển GUI PyCharm sang CLI Git ===")
    print("Đang gửi prompt đến API...\n")

    try:
        completion = client.chat.completions.create(
            model="gpt-4o",          # Có thể đổi thành "gpt-4o-mini" để tiết kiệm
            temperature=0.2,         # Thấp để output chính xác, ít "sáng tạo"
            max_tokens=800,          # Đủ dài để giải thích chi tiết
            messages=messages,
        )

        # In thông tin usage và kết quả
        print("Completion Tokens:", completion.usage.completion_tokens)
        print("Prompt Tokens:", completion.usage.prompt_tokens)
        print("Total Tokens:", completion.usage.total_tokens)
        print("\nKẾT QUẢ TỪ AI (các lệnh CLI Git):\n")
        print("-" * 70)
        print(completion.choices[0].message.content.strip())
        print("-" * 70)

    except Exception as e:
        print("Lỗi khi gọi API:", str(e))
        print("Kiểm tra lại:")
        print("- API key có đúng và còn credit không?")
        print("- Nếu dùng dacdev: base_url và key có khớp?")
        print("- Model có sẵn trên provider?")