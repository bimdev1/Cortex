---
sidebar_position: 1
---

# Installation Guide

This guide walks you through installing and configuring Cortex on your local machine or server.

## System Requirements

- **Operating System**: Linux, macOS, or Windows with WSL2
- **Docker**: v20.10 or higher
- **Node.js**: v16.x or higher
- **Yarn**: v1.22 or higher
- **Storage**: At least 2GB of free disk space

## Installation Options

### Option 1: Docker Compose (Recommended)

The fastest way to get started with Cortex is using our pre-configured Docker Compose setup:

```bash
# Clone the repository
git clone https://github.com/cortex-platform/cortex.git
cd cortex

# Start the services
docker-compose up -d
```

This will start:
- Cortex API server on port 13000
- Web dashboard on port 3000
- Background workers for job polling
- Local database for development

Access the dashboard at http://localhost:3000

### Option 2: Manual Installation

For more control over the installation process:

```bash
# Clone the repository
git clone https://github.com/cortex-platform/cortex.git
cd cortex

# Install dependencies
yarn install

# Build packages
yarn build

# Start the API server
yarn dev:nocobase

# In another terminal, start the workers
yarn dev:workers
```

## Configuration

### Provider Configuration

To connect to DePIN networks, you'll need to configure provider credentials:

1. Copy the example config files:
   ```bash
   cp config/providers/akash.example.json config/providers/akash.json
   ```

2. Edit the configuration with your provider credentials:
   ```json
   {
     "mnemonic": "your wallet mnemonic",
     "endpoints": ["https://akash-rpc.polkachu.com:443"],
     "gasPrice": "0.025uakt"
   }
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Server configuration
PORT=13000
NODE_ENV=development

# Database configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cortex
DB_USER=postgres
DB_PASS=postgres

# Security
JWT_SECRET=your-secure-jwt-secret
```

## Verifying Installation

To verify your installation is working correctly:

1. Open the dashboard at http://localhost:3000
2. Navigate to the Networks tab
3. Check that at least one provider shows as "Connected"

## Troubleshooting

### Common Issues

**API server won't start**
- Check database connection settings
- Verify port 13000 is not in use by another application

**Provider connection fails**
- Verify your provider credentials
- Check network connectivity to provider endpoints
- Ensure your wallet has sufficient funds

**Workers not processing jobs**
- Check worker logs: `docker-compose logs -f worker`
- Verify message queue connection

## Next Steps

Now that you have Cortex installed, proceed to the [Quick Start Guide](./quick-start) to submit your first job.
