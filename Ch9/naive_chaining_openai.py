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

    messages = [{"role": "system", "content": system_prompt}]

    prompt_1 = get_user_prompt(get_average_return)
    prompt_2 = "Add type hints to all variables."
    prompt_3 = "include Google Style docstring."

    for prompt in [prompt_1, prompt_2, prompt_3]:
        messages.append({"role": "user", "content": prompt})
        completion: ChatCompletion = client.chat.completions.create(
            model="gpt-4o",
            messages=messages, )
        output: str = completion.choices[0].message.content
        messages.append({"role": "assistant", "content": output})

    print(output)