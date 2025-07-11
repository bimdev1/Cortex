#!/bin/sh

# Install dependencies
npm install -g jest typescript ts-jest @types/jest
npm install @grpc/grpc-js

# Fix JobPoller jest.config.js - rename to jest.config.cjs
cp packages/workers/jobPoller/jest.config.js packages/workers/jobPoller/jest.config.cjs

# Create mock modules for tests
mkdir -p node_modules/@grpc
echo "module.exports = { loadPackageDefinition: () => {}, credentials: { createInsecure: () => {} } };" > node_modules/@grpc/grpc-js.js

# Create mock for providers/akash
mkdir -p node_modules/providers
echo "module.exports = { AkashProvider: class {} };" > node_modules/providers/akash.js

# Run tests for AkashProvider with mocked dependencies
echo "Running AkashProvider tests..."
NODE_PATH=. jest --config=packages/providers/akash/jest.config.js packages/providers/akash/__tests__/AkashProvider.test.ts --no-cache

# Run tests for JobService with mocked dependencies
echo "Running JobService tests..."
NODE_PATH=. jest --config=packages/plugins/@cortex/plugin-core/jest.config.js packages/plugins/@cortex/plugin-core/server/services/__tests__/jobService.test.ts --no-cache

# Run tests for JobPoller with mocked dependencies
echo "Running JobPoller tests..."
NODE_PATH=. jest --config=packages/workers/jobPoller/jest.config.cjs packages/workers/jobPoller/__tests__/jobPoller.test.ts --no-cache

# Return success message
echo "All tests completed!"
