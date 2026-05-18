# Requirements Document

## Introduction

This feature addresses the lack of interactivity across the frontend pages of the English learning flashcard application. Currently, many visual elements that appear clickable do not provide proper feedback or functional responses. The primary issues include: single-select options on the Onboarding page not showing selection state, the Dashboard page being entirely static with hardcoded data, and the Profile page lacking any interactive editing capabilities. The goal is to make every UI element that looks interactive actually behave interactively with proper visual feedback and state management.

## Glossary

- **Onboarding_Page**: The multi-step personalization page where users select their English level, target exam, learning goals, and favorite topics
- **Dashboard_Page**: The main home page displaying user stats, recent flashcard decks, and recommended actions
- **Quiz_Page**: The page where users answer multiple-choice English questions
- **Chat_Page**: The AI tutor conversation page with knowledge and roleplay modes
- **Flashcard_Study_Page**: The page where users flip through flashcards and mark them as known or unknown
- **Profile_Page**: The page displaying user statistics, weekly activity, and skill progress
- **Option_Card**: A clickable button element in a grid that represents a selectable choice
- **Selection_State**: The visual and data state indicating which option(s) a user has chosen
- **Single_Select_Step**: An onboarding step where only one option can be active at a time (level, exam)
- **Multi_Select_Step**: An onboarding step where multiple options can be toggled (goals, topics)

## Requirements

### Requirement 1: Onboarding Single-Select Visual Feedback

**User Story:** As a user going through onboarding, I want to see which option I selected for level and exam steps, so that I know my choice was registered before clicking Next.

#### Acceptance Criteria

1. WHEN a user clicks an Option_Card on a Single_Select_Step, THE Onboarding_Page SHALL apply the `selected` CSS class to that Option_Card
2. WHEN a user clicks a different Option_Card on the same Single_Select_Step, THE Onboarding_Page SHALL remove the `selected` CSS class from the previously selected Option_Card and apply it to the newly clicked Option_Card
3. WHILE an Option_Card is in the selected state on a Single_Select_Step, THE Onboarding_Page SHALL display only one Option_Card with the `selected` class at any time
4. THE Onboarding_Page SHALL expose the current single-select value (level or exam) as a `selected` property so the UI can determine which Option_Card to highlight

### Requirement 2: Onboarding Multi-Select Visual Feedback

**User Story:** As a user going through onboarding, I want to toggle multiple goals and topics with clear visual feedback, so that I can see all my selections at a glance.

#### Acceptance Criteria

1. WHEN a user clicks an Option_Card on a Multi_Select_Step, THE Onboarding_Page SHALL toggle the `selected` CSS class on that Option_Card
2. WHEN a user clicks a previously selected Option_Card on a Multi_Select_Step, THE Onboarding_Page SHALL remove the `selected` CSS class and remove the option from the selection array
3. THE Onboarding_Page SHALL allow zero or more Option_Cards to have the `selected` class simultaneously on Multi_Select_Steps

### Requirement 3: Onboarding Selection State Persistence Across Steps

**User Story:** As a user navigating between onboarding steps, I want my previous selections to remain visible when I go back, so that I can review and change my choices.

#### Acceptance Criteria

1. WHEN a user clicks Back to return to a previous step, THE Onboarding_Page SHALL display the previously selected Option_Card(s) with the `selected` CSS class
2. WHEN a user clicks Next and then Back, THE Onboarding_Page SHALL preserve the Selection_State for all visited steps

### Requirement 4: Dashboard Interactive Stat Cards

**User Story:** As a user on the dashboard, I want stat cards and recommendation cards to respond to interaction, so that I can navigate to relevant sections of the app.

#### Acceptance Criteria

1. WHEN a user clicks a recommendation card with a navigation target, THE Dashboard_Page SHALL navigate the user to the specified route
2. WHEN a user hovers over an interactive Card element, THE Dashboard_Page SHALL apply a hover visual effect (scale or shadow change) to indicate clickability
3. THE Dashboard_Page SHALL render all Button elements with proper `to` or `onClick` handlers that trigger navigation

### Requirement 5: Quiz Answer Selection Feedback

**User Story:** As a user taking a quiz, I want to see which answer I selected and whether it was correct, so that I get immediate learning feedback.

#### Acceptance Criteria

1. WHEN a user clicks an answer Option_Card, THE Quiz_Page SHALL apply the `selected` CSS class to that Option_Card
2. WHEN a user selects an answer, THE Quiz_Page SHALL display a feedback card indicating whether the answer is correct or incorrect
3. WHEN a user clicks a different answer Option_Card, THE Quiz_Page SHALL move the `selected` CSS class to the newly clicked Option_Card and update the feedback
4. IF no answer is selected and the user clicks Continue, THEN THE Quiz_Page SHALL not advance to the next question

### Requirement 6: Flashcard Flip and Swipe Interaction

**User Story:** As a user studying flashcards, I want to tap a card to flip it and use buttons to mark knowledge, so that I can efficiently review vocabulary.

#### Acceptance Criteria

1. WHEN a user clicks the flashcard Card, THE Flashcard_Study_Page SHALL toggle the `flipped` CSS class to show the back content
2. WHEN a user clicks the Know button, THE Flashcard_Study_Page SHALL apply the `swipe-right` CSS class, increment the known counter, and advance to the next card
3. WHEN a user clicks the Don't Know button, THE Flashcard_Study_Page SHALL apply the `swipe-left` CSS class, increment the unknown counter, and advance to the next card
4. WHEN all cards have been reviewed, THE Flashcard_Study_Page SHALL display the finish summary with correct known and unknown counts

### Requirement 7: Chat Mode Toggle and Message Interaction

**User Story:** As a user chatting with the AI tutor, I want to switch between Knowledge and Roleplay modes and send messages with visible responses, so that I can practice English in different contexts.

#### Acceptance Criteria

1. WHEN a user clicks the Knowledge mode button, THE Chat_Page SHALL apply the `active` CSS class to the Knowledge button and remove it from the Roleplay button
2. WHEN a user clicks the Roleplay mode button, THE Chat_Page SHALL apply the `active` CSS class to the Roleplay button and remove it from the Knowledge button
3. WHEN a user submits a message via the input form, THE Chat_Page SHALL append the user message to the message list and display a typing indicator
4. WHEN the AI response is ready, THE Chat_Page SHALL remove the typing indicator and append the AI message to the message list
5. WHEN a user clicks a quick action button, THE Chat_Page SHALL populate the input with the action text and send it as a message

### Requirement 8: Profile Page Interactive Elements

**User Story:** As a user viewing my profile, I want interactive elements like skill bars and weekly activity to provide visual feedback, so that the page feels responsive and informative.

#### Acceptance Criteria

1. WHEN the Profile_Page loads, THE Profile_Page SHALL render skill ProgressBar components with animated fill based on the skill value
2. WHEN the Profile_Page loads, THE Profile_Page SHALL render weekly activity bars with heights proportional to the activity data
3. WHEN a user hovers over a weekly activity bar, THE Profile_Page SHALL display a tooltip or highlight effect showing the activity value

### Requirement 9: Consistent Hover and Focus States

**User Story:** As a user navigating the app, I want all clickable elements to show hover and focus states, so that I can identify interactive elements and use keyboard navigation.

#### Acceptance Criteria

1. THE application SHALL apply a visible hover state (cursor pointer, background change, or scale effect) to all elements with click handlers
2. THE application SHALL apply a visible focus outline to all interactive elements when focused via keyboard
3. THE application SHALL ensure all Option_Card elements display `cursor: pointer` in their default state
4. IF an interactive element receives keyboard focus, THEN THE application SHALL allow activation via Enter or Space key
