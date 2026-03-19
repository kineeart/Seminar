from openai import OpenAI

client = OpenAI(api_key="YOUR_API_KEY")

# 1. Upload file
file = client.files.create(
    file=open("fine_tuning.jsonl", "rb"),
    purpose="fine-tune"
)

print("Uploaded file ID:", file.id)

# 2. Create fine-tuning job
job = client.fine_tuning.jobs.create(
    training_file=file.id,
    model="gpt-4o-mini"
)

print("Fine-tuning job ID:", job.id)

# 3. Check status
status = client.fine_tuning.jobs.retrieve(job.id)
print("Status:", status.status)

# 4. Sau khi hoàn thành -> test model
# thay model bằng model fine-tuned của bạn
response = client.chat.completions.create(
    model="ft:YOUR_MODEL_ID",
    messages=[
        {
            "role": "system",
            "content": "You will be provided with a Python function signature enclosed with {{{ FUNCTION }}}. Your task is to implement it."
        },
        {
            "role": "user",
            "content": "FUNCTION: {{{def get_quadratic_roots_only_if_real(a:int,b:int,c:int):}}}\nCODE:"
        }
    ]
)

print(response.choices[0].message.content)