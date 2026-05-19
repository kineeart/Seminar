const { buildTutorPrompt, buildFlashcardPrompt, isFlashcardRequest } = require('../utils/prompt-builder');

describe('buildTutorPrompt', () => {
  test('builds a beginner-friendly prompt with history', () => {
    const prompt = buildTutorPrompt({
      message: 'Explain present perfect tense',
      level: 'Beginner',
      history: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello! How can I help?' },
      ],
    });

    expect(prompt).toContain('Learner level: Beginner');
    expect(prompt).toContain('Dùng tiếng Việt đơn giản');
    expect(prompt).toContain('1. Student: Hi');
    expect(prompt).toContain('2. Tutor: Hello! How can I help?');
    expect(prompt).toContain('Student message: Explain present perfect tense');
  });

  test('builds an advanced prompt with precise guidance', () => {
    const prompt = buildTutorPrompt({
      message: 'Compare present perfect and past simple',
      level: 'Advanced',
      history: [],
    });

    expect(prompt).toContain('Learner level: Advanced');
    expect(prompt).toContain('Giải thích chính xác với thuật ngữ ngữ pháp');
    expect(prompt).toContain('No previous conversation yet.');
  });

  test('does NOT include flashcard instructions for normal messages', () => {
    const prompt = buildTutorPrompt({
      message: 'Explain the difference between will and going to',
      level: 'Intermediate',
      history: [],
    });

    expect(prompt).not.toContain('FLASHCARD OUTPUT FORMAT');
    expect(prompt).toContain('IMPORTANT: Keep your reply between 5-15 sentences');
  });
});

describe('buildFlashcardPrompt', () => {
  test('includes flashcard generation instructions', () => {
    const prompt = buildFlashcardPrompt({
      message: 'Tạo flashcard về chủ đề travel',
      level: 'Intermediate',
      history: [],
    });

    expect(prompt).toContain('```flashcards');
    expect(prompt).toContain('YOU MUST FOLLOW THIS EXACTLY');
    expect(prompt).toContain('Student request: Tạo flashcard về chủ đề travel');
  });

  test('includes conversation history', () => {
    const prompt = buildFlashcardPrompt({
      message: 'Tạo thêm flashcard',
      level: 'Beginner',
      history: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello!' },
      ],
    });

    expect(prompt).toContain('1. Student: Hi');
    expect(prompt).toContain('2. Tutor: Hello!');
    expect(prompt).toContain('Student level: Beginner');
  });
});

describe('isFlashcardRequest', () => {
  test('detects Vietnamese flashcard keywords', () => {
    expect(isFlashcardRequest('tạo flashcard về travel')).toBe(true);
    expect(isFlashcardRequest('Cho tôi flashcard chủ đề food')).toBe(true);
    expect(isFlashcardRequest('tạo từ vựng về business')).toBe(true);
    expect(isFlashcardRequest('tạo thêm flashcard')).toBe(true);
    expect(isFlashcardRequest('tạo ít nhất 10 từ')).toBe(true);
    expect(isFlashcardRequest('tạo cho tôi từ vựng')).toBe(true);
  });

  test('detects English flashcard keywords', () => {
    expect(isFlashcardRequest('create flashcard about animals')).toBe(true);
    expect(isFlashcardRequest('I want some flashcard for TOEIC')).toBe(true);
    expect(isFlashcardRequest('generate flashcard please')).toBe(true);
  });

  test('returns false for normal messages', () => {
    expect(isFlashcardRequest('Explain present perfect')).toBe(false);
    expect(isFlashcardRequest('What is the difference between will and going to?')).toBe(false);
    expect(isFlashcardRequest('')).toBe(false);
    expect(isFlashcardRequest(null)).toBe(false);
  });
});
