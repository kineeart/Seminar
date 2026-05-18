# Implementation Plan: UI Interactivity Fix

## Overview

This plan implements interactivity fixes across the English learning flashcard application's frontend. The work involves fixing state-to-class bindings in JSX, adding CSS hover/focus/transition rules, adding ARIA attributes and keyboard handlers, and setting up property-based tests to verify correctness. No new state management or libraries (beyond testing) are needed — the focus is on correctly wiring existing state to the UI.

## Tasks

- [ ] 1. Set up testing infrastructure
  - [ ] 1.1 Install testing dependencies and configure Vitest
    - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check`, and `jsdom` as dev dependencies
    - Add a `vitest.config.js` or extend `vite.config.js` with test configuration using jsdom environment
    - Add `"test": "vitest --run"` script to `package.json`
    - Create `app/frontend/src/__tests__/` directory structure
    - _Requirements: Testing Strategy from design document_

- [ ] 2. Fix Onboarding single-select and multi-select interactivity
  - [ ] 2.1 Fix single-select state binding in OnboardingPage
    - Modify `app/frontend/src/pages/OnboardingPage.jsx` to add `selected` property to single-select step definitions (level and exam steps)
    - Update the option rendering logic to check `current.selected === option` for single-select steps and `current.selected?.includes(option)` for multi-select steps
    - Apply the `selected` CSS class conditionally based on the correct check
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 2.2 Add ARIA attributes and keyboard handlers to Option Cards
    - Add `role="button"`, `tabIndex={0}`, and `aria-pressed` attributes to Option_Card elements in OnboardingPage
    - Add `onKeyDown` handler that triggers selection on Enter or Space key press
    - _Requirements: 9.2, 9.4_

  - [ ]* 2.3 Write property test for single-select exclusivity
    - **Property 1: Single-select exclusivity**
    - Generate random sequences of option clicks on level/exam steps and verify exactly one option is selected at any time
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 2.4 Write property test for multi-select toggle
    - **Property 2: Multi-select toggle**
    - Generate random toggle sequences on goals/topics steps and verify toggling adds/removes without affecting other selections
    - **Validates: Requirements 2.1, 2.2, 2.3**

  - [ ]* 2.5 Write property test for selection state persistence
    - **Property 3: Selection state persistence across navigation**
    - Generate selections then forward/back navigation and verify state is preserved
    - **Validates: Requirements 3.1, 3.2**

- [ ] 3. Checkpoint - Verify onboarding interactivity
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Fix Quiz answer selection feedback
  - [ ] 4.1 Wire quiz answer selection state to UI
    - Modify `app/frontend/src/pages/QuizPage.jsx` to apply `selected` CSS class to the clicked answer Option_Card
    - Display feedback card (correct/incorrect) when an answer is selected
    - Ensure clicking a different answer moves the `selected` class and updates feedback
    - Guard the Continue button so it does not advance when no answer is selected
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 4.2 Add ARIA attributes to quiz answer options
    - Add `role="button"`, `tabIndex={0}`, `aria-pressed`, and keyboard handlers to quiz answer Option_Cards
    - _Requirements: 9.2, 9.4_

  - [ ]* 4.3 Write property test for quiz answer feedback correctness
    - **Property 4: Quiz answer feedback correctness**
    - Generate random question/answer combinations and verify feedback matches correctness
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]* 4.4 Write property test for quiz continue guard
    - **Property 5: Quiz continue guard**
    - Generate quiz states with null selection and verify continue does not advance
    - **Validates: Requirements 5.4**

- [ ] 5. Fix Flashcard flip and swipe interaction
  - [ ] 5.1 Wire flashcard flip and marking state to UI
    - Modify `app/frontend/src/pages/FlashcardStudyPage.jsx` to toggle `flipped` CSS class on card click
    - Apply `swipe-right` class on Know button click and `swipe-left` on Don't Know button click
    - Display finish summary with known/unknown counts when all cards are reviewed
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 5.2 Add keyboard accessibility to flashcard controls
    - Add `role="button"`, `tabIndex={0}`, and keyboard handlers to the flashcard element for flip
    - Ensure Know/Don't Know buttons are accessible via keyboard
    - _Requirements: 9.2, 9.4_

  - [ ]* 5.3 Write property test for flashcard flip toggle
    - **Property 6: Flashcard flip toggle**
    - Generate random flip sequences and verify flipped boolean toggles correctly
    - **Validates: Requirements 6.1**

  - [ ]* 5.4 Write property test for flashcard marking
    - **Property 7: Flashcard marking increments counter and advances**
    - Generate random know/don't-know sequences and verify counters increment and card advances
    - **Validates: Requirements 6.2, 6.3**

  - [ ]* 5.5 Write property test for flashcard completion invariant
    - **Property 8: Flashcard review completion invariant**
    - Generate full review sequences and verify known + unknown = total cards and finished is true
    - **Validates: Requirements 6.4**

- [ ] 6. Checkpoint - Verify quiz and flashcard interactivity
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Fix Chat mode toggle and message interaction
  - [ ] 7.1 Wire chat mode toggle and message state to UI
    - Modify `app/frontend/src/pages/ChatPage.jsx` to apply `active` CSS class to the selected mode button (Knowledge/Roleplay)
    - Ensure submitting a message appends user message to the list and shows typing indicator
    - Ensure AI response replaces typing indicator with AI message
    - Wire quick action buttons to populate input and send as message
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ] 7.2 Add keyboard accessibility to chat mode buttons
    - Add `aria-pressed` attribute to mode toggle buttons reflecting active state
    - Ensure mode buttons and quick action buttons are keyboard accessible
    - _Requirements: 9.2, 9.4_

  - [ ]* 7.3 Write property test for chat mode toggle exclusivity
    - **Property 9: Chat mode toggle exclusivity**
    - Generate random mode switch sequences and verify exactly one mode is active
    - **Validates: Requirements 7.1, 7.2**

  - [ ]* 7.4 Write property test for chat message send
    - **Property 10: Chat message send appends to list**
    - Generate random non-empty strings and verify message list grows by 1 with correct role and text
    - **Validates: Requirements 7.3, 7.5**

- [ ] 8. Fix Dashboard interactive cards
  - [ ] 8.1 Add click handlers and navigation to Dashboard cards
    - Modify `app/frontend/src/pages/DashboardPage.jsx` to add `onClick` handlers or `to` props on recommendation cards for navigation
    - Add `card-interactive` class to cards that have click behavior
    - Ensure all Button elements have proper `to` or `onClick` handlers
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 8.2 Add ARIA and keyboard support to Dashboard cards
    - Add `role="button"`, `tabIndex={0}`, and keyboard handlers to interactive cards
    - _Requirements: 9.2, 9.4_

- [ ] 9. Fix Profile page interactive elements
  - [ ] 9.1 Add animated ProgressBar and weekly activity interactions
    - Modify `app/frontend/src/pages/ProfilePage.jsx` to render ProgressBar with animated fill using CSS transition on width
    - Render weekly activity bars with heights proportional to activity data
    - Add tooltip/highlight on hover for weekly activity bars using `.week-bar-wrap` and `.week-tooltip` pattern
    - _Requirements: 8.1, 8.2, 8.3_

- [ ] 10. Add global CSS hover, focus, and transition styles
  - [ ] 10.1 Add interactive CSS rules to stylesheets
    - Add to `app/frontend/src/styles/components.css`: hover states (transform, border-color), focus-visible outlines, cursor pointer, and transitions for `.option-card`, `.card-interactive`, and button elements
    - Add to `app/frontend/src/styles/dashboard.css`: hover scale/shadow effect for stat and recommendation cards
    - Add `.week-bar-wrap` relative positioning, `.week-tooltip` absolute positioning with opacity transition
    - Add ProgressBar fill transition (`transition: width 0.4s ease`)
    - _Requirements: 9.1, 9.2, 9.3, 4.2_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document using fast-check
- Unit tests validate specific examples and edge cases
- No new state management is introduced — all fixes wire existing hook state to the UI
- The testing infrastructure (task 1) must be completed before any property test tasks can run

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "4.1", "5.1", "7.1", "8.1", "9.1", "10.1"] },
    { "id": 2, "tasks": ["2.2", "4.2", "5.2", "7.2", "8.2"] },
    { "id": 3, "tasks": ["2.3", "2.4", "2.5", "4.3", "4.4", "5.3", "5.4", "5.5", "7.3", "7.4"] }
  ]
}
```
