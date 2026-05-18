const memory = require('../utils/conversation-memory');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

let mockGenerateContent;

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: (...args) => mockGenerateContent(...args),
    })),
  })),
}));

const geminiService = require('../services/gemini.service');

describeIf('gemini service prompt integration', () => {
  beforeEach(async () => {
    process.env.GEMINI_API_KEY = 'test-key';
    mockGenerateContent = jest
      .fn()
      .mockResolvedValueOnce({
        response: { text: () => 'First tutor reply' },
      })
      .mockResolvedValueOnce({
        response: { text: () => 'Second tutor reply' },
      });

    await memory.resetConversationMemory();
  });

  afterEach(async () => {
    delete process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_MODEL;
    await memory.resetConversationMemory();
    jest.clearAllMocks();
  });

  test('injects learner level and prior conversation into the Gemini prompt', async () => {
    const firstReply = await geminiService.generateResponse({
      message: 'Explain present perfect tense',
      level: 'Beginner',
      conversationId: 'student-1',
    });

    const secondReply = await geminiService.generateResponse({
      message: 'Give me another example',
      level: 'Beginner',
      conversationId: 'student-1',
    });

    expect(firstReply).toBe('First tutor reply');
    expect(secondReply).toBe('Second tutor reply');
    expect(mockGenerateContent).toHaveBeenCalledTimes(2);

    const firstPrompt = mockGenerateContent.mock.calls[0][0];
    const secondPrompt = mockGenerateContent.mock.calls[1][0];

    expect(firstPrompt).toContain('Learner level: Beginner');
    expect(firstPrompt).toContain('Current user message: Explain present perfect tense');
    expect(secondPrompt).toContain('Current user message: Give me another example');
    expect(secondPrompt).toContain('1. Student: Explain present perfect tense');
    expect(secondPrompt).toContain('2. Tutor: First tutor reply');
  });
});
