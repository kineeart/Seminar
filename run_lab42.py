import os
from openai import OpenAI

PROMPT_TEMPLATE = """
CONTEXT: You will be provided with Python code in the Python editor with explanation enclosed with {{{{ CODE_EXPLANATION }}}} that may contain errors enclosed with {{{{ ERRORS }}}}.
TASK: Fix the errors in the code.
CODE_EXPLANATION: {{{{
Run 10 random multiplication quizzes and provide feedback about each to the user
}}}}
ERRORS: {{{{
1. Compilation
2. Reproducibility of random number generation
3. Logical scoping of variable assignments
4. Error handling for input casting
}}}}

BUGGY CODE:
```python
{buggy_code}
Fix the code and return the corrected version with explanations in Vietnamese.
"""

BUGGY_CODE = """
import random

def multiplication_quiz():
    score = 0
    for i in range(10):
        a = random.randint(1, 10)
        b = random.randint(1, 10)
        print(f"Câu {i+1}: {a} x {b} = ?")
        answer = input()
        if int(answer) == a * b:
            print("Đúng!")
            score += 1
        else:
            print("Sai!")
    print(f"Điểm: {score}/10")

multiplication_quiz()
"""

if __name__ == "__main__":
    api_key = (os.getenv("DACDEV_API_KEY") or os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        raise ValueError("Set DACDEV_API_KEY or OPENAI_API_KEY before running.")
    base_url = "https://dacdev.com/api/v1" if "DACDEV_API_KEY" in os.environ else None
    client = OpenAI(api_key=api_key, base_url=base_url)
    user_prompt = PROMPT_TEMPLATE.format(buggy_code=BUGGY_CODE)
    messages = [
        {
            "role": "system",
            "content": "Bạn là chuyên gia Python. Trả lời bằng tiếng Việt. Phân tích lỗi rồi đưa code đã sửa.",
        },
        {"role": "user", "content": user_prompt},
    ]
    try:
        completion = client.chat.completions.create(
            model="gpt-4o",
            temperature=0.2,
            max_tokens=3000,
            messages=messages,
        )
        print("Completion Tokens:", completion.usage.completion_tokens)
        print("Prompt Tokens:", completion.usage.prompt_tokens)
        print("Total Tokens:", completion.usage.total_tokens)
        print("\nKẾT QUẢ:\n")
        print("-" * 70)
        print(completion.choices[0].message.content.strip())
        print("-" * 70)
    except Exception as e:
        print("Lỗi:", str(e))

# Lưu file và chạy như `run_lab41.py`:
#
# ```bash
# pip install openai
# export OPENAI_API_KEY="sk-..."
# python run_lab42.py
# ```
