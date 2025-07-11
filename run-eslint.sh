#!/bin/sh

# Create temporary directory for ESLint
mkdir -p ./eslint-temp

# Create a temporary package.json for ESLint
cat > ./eslint-temp/package.json << EOF
{
  "name": "eslint-runner",
  "version": "1.0.0",
  "description": "Temporary package for running ESLint",
  "main": "index.js",
  "license": "MIT",
  "dependencies": {
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0"
  }
}
EOF

# Install dependencies
echo "Installing ESLint and plugins..."
npm install --prefix ./eslint-temp --no-package-lock --no-save --quiet --legacy-peer-deps

# Create a basic ESLint config
cat > ./eslint-temp/eslint.config.js << EOF
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**']
  },
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'warn'
    }
  }
];
EOF

# Run ESLint
echo "Running ESLint checks..."
./eslint-temp/node_modules/.bin/eslint \
  --config ./eslint-temp/eslint.config.js \
  --max-warnings 0 \
  packages/providers/akash \
  packages/workers/jobPoller

# Check exit code
EXIT_CODE=$?
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ ESLint checks passed!"
else
  echo "❌ ESLint checks failed with exit code $EXIT_CODE"
fi

# Clean up
rm -rf ./eslint-temp
rm eslint-package.json

exit $EXIT_CODE
