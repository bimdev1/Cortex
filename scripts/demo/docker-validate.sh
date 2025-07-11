#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Cortex Demo Scripts Validator (Simple) ===${NC}"

# Create a temporary Dockerfile for validation
cat > Dockerfile.simple << EOL
FROM node:18-alpine

WORKDIR /app

# Create directories
RUN mkdir -p scripts/demo storage/demo storage/screenshots

# Copy only the demo scripts
COPY scripts/demo/seed-demo-data.ts scripts/demo/
COPY scripts/demo/generate-screenshots.ts scripts/demo/

# Install dependencies
RUN npm install -g ts-node typescript
RUN npm install @types/node fs-extra playwright

# Create a simple validation script
RUN echo 'console.log("Validating seed-demo-data.ts...");\
try {\
  require("./scripts/demo/seed-demo-data.ts");\
  console.log("✅ seed-demo-data.ts is valid");\
} catch (error) {\
  console.error("❌ Error in seed-demo-data.ts:", error.message);\
}\
\
console.log("\\nValidating generate-screenshots.ts...");\
try {\
  require("./scripts/demo/generate-screenshots.ts");\
  console.log("✅ generate-screenshots.ts is valid");\
} catch (error) {\
  console.error("❌ Error in generate-screenshots.ts:", error.message);\
}' > validate.js

# Run the validation script
CMD ["node", "validate.js"]
EOL

echo -e "${YELLOW}Building Docker container for simple validation...${NC}"

# Build the Docker image
sudo docker build -t cortex-demo-validator-simple -f Dockerfile.simple .

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to build Docker image${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully${NC}"
echo -e "${YELLOW}Running validation in Docker container...${NC}"

# Run the container
sudo docker run --rm cortex-demo-validator-simple

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Validation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Validation completed${NC}"
