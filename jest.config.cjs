const path = require('path');

module.exports = {
  passWithNoTests: true,
  projects: [
    {
      displayName: 'core',
      testMatch: ['<rootDir>/packages/core/**/?(*.)+(spec|test).[jt]s?(x)'],
      preset: 'ts-jest',
      testEnvironment: 'node',
    },
    {
      displayName: 'plugins',
      testMatch: ['<rootDir>/packages/plugins/**/?(*.)+(spec|test).[jt]s?(x)'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      moduleNameMapper: {
        '^@cortex/(.*)$': path.join(__dirname, 'packages/plugins/@cortex/$1/src'),
      },
    },
  ],
  preset: 'ts-jest',
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    '!packages/**/*.d.ts',
    '!packages/**/node_modules/**',
  ],
};
