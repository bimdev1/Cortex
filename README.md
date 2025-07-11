# Cortex - Multi-DePIN Orchestration Platform

A NocoBase-powered platform for orchestrating compute jobs across multiple decentralized physical infrastructure networks (DePINs).

## Quick Start

### Prerequisites

- Node.js 18+
- Yarn 1.22+
- Docker & Docker Compose

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd cortex

# Run the setup script
./scripts/setup/setup-cortex.sh
```

## Development

- NocoBase UI: http://localhost:13000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Commands

- `yarn dev` - Start development environment
- `yarn build` - Build all packages
- `yarn lint` - Lint TypeScript code
- `yarn type-check` - Run TypeScript type checking

## Project Structure

```
cortex/
├── packages/core/           # Core NocoBase application
├── packages/plugins/@cortex/ # Custom Cortex plugins
├── docker/                 # Docker configurations
├── scripts/                # Utility scripts
└── docs/                   # Documentation
```

## License

MIT
