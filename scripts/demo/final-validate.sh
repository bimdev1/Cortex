#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Cortex Demo Scripts Final Validator ===${NC}"

# Create a temporary Dockerfile for validation
cat > Dockerfile.final << EOL
FROM node:18-alpine

WORKDIR /app

# Create directories
RUN mkdir -p scripts/demo storage/demo storage/screenshots

# Copy JavaScript versions of the scripts
COPY scripts/demo/seed-demo-data.js scripts/demo/
COPY scripts/demo/generate-screenshots.js scripts/demo/

# Install dependencies
RUN npm install fs-extra playwright

# Create a simple validation script
RUN echo 'console.log("🌱 Validating seed-demo-data.js...");\
try {\
  const { DemoDataSeeder } = require("./scripts/demo/seed-demo-data.js");\
  console.log("✅ seed-demo-data.js loaded successfully");\
  console.log("Creating demo data seeder instance...");\
  const seeder = new DemoDataSeeder();\
  console.log("✅ DemoDataSeeder instance created");\
  console.log("\\n📸 Validating generate-screenshots.js...");\
  const { ScreenshotGenerator } = require("./scripts/demo/generate-screenshots.js");\
  console.log("✅ generate-screenshots.js loaded successfully");\
  console.log("Creating screenshot generator instance...");\
  const generator = new ScreenshotGenerator();\
  console.log("✅ ScreenshotGenerator instance created");\
  console.log("\\n✅ All demo scripts validated successfully!");\
} catch (error) {\
  console.error("❌ Error during validation:", error);\
  process.exit(1);\
}' > validate.js

# Run the validation script
CMD ["node", "validate.js"]
EOL

echo -e "${YELLOW}Building Docker container for final validation...${NC}"

# Build the Docker image
sudo docker build -t cortex-demo-validator-final -f Dockerfile.final .

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to build Docker image${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully${NC}"
echo -e "${YELLOW}Running validation in Docker container...${NC}"

# Run the container
sudo docker run --rm cortex-demo-validator-final

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Validation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Validation completed successfully${NC}"
echo -e "${BLUE}=== Demo Scripts Ready ===${NC}"
echo -e "${YELLOW}To run the demo scripts in production:${NC}"
echo -e "1. Add the following to package.json scripts:"
echo -e "   \"demo:seed\": \"node scripts/demo/seed-demo-data.js\","
echo -e "   \"demo:screenshots\": \"node scripts/demo/generate-screenshots.js\""
echo -e "2. Install dependencies: npm install playwright fs-extra"
echo -e "3. Run: npm run demo:seed && npm run demo:screenshots"
