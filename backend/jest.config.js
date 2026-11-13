/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
      },
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globalSetup: '<rootDir>/tests/setup.ts',
  globalTeardown: '<rootDir>/tests/teardown.ts',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/types/**',
  ],
  testTimeout: 30000,
  verbose: true,
};
