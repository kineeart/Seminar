const userRepository = require('./repositories/user.repository');
const { createId } = require('./utils/id');

const hasMongo = Boolean(process.env.MONGODB_URI && process.env.DATABASE_NAME);
const describeIf = hasMongo ? describe : describe.skip;

describeIf('User repository', () => {
  beforeEach(async () => {
    await userRepository.clearUsers();
  });

  test('creates and finds user by email', async () => {
    const email = 'repo@example.com';
    const created = await userRepository.createUser({
      id: createId('user'),
      email,
      passwordHash: 'secret',
    });

    const found = await userRepository.findByEmail(email);

    expect(created).toBeTruthy();
    expect(found).toBeTruthy();
    expect(found.email).toBe(email);
  });
});
