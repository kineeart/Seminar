const progressService = require('../services/progress.service');
const mongoose = require('mongoose');
const { connectWithRetry, disconnectMongo } = require('../../../shared/database');
require('../storage/mongo-store');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('Progress Service', () => {
  beforeAll(async () => {
    await connectWithRetry({ appName: 'quiz-service-progress-test' });
  }, 30000);

  afterAll(async () => {
    await disconnectMongo();
  }, 30000);

  beforeEach(async () => {
    const Progress = mongoose.models.Progress;
    if (Progress) {
      await Progress.deleteMany({});
    }
  }, 30000);

  test('records flashcard review into persistent progress', async () => {
    const progress = await progressService.recordFlashcardReview({
      userId: 'progress-user',
      reviewedAt: new Date().toISOString(),
    });

    expect(progress.flashcards_completed).toBe(1);
    expect(progress.learned_words_count).toBe(1);
    expect(progress.streak_days).toBe(1);
    expect(progress.daily_activity.length).toBe(1);
    expect(progress.daily_activity[0].flashcards_reviewed).toBe(1);
    expect(progress.daily_activity[0].learned_words).toBe(1);
  }, 30000);

  test('records chat activity into persistent progress', async () => {
    const progress = await progressService.recordChatActivity({
      userId: 'chat-progress-user',
      messageCount: 3,
      activityAt: new Date().toISOString(),
    });

    expect(progress.total_chat_sessions).toBe(1);
    expect(progress.streak_days).toBe(1);
    expect(progress.daily_activity.length).toBe(1);
    expect(progress.daily_activity[0].chat_sessions).toBe(1);
    expect(progress.daily_activity[0].messages_sent).toBe(3);
  }, 30000);
});
