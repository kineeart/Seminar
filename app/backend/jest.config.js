module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: [
    '<rootDir>/auth-service/src/**/*.test.js',
    '<rootDir>/gateway/src/**/*.test.js',
    '<rootDir>/ai-chat-service/src/**/*.test.js',
    '<rootDir>/flashcard-service/src/**/*.test.js',
    '<rootDir>/content-service/src/**/*.test.js',
    '<rootDir>/quiz-service/src/**/*.test.js'
  ],
  collectCoverageFrom: [
    'auth-service/src/**/*.js',
    'gateway/src/**/*.js',
    'ai-chat-service/src/**/*.js',
    'flashcard-service/src/**/*.js',
    'content-service/src/**/*.js',
    'quiz-service/src/**/*.js',
    '!**/*.test.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/']
};
