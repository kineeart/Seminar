const dotenv = require('dotenv');
const path = require('path');

const envPath = path.resolve(__dirname, '../../../.env');

dotenv.config({
  path: envPath,
  override: true,
});

console.log(`[CONFIG] Loaded env from: ${envPath}`);

if (process.env.MONGODB_URI) {
  console.log('[CONFIG] MONGODB_URI detected');
}

const app = require('./app');
const flashcardRepository = require('./repositories/flashcard.repository');
const { connectWithRetry, registerGracefulShutdown } = require('../../shared/database');

const PORT = process.env.FLASHCARD_SERVICE_PORT || process.env.PORT || 3003;

const demoCards = [
  {
    word: 'acquire',
    ipa: '/əˈkwaɪər/',
    meaning: 'to get or obtain something',
    example: 'She acquired new skills quickly.',
  },
  {
    word: 'productivity',
    ipa: '/ˌprɑː.dʌkˈtɪv.ə.ti/',
    meaning: 'the rate of producing goods or working efficiently',
    example: 'Good planning improves productivity.',
  },
  {
    word: 'negotiate',
    ipa: '/nɪˈɡoʊ.ʃi.eɪt/',
    meaning: 'to discuss something in order to reach an agreement',
    example: 'They negotiated a better contract.',
  },
  {
    word: 'reliable',
    ipa: '/rɪˈlaɪ.ə.bəl/',
    meaning: 'able to be trusted or depended on',
    example: 'This method is reliable for beginners.',
  },
];

async function seedForUser(userId) {
  const existing = await flashcardRepository.listFlashcards({ userId, limit: 1 });
  if (existing.length > 0) {
    return false;
  }

  await flashcardRepository.seedFlashcards(demoCards.map((card, index) => ({
    _id: `seed-${userId}-${index + 1}`,
    user_id: userId,
    conversation_id: `seed-conversation-${userId}`,
    word: card.word,
    ipa: card.ipa,
    meaning: card.meaning,
    example: card.example,
    source: 'seed',
  })));

  return true;
}

async function seedDemoFlashcards() {
  const configuredUserIds = String(process.env.FLASHCARD_SEED_USER_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const userIds = configuredUserIds.length ? configuredUserIds : ['guest'];

  let seededCount = 0;
  for (const userId of userIds) {
    const seeded = await seedForUser(userId);
    if (seeded) {
      seededCount += 1;
    }
  }

  console.log(`[SEED] Flashcard demo data inserted for ${seededCount} user(s)`);
}

async function startServer() {
  try {
    await connectWithRetry({ appName: 'flashcard-service' });
    await seedDemoFlashcards();

    registerGracefulShutdown();

    app.listen(PORT, () => {
      console.log(`flashcard-service listening on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to start flashcard-service:', err.message);
    process.exit(1);
  }
}

startServer();
