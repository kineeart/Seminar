# Phase 3 — AI Vocabulary Flashcard Generation

This document explains the reasoning behind Phase 3 implementation: educational workflow, AI vocabulary extraction, UX and gamification decisions, parser validation, microservice choices, and scalability planning.

## Educational workflow

- Conversation is provided from `ai-chat-service` and sent to `flashcard-service` for vocabulary extraction.
- The flashcard-service uses Gemini to extract relevant vocabulary and returns stable JSON flashcards.
- UI allows students to review generated flashcards, flip cards to see meaning/examples, and track review progress.

## AI vocabulary extraction reasoning

- Use a tightly controlled system prompt to force JSON-only output.
- Keep temperature low to reduce hallucinations.
- Ask for IPA, meaning, and practical examples suitable for intermediate learners.
- Deduplicate and validate on backend to ensure quality.

## UX reasoning

- Minimal UI with clear word on front, meaning/example on back.
- Flip animation for cognitive engagement.
- Progress bar to gamify and track the number of cards generated and reviewed.

## Gamification reasoning

- Reward small wins: generated cards count and simple progress fill.
- Keep animations subtle and not distracting to maintain educational focus.

## Parser validation reasoning

- Validate structure strictly: word, ipa, meaning, example.
- Try to repair malformed AI output by extracting JSON blocks.
- Log validation metrics and retry once on failure.

## Microservice reasoning

- Flashcard extraction as a separate service enables independent scaling and specialized retry/logging.
- Keep service lightweight (Express) and stateless — store flashcards in DB later (Mongo) if persistent review needed.

## Scalability planning for MongoDB phase

- Phase 4 will add persistence using MongoDB per-service.
- Use per-user collections or per-conversation indexes and TTL for ephemeral review data.
