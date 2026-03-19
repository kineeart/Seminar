import inspect
import os

from openai import OpenAI
from openai.types.chat import ChatCompletion

from get_average_return import get_average_return

SURROUND = "You are provided with a Python function enclosed with {{{ FUNCTION }}} that calls functions that should be completed."
SINGLE_TASK = "Your task is to implement the missing function."


def get_user_prompt(func: callable) -> str:
    return f""" 
    FUNCTION: {{{{{{ {inspect.getsource(func)} }}}}}} 

   CODE: 
    """


if __name__ == '__main__':
    api_key = ((os.getenv("DACDEV_API_KEY") or os.getenv("OPENAI_API_KEY") or "").strip())
    if not api_key:
        raise ValueError("Set DACDEV_API_KEY (or OPENAI_API_KEY) before running this script.")
    
    client: OpenAI = OpenAI(api_key=api_key, base_url="https://dacdev.com/api/v1")
    system_prompt = f"{SURROUND} {SINGLE_TASK}"
    user_prompt = get_user_prompt(get_average_return)
    completion: ChatCompletion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    )

    output = completion.choices[0].message.content
    print(output)