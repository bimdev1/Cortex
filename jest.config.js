import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
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
  collectCoverageFrom: [
    'packages/**/*.{ts,tsx}',
    '!packages/**/*.d.ts',
    '!packages/**/node_modules/**',
  ],
};
