module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  testMatch: [
    '<rootDir>/auth-service/src/**/*.test.js',
    '<rootDir>/gateway/src/**/*.test.js'
  ],
  collectCoverageFrom: [
    'auth-service/src/**/*.js',
    'gateway/src/**/*.js',
    '!**/*.test.js'
  ],
  coveragePathIgnorePatterns: ['/node_modules/']
};
