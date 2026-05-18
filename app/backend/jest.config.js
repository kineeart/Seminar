module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  testMatch: [
    '<rootDir>/auth-service/src/**/*.test.js',
    '<rootDir>/gateway/src/**/*.test.js',
    '<rootDir>/content-service/src/**/*.test.js',
    '<rootDir>/quiz-service/src/**/*.test.js'
  ],
  collectCoverageFrom: [
    'auth-service/src/**/*.js',
    'gateway/src/**/*.js',
    'content-service/src/**/*.js',
    'quiz-service/src/**/*.js',
    '!**/*.test.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/']
};
