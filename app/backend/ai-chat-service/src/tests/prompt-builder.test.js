const { buildTutorPrompt } = require('../utils/prompt-builder');

describe('prompt builder', () => {
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
    expect(prompt).toContain('Use very simple English, short sentences, and one idea at a time.');
    expect(prompt).toContain('1. Student: Hi');
    expect(prompt).toContain('2. Tutor: Hello! How can I help?');
    expect(prompt).toContain('Current user message: Explain present perfect tense');
  });

  test('builds an advanced prompt with precise guidance', () => {
    const prompt = buildTutorPrompt({
      message: 'Compare present perfect and past simple',
      level: 'Advanced',
      history: [],
    });

    expect(prompt).toContain('Learner level: Advanced');
    expect(prompt).toContain('Use concise but precise English with accurate grammar terminology.');
    expect(prompt).toContain('No previous conversation yet.');
  });
});
