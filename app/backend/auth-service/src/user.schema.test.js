const User = require('./models/user.model');

describe('User schema validation', () => {
  test('requires email and password hash', () => {
    const user = new User({ _id: 'user_1' });
    const error = user.validateSync();

    expect(error).toBeTruthy();
    expect(error.errors.email).toBeDefined();
    expect(error.errors.password_hash).toBeDefined();
  });
});
