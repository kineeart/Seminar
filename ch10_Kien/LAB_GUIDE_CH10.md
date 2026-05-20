# Chapter 10 Lab Guide (for coursework)

This guide maps Chapter 10 content into four practical labs for your assignment.
It is separate from `README.md` so the original repository style is preserved.

## Lab A - Baseline Refactor
Goal:
- Use baseline prompt to request a general refactor for the distance API.

Inputs:
- `prompts/refactor_prompt_baseline_chatgpt.txt`
- Current implementation in `app.py`

Expected output:
- Before/after code comparison
- Notes on readability and reduced duplication

## Lab B - CoT Structural Refactor
Goal:
- Refactor route logic into focused helper functions:
  - `parse_request_parameters`
  - `get_manhattan_dist`
  - `get_euclidean_dist`

Inputs:
- `prompts/cot_chatgpt.txt`
- `prompts/cot_copilot.py`

Expected output:
- Cleaner route flow
- Improved testability and separation of concerns

## Lab C - Performance Refactor
Goal:
- Replace nested L2 loops with NumPy vectorization.

Inputs:
- `prompts/performance_refactoring_chatgpt.txt`
- `prompts/performance_refactoring_openai.py`
- `benchmark_l2.py`

Expected output:
- Runtime comparison between loop and vectorized implementations
- Reported speedup

Run benchmark:

```bash
cd ch10
python benchmark_l2.py
```

## Lab D - Run and Package Demo
Goal:
- Run API locally and via Docker, then collect proof screenshots.

Run locally:

```bash
cd ch10
python app.py
```

Test L1:

```bash
curl -X POST http://127.0.0.1:5000/distances \
  -H "Content-Type: application/json" \
  -d '{"distance": "L1", "df1": [[1, 2], [3, 4]], "df2": [[2, 0], [1, 3]]}'
```

Test L2:

```bash
curl -X POST http://127.0.0.1:5000/distances \
  -H "Content-Type: application/json" \
  -d '{"distance": "L2", "df1": [[1, 2], [3, 4]], "df2": [[2, 0], [1, 3]]}'
```

Run with Docker:

```bash
cd ch10
docker build -t ch10-distance-api .
docker run --rm -p 5000:5000 ch10-distance-api
```

## What to include in your report
- Idea level: why refactor with GenAI
- Logical level: request -> parse -> distance function -> response
- Physical level: environment, dependencies, commands, logs, screenshots

Useful files:
- `REPORT_CH10.md`
- `SLIDES_CH10.md`
- `SUBMISSION_CHECKLIST_CH10.md`
