#!/bin/bash
set -e

echo "🚀 Setting up Cortex development environment..."

# Check for required tools
command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting." >&2; exit 1; }
command -v yarn >/dev/null 2>&1 || { echo "❌ Yarn is required but not installed. Aborting." >&2; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
yarn install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
  echo "📝 Creating .env file from template..."
  cp .env.example .env
fi

# Create necessary directories
mkdir -p storage/uploads storage/logs storage/backups

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
timeout 120 bash -c 'until docker-compose ps | grep -q "healthy"; do sleep 2; done'

# Check if NocoBase is accessible
echo "🔍 Checking NocoBase accessibility..."
timeout 60 bash -c 'until curl -f http://localhost:13000/api/app:getInfo >/dev/null 2>&1; do sleep 2; done'

echo "✅ CORTEX DEV ENV READY"
echo "🌐 NocoBase is available at: http://localhost:13000"
echo "🗄️ PostgreSQL is available at: localhost:5432"
echo "📊 Redis is available at: localhost:6379"
