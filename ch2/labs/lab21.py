import os

from openai import OpenAI

if __name__ == "__main__":
    api_key = ((os.getenv("DACDEV_API_KEY") or os.getenv("OPENAI_API_KEY") or "").strip())
    if not api_key:
        raise ValueError("Set DACDEV_API_KEY (or OPENAI_API_KEY) before running this script.")

    client = OpenAI(api_key=api_key, base_url="https://dacdev.com/api/v1")
    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": "What is the FizzBuzz problem?"}],
    )

    print(completion.choices[0].message.content)
