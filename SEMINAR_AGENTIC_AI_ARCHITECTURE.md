# 🤖 Agentic AI Architecture in the AI English Tutor

## 1. Overview: What Makes This "Agentic"?

**Agentic AI** = AI that:
- ✅ Perceives context (user level, chat history, learning goals)
- ✅ Reasons about goals (what should user learn next?)
- ✅ Takes actions (generate content, invoke services, adapt response)
- ✅ Reflects on outcome (feedback loop → next action)

**Current Status**: MVP uses "Functional AI" (stateless Gemini calls). **Future roadmap** includes full agentic loops.

---

## 2. MVP: Functional AI Components

### 2.1 Chat Agent (Knowledge Mode)

**Trigger**: User asks a question in Knowledge mode

**Agent Flow**:
```
1. INPUT: User query + context (level, exam_target, language)
2. PERCEPTION: 
   - Fetch user profile (level, exam target)
   - Fetch recent chat history (last 5 messages for context)
   - Identify topic from query
3. REASONING:
   - Determine if question is within scope (English learning)
   - Select response template (Explanation → Formula → Example)
   - Estimate word count budget (<80 words)
4. ACTION:
   - Call Gemini API with prompt:
     "You are an English tutor for {level} learners aiming at {exam_target}.
      User asked: {query}
      Respond in <80 words following: Explanation → Formula → Example format.
      Use practical vocabulary."
5. ADAPTATION:
   - Gemini returns response
   - If response too long → truncate to key phrase
   - If no example → add one from cache
6. OUTPUT:
   - Stream response to frontend
   - Store in chat_messages collection
7. REFLECTION:
   - Track token usage, response latency
   - On error → fallback to rule-based response
   - Update user analytics event
```

**Code Architecture**:
```
ai-chat-service/
├── controllers/
│   └── chat.controller.js → Request handling
├── services/
│   ├── chat.service.js → Session management
│   ├── gemini.service.js → Gemini API calls
│   └── context.service.js → User context fetching
├── middleware/
│   ├── auth.middleware.js → JWT validation
│   └── context.middleware.js → Attach user context to req
├── prompts/
│   ├── knowledge.prompt.js → Knowledge mode system prompt
│   └── roleplay.prompt.js → Roleplay mode system prompt
└── models/
    └── Message.js → Mongoose schema
```

### 2.2 Chat Agent (Roleplay Mode)

**Trigger**: User switches to Roleplay mode or continues conversation

**Agent Flow**:
```
1. CONTEXT SETUP:
   - Load chat session history
   - Detect scenario (interview, casual chat, business meeting, etc.)
   - Infer user's language level from previous messages
   
2. ROLE DEFINITION:
   - AI chooses realistic character (waiter, job interviewer, friend, etc.)
   - Align difficulty to user level + exam target
   
3. DIALOGUE GENERATION:
   - Call Gemini with prompt:
     "You are a {role} in {scenario}. 
      User is {level} English learner targeting {exam}.
      Keep dialogue natural, use vocabulary for {exam}.
      When user responds, provide:
      - Feedback on grammar/vocabulary (if wrong, gentle correction)
      - Continue the conversation naturally
      - Include 1-2 new vocabulary items per exchange"
   
4. STREAMING:
   - Stream response character-by-character for immersion
   - Frontend shows typing indicator
   
5. PERSISTENCE:
   - Save entire exchange in chat_messages
   - Extract key phrases → suggest flashcard
   
6. ADAPTATION:
   - If user struggles → simplify vocabulary
   - If user excels → increase complexity
   - Track this in session metadata
```

---

## 3. Service-Level AI: Flashcard & Quiz Generation

### 3.1 Flashcard Generation Agent

**Trigger**: User clicks "Create Flashcard" or system auto-suggests

**Agent Flow**:
```
INPUT: 
  - User message: "What's the difference between 'since' and 'for'?"
  - User level: Beginner
  - Recent context: 10 previous messages

PERCEPTION:
  - Parse user question → Extract learning objective
  - Scan chat history for related discussion points
  - Check if similar flashcard exists

REASONING:
  - What's the minimal useful card?
  - Front side: "Difference: 'since' vs 'for'"
  - Back side: Include rule + 2 examples
  - Difficulty level: Beginner → Simple language in explanation

ACTION (Gemini prompt):
  "Create a flashcard for English learners.
   User level: Beginner
   Topic: Difference between 'since' and 'for'
   Front (question): {auto-generated or user input}
   Back (answer): Rule explanation + 2 practical examples
   Keep back side under 150 words."

OUTPUT:
  - Store in flashcards collection
  - Set initial SM-2 params (interval=1 day, ease=2.5, reviewed=false)
  - Add to user's "Today's Flashcards" queue

REFLECTION:
  - Analytics: flashcard_created event
  - Link: source_message_id → chat_messages
```

### 3.2 Quiz Generation Agent

**Trigger**: User clicks "Quiz" or system recommends daily quiz

**Agent Flow**:
```
INPUT:
  - User level: Intermediate
  - Exam target: TOEIC
  - Recent topics: phrasal verbs, past perfect, business vocabulary
  - Weakness areas: (from progress tracking)

PERCEPTION:
  - Query flashcards + quiz history
  - Identify weak areas (low accuracy in recent attempts)
  - Select 5-10 relevant topics

REASONING:
  - Quiz should cover:
    1. Recent learning (recent topics)
    2. Weak areas (low mastery)
    3. Mix: 30% recall, 40% understanding, 30% application
  - Difficulty: match user level + exam format

ACTION (Gemini prompt):
  "Generate TOEIC-style quiz for Intermediate learner.
   Topics: {selected topics}
   Format: 
     - 5 multiple choice questions
     - Each with 4 options (A/B/C/D)
     - Include 1-2 challenging questions
   Return JSON:
   {
     questions: [
       { id, question_text, options[], correct_answer, difficulty }
     ]
   }"

OUTPUT:
  - Store quiz document with question array
  - Generate explanation for each question (Gemini calls)
  - Present to user in quiz UI

SCORING:
  - Grade user answers (string match or AI-score for free-text)
  - Calculate score ∈ [0, 100]
  - Generate personalized feedback

REFLECTION:
  - Store quiz_result
  - Update user progress (quizzes_completed++, score history)
  - Update weak areas tracker
  - Next quiz recommendation: focus on weakness
```

---

## 4. Cross-Service AI Orchestration (Planning)

### 4.1 Learning Path Agent (Future)

**Vision**: AI decides optimal learning sequence

**Agent Reasoning Loop**:
```
1. OBSERVE user state:
   - Current level, target exam, learning goals
   - Recent quiz scores, flashcard accuracy
   - Streak status, time available today
   - What user already knows (from progress)

2. PLAN next action:
   - IF streak_active AND quiz_completed → 
     Recommend flashcard review (reinforce)
   - IF quiz_score < 60% → 
     Recommend knowledge chat on weak topics
   - IF time > 20 min → 
     Suggest comprehensive quiz
   - IF time < 5 min → 
     Suggest quick flashcard drill

3. EXECUTE:
   - Route user to recommended activity
   - Pre-warm cache (load relevant content)
   
4. REFLECT:
   - Track: Did user follow recommendation?
   - If yes, did learning improve?
   - Adjust recommendation model
```

### 4.2 Content Generation Pipeline

```
Gemini calls across services:

ai-chat-service/
  ├─ Answer user query
  └─ → Trigger: "Suggest flashcard?" button
       → flashcard-service/
           └─ Generate flashcard front/back

quiz-service/
  ├─ On "Take Quiz" → Gemini generates questions
  ├─ On "Explain" → Gemini creates explanation
  └─ On quiz done → Trigger progress-update → 
      → quiz-service updates progress collection →
      → quiz-service calls learning-path-agent (future)
```

---

## 5. Prompt Engineering Strategy

### 5.1 Prompt Hierarchy

**Level 1: System Prompt** (defines role)
```
"You are an English tutor for {level} learners.
 Your goal: explain concepts in <80 words.
 Format: Explanation → Formula → Example.
 Use vocabulary appropriate for {exam_target}.
 Be encouraging and practical."
```

**Level 2: Context Prompt** (adds state)
```
"User has been learning for {days} days.
 Previous strength: {strong_topics}
 Previous weakness: {weak_topics}
 Today's mood/energy: {inferred from chat tone}
 Adapt explanation accordingly."
```

**Level 3: Task Prompt** (specific request)
```
"User asked: {user_query}
 In <80 words, explain {topic}.
 Include {number} example(s).
 Use {style} tone (casual/formal/funny)."
```

### 5.2 Prompt Optimization (Vibe Coding)

All prompts stored in `SYSTEM_PROMPTS.md`:
```markdown
## Knowledge Mode
### For Beginners
"Explain the concept simply. No jargon."

### For Intermediate
"Include one practical example."

### For Advanced
"Explain the nuance. Why it matters."

## Roleplay Mode
### Interview Scenario
"You are an HR interviewer..."

### Casual Chat
"You are a friend..."
```

**AI can auto-generate new prompts** for new scenarios, developer reviews.

---

## 6. Error Handling & Fallback (Agent Resilience)

### 6.1 Gemini API Failure Modes

```
FAILURE CASE: API returns 429 (Quota Exceeded)
├─ Count: retry with exponential backoff
├─ Action: Cache previous responses, serve from cache
└─ Future: Route to alternative LLM

FAILURE CASE: API returns garbage
├─ Detect: Token validation, coherence check
├─ Action: Regenerate with different prompt
└─ Track: Increment error counter

FAILURE CASE: Network timeout
├─ Action: Show "Thinking..." → Timeout after 30s
├─ Fallback: Serve rule-based response
└─ Example: "I didn't understand. Try rephrasing."

FAILURE CASE: User input is out-of-scope
├─ Detect: Classify intent (is this English learning?)
├─ Action: Politely redirect
└─ Example: "That's interesting, but let's focus on English. 
            What grammar topic can I help with?"
```

---

## 7. Metrics & Feedback Loop

### 7.1 Agentic Metrics

| Metric | Meaning | Action |
|--------|---------|--------|
| **Latency** | API call time | Optimize prompt, use caching |
| **Fallback Rate** | % times quota exceeded | Scale replicas, use cheaper model |
| **User Satisfaction** (future) | Thumbs up/down on response | Retrain prompt if <50% |
| **Learning Outcome** | Quiz score improvement | Adjust content difficulty |
| **Completion Rate** | % users finish daily streak | Adjust recommendation timing |

### 7.2 Feedback Integration (Agent Learning)

```
User rates response: 👍 (like) or 👎 (dislike)
├─ Store: {quiz_id, response_id, rating, timestamp}
├─ Analyze: Which prompts get high ratings?
├─ Update: Adjust system prompt weights (future: fine-tuning)
└─ Regenerate: Similar questions → use winning prompt
```

---

## 8. Current vs. Future Agentic State

### MVP (Current - Phase 5)
```
✅ Stateless Gemini calls (each request independent)
✅ Prompt-based adaptation (level, exam_target in prompt)
✅ Simple fallback (rule-based if quota exceeded)
✅ No memory (each conversation starts fresh except history)
✅ No tool use (Gemini only generates text)
```

### Post-MVP (Future Roadmap)
```
🔮 Stateful memory (vector DB for semantic search)
🔮 Multi-step planning (AI decides sequence: chat→quiz→flashcard)
🔮 Tool orchestration (AI calls flashcard-service, quiz-service APIs)
🔮 Fine-tuned model (proprietary Gemini task adapters)
🔮 Multi-agent (specialist agents for grammar, vocab, roleplay)
🔮 Real-time adaptation (adjust mid-conversation)
```

---

## 9. Implementation Code Examples

### 9.1 Knowledge Mode Agent (Simplified)

```javascript
// ai-chat-service/src/services/chat.service.js

class ChatService {
  async generateKnowledgeResponse(userId, query) {
    // 1. PERCEPTION: Fetch context
    const user = await userService.getUserProfile(userId);
    const history = await this.chatRepository.getRecentMessages(userId, 5);
    
    // 2. REASONING: Build prompt
    const systemPrompt = `You are an English tutor for ${user.current_level} learners.
      Target: ${user.target_exam}.
      Format: Explanation (1-2 sentences) → Formula/Rule → Example.
      Max 80 words. Practical vocabulary only.`;
    
    const userPrompt = `${query}\n\nRecent context:\n${history.map(m => m.content).join('\n')}`;
    
    // 3. ACTION: Call Gemini
    try {
      const response = await geminiService.generateText({
        systemPrompt,
        userPrompt,
        maxTokens: 100,
        temperature: 0.7
      });
      
      // 4. REFLECTION: Store & track
      await this.chatRepository.saveMessage({
        user_id: userId,
        role: 'assistant',
        content: response,
        tokens_used: response.token_count
      });
      
      analyticsService.track({
        event: 'chat_response_generated',
        user_id: userId,
        latency: Date.now() - start,
        mode: 'knowledge'
      });
      
      return response;
    } catch (error) {
      // Fallback
      return this.fallbackResponse(query, user.current_level);
    }
  }
  
  fallbackResponse(query, level) {
    // Rule-based templates
    if (query.includes('grammar')) {
      return `Grammar tip: Check your sentence structure. 
              Subject → Verb → Object order.`;
    }
    return `I didn't understand. Try rephrasing?`;
  }
}
```

### 9.2 Flashcard Generation Agent

```javascript
// flashcard-service/src/services/flashcard.service.js

class FlashcardService {
  async generateFromMessage(userId, messageId) {
    // 1. PERCEPTION
    const message = await chatRepository.getMessage(messageId);
    const user = await userService.getUserProfile(userId);
    
    // 2. REASONING
    const topic = extractTopic(message.content);
    const existingCard = await this.repository.findByTopic(userId, topic);
    if (existingCard) return existingCard; // Already exists
    
    // 3. ACTION: Gemini generates flashcard
    const geminiPrompt = `Create an English learning flashcard.
      Level: ${user.current_level}
      Topic: ${topic}
      From message: "${message.content}"
      
      Respond with JSON:
      {
        front: "Question or prompt",
        back: "Explanation + example (max 150 words)"
      }`;
    
    const flashcardData = await geminiService.generateJson(geminiPrompt);
    
    // 4. REFLECTION: Store with SM-2 algorithm
    const flashcard = await this.repository.create({
      user_id: userId,
      front: flashcardData.front,
      back: flashcardData.back,
      source_message_id: messageId,
      difficulty: 'medium',
      interval: 1,
      ease_factor: 2.5,
      next_review_date: tomorrow()
    });
    
    return flashcard;
  }
}
```

---

## 10. Why This Design is "Agentic"

✅ **Perception**: Fetches user context, chat history, performance data  
✅ **Reasoning**: Makes decisions (what mode, what difficulty, what next activity)  
✅ **Action**: Calls external APIs (Gemini), invokes service operations  
✅ **Reflection**: Tracks metrics, adjusts future behavior  
✅ **Scalability**: Stateless → replicate agents across containers  

**Key Insight**: Even "simple" Gemini calls become agentic when wrapped with:
- Context awareness
- Prompt engineering
- Error handling
- Feedback loops
- Service orchestration

---

## 11. Agentic AI in Vibe Coding Context

### Why AI agents fit "Vibe Coding":
1. **Predictable outputs** → AI can generate similar agents for new features
2. **Composable services** → Each service is independently agentic
3. **Testable** → Mock Gemini responses, verify agent behavior
4. **Scalable rapidly** → Add new learning modality = new agent service

### Handoff pattern:
```
1. Developer writes: "Create vocabulary quiz agent"
2. AI generates: quiz-service with agentic flow above
3. Developer reviews:
   - Prompt tuning
   - Error handling
   - Analytics events
4. AI refines based on feedback
5. Deploy & monitor
```

---

## References

- `SYSTEM_PROMPTS.md` — Full prompt library
- `PHASE_2_AI_CHAT_NOTES.md` — Gemini integration details
- `PHASE_3_FLASHCARD_REASONING.md` — Spaced repetition logic
- `PHASE_4_QUIZ_REASONING.md` — Quiz generation details
