const path = require('path');

module.exports = {
  rootDir: '.',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: [require.resolve('@testing-library/jest-dom')],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};
