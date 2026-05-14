# Phase 2 AI Chat Reasoning — Educational AI Conversational Tutor

Date: 2026-05-18

This document explains the design rationale behind the upgraded AI Conversational Tutor for the AI Tutor English Learning System. The goal of Phase 2 is not merely to expose a chat endpoint, but to turn the chat service into a practical educational module that supports guided English learning with adaptive tutoring behavior, lightweight conversation memory, and stable local execution.

---

## 1. Educational Objective

The conversational tutor was designed to support the way university students actually study English: they ask short questions, need immediate explanations, and often want examples more than theory. The service therefore prioritizes:

- concise responses
- beginner-friendly explanations
- grammar clarification
- vocabulary support
- example sentences
- encouragement and low-pressure tutoring

The architectural goal is to keep the system educational first and conversational second. That means the model should answer like a tutor, not like a general-purpose assistant. Every response must reduce cognitive load and help the learner continue the study flow without feeling overwhelmed.

---

## 2. AI Tutor Workflow

The workflow implemented in `ai-chat-service` is intentionally small and deterministic:

1. The controller validates the request.
2. The request is normalized into a tutoring context.
3. The service loads the recent conversation history from in-memory storage.
4. The prompt builder combines system instructions, learner level, memory, and the current question.
5. Gemini is called with a structured educational prompt.
6. If the upstream model fails after retry/cooldown handling, a local fallback tutor reply is returned.
7. The final assistant message is written back to memory.

This workflow allows the module to behave like a continuous tutoring session instead of a stateless API endpoint.

---

## 3. Conversation Memory Design

Conversation memory was introduced to improve contextual continuity. In tutoring, the next question often depends on what was already explained. A learner may ask:

- "Can you explain that again?"
- "Give me another example"
- "What about a simpler version?"

If the system forgets the previous turn, the educational value drops quickly.

### Design choice

- Store conversation state in memory only.
- Keep the last 10 messages per conversation.
- Use a `conversationId` key to isolate separate tutoring sessions.
- Append both the learner message and the tutor response.

### Reasoning

The last 10 messages provide enough short-term context for a tutoring session without making the prompt too long. This keeps the system lightweight, preserves responsiveness, and avoids database complexity in Phase 2.

### Educational impact

Memory helps the tutor remain coherent, refer back to examples, and build on prior explanations. This makes the chat feel more like a real tutoring conversation and less like isolated Q&A.

---

## 4. Adaptive Difficulty Reasoning

The tutor now supports three learner levels:

- Beginner
- Intermediate
- Advanced

This is not just a label; it changes how the prompt is built.

### Beginner

- use simple vocabulary
- explain one idea at a time
- keep sentences short
- give one clear example
- avoid technical grammar terminology unless defined immediately

### Intermediate

- provide moderate detail
- explain why the grammar works
- include one or two examples
- mention common mistakes when useful

### Advanced

- use more precise grammar terminology
- stay concise, but less simplified
- cover edge cases when relevant
- avoid overly long explanations unless the learner asks for depth

### Reasoning

Adaptive difficulty improves educational relevance. A beginner should not receive the same density of terminology as an advanced learner. By injecting the learner level into the prompt, the tutor can personalize the explanation style without changing the API shape.

---

## 5. Prompt Engineering Decisions

Prompt engineering is central to the module. The final design separates the prompt into reusable layers:

1. system prompt
2. learner level guidance
3. conversation memory
4. current message
5. reply requirements

### System prompt

The system prompt instructs the model to behave like an English tutor for university students. It emphasizes:

- friendly tone
- concise teaching style
- clear explanations
- supportive language
- grammar, vocabulary, conversation, writing, and pronunciation support

### Why this matters

Without a strong tutor-oriented system prompt, the model may drift into generic assistant behavior or overly academic explanations. The prompt therefore acts as the educational policy layer of the service.

### Prompt builder utility

The prompt builder was extracted into a reusable utility so that:

- prompt logic stays maintainable
- level-specific behavior is easy to extend
- future educational modules can reuse the same pattern
- prompt consistency is easier to audit

### Memory injection

Recent messages are serialized into a compact transcript before being sent to Gemini. This preserves context while keeping the prompt readable.

### Adaptive response style

The prompt builder adds learner-level guidance so the model knows how much detail to provide and how much terminology is acceptable.

---

## 6. Validation and Error Handling

Educational chat services are fragile if they fail silently or return misleading output. The implementation therefore includes:

- request validation
- centralized error handling
- timeout protection
- retry handling
- exponential backoff
- cooldown handling after quota errors

### Why this is important

If the Gemini upstream is slow or rate-limited, the tutor should not hang indefinitely. The learner should still receive a safe response and the server should stay responsive locally.

### Fallback architecture

Fallback is only used after a real upstream failure or when the model is temporarily unavailable. The fallback reply remains educational and beginner-friendly, but it is clearly treated as a local backup path rather than the primary tutoring source.

---

## 7. Runtime Verification

The upgraded module was verified locally on Windows PowerShell and Node.js 22.

Observed live behavior:

- `npm install` succeeds
- `npm test` passes
- `npm run dev` starts the service with port fallback
- `POST /chat` reaches Gemini successfully with `gemini-2.5-flash`
- the second turn includes prior conversation context

The live log confirmed:

- `historyCount: 0` on the first tutoring turn
- `historyCount: 2` on the second tutoring turn
- `promptLength` increased on the second call
- Gemini returned a real tutor response, not only the local fallback

This is an important distinction: the module now supports both a real upstream AI path and a safe fallback path, and the logs show which one was used.

---

## 8. Production Readiness Considerations

The implementation is still lightweight, but the design is aligned with production concerns:

- prompt logic is reusable
- memory is isolated by conversation id
- adaptive difficulty is explicit and testable
- upstream failures are observable through logs
- fallback behavior is deterministic
- local development remains fully runnable

For a later production phase, the next natural steps would be persistent memory storage, rate limiting, request tracing, and usage metrics.

---

## 9. Conclusion

Phase 2 evolved from a basic chat service into a real educational AI module. The key design decision was to treat tutoring behavior as a composition of prompt engineering, learner-level adaptation, and short-term memory, rather than as a single free-form Gemini call.

This produces a tutor that is more:

- coherent
- context-aware
- beginner-friendly
- instruction-driven
- stable in local development

The result is a better match for an AI-powered EdTech product, where the quality of explanation matters as much as the ability to generate text.
