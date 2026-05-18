const flashcardRepository = require('../repositories/flashcard.repository');
const { createId } = require('../utils/id');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('Flashcard repository', () => {
  beforeEach(async () => {
    await flashcardRepository.clearFlashcards();
  });

  test('creates and lists flashcards by user', async () => {
    await flashcardRepository.createFlashcards([
      {
        _id: createId('flashcard'),
        user_id: 'repo-user',
        conversation_id: 'conv-a',
        word: 'adapt',
        ipa: '/əˈdæpt/',
        meaning: 'adjust',
        example: 'Adapt to new situations.',
        source: 'ai',
      },
    ]);

    const list = await flashcardRepository.listFlashcards({ userId: 'repo-user' });
    expect(list.length).toBe(1);
    expect(list[0].word).toBe('adapt');
  });
});
