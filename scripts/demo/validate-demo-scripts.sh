#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Cortex Demo Scripts Validator ===${NC}"
echo -e "${YELLOW}Building Docker container for demo scripts validation...${NC}"

# Build the Docker image
sudo docker build -t cortex-demo-validator -f scripts/demo/Dockerfile.demo .

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Failed to build Docker image${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Docker image built successfully${NC}"
echo -e "${YELLOW}Running demo scripts in Docker container...${NC}"

# Run the container with volume mount for output
sudo docker run --rm -v "$(pwd)/storage:/app/storage" cortex-demo-validator

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Demo scripts execution failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Demo scripts executed successfully${NC}"
echo -e "${BLUE}=== Validation Results ===${NC}"

# Check if output files were created
if [ -d "$(pwd)/storage/demo" ] && [ "$(ls -A $(pwd)/storage/demo)" ]; then
  echo -e "${GREEN}✓ Demo data generated in storage/demo/${NC}"
  echo -e "${YELLOW}Files:${NC}"
  ls -la $(pwd)/storage/demo
else
  echo -e "${RED}✗ No demo data generated in storage/demo/${NC}"
fi

if [ -d "$(pwd)/storage/screenshots" ] && [ "$(ls -A $(pwd)/storage/screenshots)" ]; then
  echo -e "${GREEN}✓ Screenshots generated in storage/screenshots/${NC}"
  echo -e "${YELLOW}Files:${NC}"
  ls -la $(pwd)/storage/screenshots
else
  echo -e "${RED}✗ No screenshots generated in storage/screenshots/${NC}"
fi

echo -e "${BLUE}=== Validation Complete ===${NC}"
