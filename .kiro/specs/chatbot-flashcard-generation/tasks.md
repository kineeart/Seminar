# Implementation Plan: Chatbot Flashcard Generation

## Overview

This plan implements the chatbot flashcard generation feature which allows the AI tutor to create vocabulary flashcards inline during chat conversations. The architecture flows: Frontend → Gateway → ai-chat-service → flashcard-service → MongoDB. Most core components already exist in the codebase; tasks focus on verifying integration, adding the internal save-batch endpoint, installing fast-check for property-based testing, styling the inline flashcard cards, and writing comprehensive tests.

## Tasks

- [ ] 1. Backend setup and internal endpoint
  - [ ] 1.1 Add fast-check dependency to ai-chat-service
    - Run `npm install --save-dev fast-check` in `app/backend/ai-chat-service`
    - Verify fast-check is added to devDependencies in package.json
    - _Requirements: Testing infrastructure for Properties 1-8_

  - [ ] 1.2 Add POST /internal/save-batch route to flashcard-service
    - Add route `router.post('/internal/save-batch', controller.saveBatchFromChat)` in `flashcard-service/src/routes/flashcard.routes.js`
    - Create `saveBatchFromChat` handler in `flashcard-service/src/controllers/flashcard.controller.js` that delegates to `FlashcardService.batchCreate()`
    - The handler should accept `{ flashcards, userId, conversationId }` and assign `source: "chat-inline"`
    - Ensure deduplication logic in repository skips existing words per user
    - _Requirements: 3.1, 3.2, 3.3_

  - [ ] 1.3 Update flashcard-client.js to call /internal/save-batch endpoint
    - Change the URL in `ai-chat-service/src/utils/flashcard-client.js` from `/batch` to `/internal/save-batch`
    - Verify timeout handling (5s) and graceful error handling remain intact
    - _Requirements: 3.1, 3.4_

- [ ] 2. Verify and harden prompt builder flashcard detection
  - [ ] 2.1 Verify detectFlashcardRequest covers all required keywords
    - Ensure `isFlashcardRequest()` in `ai-chat-service/src/utils/prompt-builder.js` detects: "flashcard", "tạo flashcard", "tạo từ vựng", "cho tôi flashcard", "create flashcard"
    - Ensure it returns false for messages without these keywords
    - Verify `buildTutorPrompt()` appends flashcard instruction only when detected
    - _Requirements: 1.1, 1.4_

  - [ ]* 2.2 Write property test for flashcard request detection (Property 6)
    - **Property 6: Flashcard Request Detection**
    - Test that any message containing flashcard keywords returns true
    - Test that messages without keywords return false
    - Use fast-check arbitrary strings with/without keyword injection
    - **Validates: Requirements 1.1**

  - [ ]* 2.3 Write property test for prompt preservation (Property 5)
    - **Property 5: Prompt Always Preserves Core Teaching Content**
    - Test that `buildTutorPrompt()` output always contains SYSTEM_PROMPT content regardless of input
    - Use fast-check to generate arbitrary message strings
    - **Validates: Requirements 1.4**

- [ ] 3. Verify and test flashcard response parser
  - [ ] 3.1 Verify extractFlashcards handles all edge cases
    - Confirm `flashcard-response-parser.js` correctly extracts JSON from ```flashcards markers
    - Confirm it validates all 4 required fields (word, ipa, meaning, example) as non-empty strings
    - Confirm it skips invalid flashcards and returns only valid ones
    - Confirm cleanReply has no marker content remaining
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 3.2 Write property test for JSON round-trip (Property 1)
    - **Property 1: Flashcard JSON Round-Trip**
    - Generate valid flashcard arrays, wrap in markers, pass to extractFlashcards, verify equivalence
    - Use fast-check `fc.array(fc.record({word: fc.string(), ipa: fc.string(), ...}))`
    - File: `ai-chat-service/src/tests/flashcard-response-parser.test.js`
    - **Validates: Requirements 2.1, 2.5**

  - [ ]* 3.3 Write property test for validation filtering (Property 2)
    - **Property 2: Validation Filtering Preserves Only Valid Items**
    - Generate mixed arrays of valid and invalid flashcard objects
    - Verify only items with all 4 non-empty string fields are returned
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 3.4 Write property test for no-marker passthrough (Property 3)
    - **Property 3: No Marker Yields Empty Array and Preserved Text**
    - Generate arbitrary strings without ```flashcards pattern
    - Verify empty flashcards array and cleanReply equals input
    - **Validates: Requirements 2.4**

  - [ ]* 3.5 Write property test for clean reply (Property 4)
    - **Property 4: Clean Reply Contains No Marker Content**
    - Generate AI responses with and without markers
    - Verify cleanReply never contains ```flashcards pattern
    - **Validates: Requirements 4.1, 4.4**

- [ ] 4. Checkpoint - Ensure all backend tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Chat controller integration and save flow
  - [ ] 5.1 Verify chat controller flashcard integration
    - Confirm `chat.controller.js` calls `extractFlashcards(reply)` after AI response
    - Confirm it calls `flashcardClient.saveFlashcards()` when flashcards are found and userId exists
    - Confirm response structure: `{ success, reply (clean), flashcards, conversationId }` when flashcards present
    - Confirm response structure: `{ success, reply }` when no flashcards
    - Confirm graceful degradation: if save fails, still return reply with unsaved flashcards
    - _Requirements: 3.1, 3.4, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 5.2 Write property test for metadata enrichment (Property 7)
    - **Property 7: Metadata Enrichment on Save**
    - Mock flashcard-service, verify every saved flashcard has correct user_id, conversation_id, source="chat-inline"
    - Use fast-check to generate arbitrary userId and conversationId strings
    - File: `ai-chat-service/src/tests/chat-controller-flashcard.test.js`
    - **Validates: Requirements 3.2**

  - [ ]* 5.3 Write property test for duplicate word skipping (Property 8)
    - **Property 8: Duplicate Word Skipping**
    - Mock repository with existing words, verify duplicates are not created
    - Verify count of flashcards with same word remains 1 per user
    - **Validates: Requirements 3.3**

  - [ ]* 5.4 Write unit tests for chat controller flashcard flow
    - Test correct response structure with flashcards present
    - Test correct response structure without flashcards
    - Test graceful handling when flashcard-service is unavailable
    - Test that roleplay mode does not trigger flashcard extraction
    - _Requirements: 3.4, 4.2, 4.3_

- [ ] 6. Frontend flashcard display
  - [ ] 6.1 Add CSS styles for flashcard inline cards
    - Add `.flashcard-inline-list`, `.flashcard-inline-card`, `.flashcard-inline-header`, `.flashcard-inline-word`, `.flashcard-inline-ipa`, `.flashcard-inline-meaning`, `.flashcard-inline-example`, `.flashcard-inline-label`, `.flashcard-inline-icon` styles
    - Style with distinct background color, border, and spacing to differentiate from chat messages
    - Ensure responsive layout for mobile screens
    - Add styles to `frontend/src/styles/components.css`
    - _Requirements: 5.3_

  - [ ] 6.2 Verify FlashcardCard component renders all fields
    - Confirm `FlashcardCard.jsx` displays word (bold), ipa (italic), meaning, and example
    - Confirm it handles null/missing flashcard gracefully
    - _Requirements: 5.2_

  - [ ] 6.3 Verify ChatMessage renders flashcard cards when present
    - Confirm `ChatMessage.jsx` renders `FlashcardCard` components when `message.flashcards` array is non-empty
    - Confirm it renders normally (no flashcard section) when flashcards are absent or empty
    - _Requirements: 5.1, 5.4_

  - [ ]* 6.4 Write unit tests for FlashcardCard component
    - Test renders all 4 fields correctly
    - Test handles missing flashcard prop gracefully (returns null)
    - Test accessibility: icon has aria-hidden
    - File: `frontend/src/components/ui/__tests__/FlashcardCard.test.jsx`
    - _Requirements: 5.2_

  - [ ]* 6.5 Write unit tests for ChatMessage with flashcards
    - Test renders flashcard cards when message has flashcards array
    - Test renders normally when no flashcards
    - Test renders normally when flashcards is empty array
    - File: `frontend/src/components/ui/__tests__/ChatMessage.test.jsx`
    - _Requirements: 5.1, 5.4_

- [ ] 7. Integration verification
  - [ ] 7.1 Verify useChat hook handles flashcard response
    - Confirm `useChat.js` attaches `data.flashcards` to the AI message object when present
    - Confirm it sets `flashcards: undefined` when response has no flashcards
    - _Requirements: 5.1, 5.4_

  - [ ] 7.2 Verify flashcard-service history includes chat-inline source
    - Confirm GET /history endpoint returns flashcards with source "chat-inline" alongside source "ai"
    - Confirm FlashcardStudyPage displays both sources without filtering
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Most core implementation already exists in the codebase; tasks focus on verification, the internal endpoint, styling, and comprehensive testing
- The ai-chat-service uses Jest; the frontend uses Vitest — both support fast-check
- fast-check is already installed in the frontend but needs to be added to ai-chat-service

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "6.1"] },
    { "id": 1, "tasks": ["1.3", "2.1", "3.1", "6.2", "6.3"] },
    { "id": 2, "tasks": ["2.2", "2.3", "3.2", "3.3", "3.4", "3.5", "5.1", "7.1", "7.2"] },
    { "id": 3, "tasks": ["5.2", "5.3", "5.4", "6.4", "6.5"] }
  ]
}
```
