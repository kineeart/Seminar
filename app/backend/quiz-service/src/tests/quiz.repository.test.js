const store = require('../storage');
const { createId } = require('../utils/id');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('Quiz repository', () => {
  test('creates and retrieves a quiz', async () => {
    const quiz = {
      id: createId('quiz'),
      user_id: 'repo-user',
      title: 'Repo Quiz',
      source: 'manual',
      generated_from: {
        lesson_id: null,
        topic: 'general',
        weak_topics: [],
        chat_session_ids: [],
        flashcard_ids: [],
      },
      target_exam: null,
      level_tag: null,
      difficulty: 'easy',
      questions: [
        {
          question_id: createId('question'),
          question: 'Pick A',
          options: ['A', 'B'],
          correct_answer: 'A',
          explanation: 'Because A',
          skill_tag: 'vocab',
        },
      ],
    };

    const saved = await store.createQuiz(quiz);
    const loaded = await store.getQuiz(saved.id);

    expect(loaded).toBeTruthy();
    expect(loaded.title).toBe('Repo Quiz');
  });
});
