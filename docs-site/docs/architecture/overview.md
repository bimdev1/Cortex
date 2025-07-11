---
sidebar_position: 1
---

# Architecture Overview

Cortex is designed as a modular, extensible platform for orchestrating compute workloads across decentralized physical infrastructure networks (DePINs). This document provides a high-level overview of the Cortex architecture.

## System Architecture

Cortex follows a plugin-based microservices architecture with a clear separation of concerns:

![Cortex Architecture Diagram](/img/architecture-overview.png)

### Core Components

| Component | Description |
|-----------|-------------|
| **Core Engine** | Central orchestration layer that manages jobs, providers, and system state |
| **Plugin System** | Extensible framework for adding new providers, features, and integrations |
| **Provider Adapters** | Network-specific adapters for interacting with DePIN networks |
| **Job Service** | Manages job lifecycle, scheduling, and execution |
| **Database** | Persistent storage for system state and job history |
| **API Layer** | RESTful and GraphQL APIs for external integrations |
| **UI Dashboard** | Web-based user interface for system management |
| **Background Workers** | Asynchronous task processors for long-running operations |

## Data Flow

The typical data flow for a job in Cortex:

1. **Job Submission**: User submits a job via UI or API
2. **Validation**: Core Engine validates job configuration
3. **Provider Selection**: System selects appropriate provider based on job requirements
4. **Deployment**: Provider adapter deploys job to selected network
5. **Monitoring**: Background workers monitor job status and resource usage
6. **Completion**: Job completes, results are stored, and notifications are sent
7. **Billing**: Usage is calculated and recorded for billing purposes

## Plugin System

Cortex's plugin architecture enables extensibility without modifying core code:

```
/packages
  /plugin-core        # Core functionality
  /plugin-ui          # UI components
  /providers          # Provider adapters
    /akash            # Akash Network adapter
    /render           # Render Network adapter
    /golem            # Golem adapter
    /interfaces.ts    # Common provider interfaces
  /workers            # Background workers
    /jobPoller        # Job status polling worker
```

Plugins are loaded dynamically at runtime and communicate through a well-defined event system.

## Provider Adapter Pattern

All provider adapters implement a common interface:

```typescript
interface IDePINProvider {
  // Core methods
  initialize(config: ProviderConfig): Promise<boolean>;
  submitJob(job: JobConfiguration): Promise<JobSubmissionResult>;
  getJobStatus(jobId: string): Promise<JobStatusResult>;
  cancelJob(jobId: string): Promise<boolean>;
  
  // Provider-specific capabilities
  getCapabilities(): ProviderCapabilities;
  getPricing(): Promise<PricingInfo>;
  getNetworkStatus(): Promise<NetworkStatus>;
}
```

This abstraction allows Cortex to interact with diverse DePIN networks through a unified API.

## Event-Driven Communication

Cortex uses an event-driven architecture for internal communication:

```typescript
// Event emission
eventEmitter.emit('job.status.changed', {
  jobId: 'job_1a2b3c4d5e6f',
  previousStatus: 'pending',
  newStatus: 'running',
  timestamp: new Date()
});

// Event subscription
eventEmitter.on('job.status.changed', (data) => {
  // Handle job status change
});
```

This approach enables loose coupling between components and facilitates real-time updates.

## Database Schema

Cortex uses a relational database with the following core tables:

| Table | Description |
|-------|-------------|
| `jobs` | Job definitions and metadata |
| `job_status` | Historical job status records |
| `providers` | Provider configurations |
| `provider_status` | Historical provider status records |
| `users` | User accounts and permissions |
| `api_keys` | API authentication keys |
| `webhooks` | Webhook configurations |
| `events` | System event log |

## Security Model

Cortex implements a multi-layered security approach:

1. **Authentication**: JWT-based authentication for users and API keys
2. **Authorization**: Role-based access control (RBAC) for all operations
3. **Encryption**: Data encryption at rest and in transit
4. **Isolation**: Job isolation using containerization
5. **Audit**: Comprehensive audit logging of all operations
6. **Secrets Management**: Secure storage of provider credentials and secrets

## Scalability

Cortex is designed to scale horizontally:

- **Stateless API Layer**: Multiple API instances can run behind a load balancer
- **Worker Scaling**: Background workers can scale independently based on load
- **Database Sharding**: Job data can be sharded by provider or time period
- **Caching Layer**: Redis-based caching for frequently accessed data
- **Queue System**: RabbitMQ for reliable message processing

## High Availability

For production deployments, Cortex supports high availability configurations:

- **Database Replication**: Primary-replica setup with automatic failover
- **Service Redundancy**: Multiple instances of each service
- **Geographic Distribution**: Multi-region deployment for disaster recovery
- **Health Monitoring**: Automated health checks and self-healing
- **Circuit Breakers**: Prevent cascading failures across components

## Deployment Options

Cortex supports multiple deployment models:

1. **Local Development**: Single-process mode for development
2. **Docker Compose**: Multi-container setup for testing
3. **Kubernetes**: Production-grade orchestrated deployment
4. **Cloud-Managed**: Managed service on AWS, GCP, or Azure

## Monitoring and Observability

Cortex provides comprehensive observability:

- **Metrics**: Prometheus-compatible metrics for all components
- **Logging**: Structured JSON logs with correlation IDs
- **Tracing**: OpenTelemetry-based distributed tracing
- **Dashboards**: Grafana dashboards for system monitoring
- **Alerts**: Configurable alerting for system health issues

## Configuration Management

System configuration follows a hierarchical approach:

1. **Default Values**: Sensible defaults for all settings
2. **Configuration Files**: Override defaults with config files
3. **Environment Variables**: Override file settings with env vars
4. **Runtime Configuration**: Dynamic configuration via API/UI

## API Design

Cortex provides multiple API interfaces:

- **REST API**: Primary API for most integrations
- **GraphQL API**: For complex data queries and subscriptions
- **WebSocket API**: For real-time updates
- **CLI**: Command-line interface for automation

## Next Steps

- Explore [Atomic Commitment](./atomic-commitment) for transaction handling
- Learn about [Security](./security) architecture
- Understand [Scaling](./scaling) strategies for high-volume deployments
