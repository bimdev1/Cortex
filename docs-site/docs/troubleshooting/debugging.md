---
sidebar_position: 2
---

# Debugging Techniques

This guide covers advanced debugging techniques to help you diagnose and resolve complex issues in your Cortex deployment.

## Diagnostic Tools

### System Diagnostics

Cortex includes built-in diagnostic tools to help identify system issues:

```bash
# Run a comprehensive system diagnostic
curl -X POST "https://your-cortex-instance.com/api/system/diagnostics" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

The diagnostic report includes:

- System health checks
- Service status
- Resource utilization
- Recent errors
- Configuration validation

You can also run targeted diagnostics:

```bash
# Check provider connectivity
curl -X POST "https://your-cortex-instance.com/api/system/diagnostics/providers" \
  -H "Authorization: Bearer YOUR_API_KEY"

# Check database health
curl -X POST "https://your-cortex-instance.com/api/system/diagnostics/database" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Debug Mode

Enable debug mode for more verbose logging:

```bash
# Enable debug mode
curl -X PUT "https://your-cortex-instance.com/api/system/logging/level" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "debug",
    "duration": 3600  # Enable for 1 hour
  }'
```

When debug mode is enabled:

- Additional logs are generated
- Performance metrics are collected at higher resolution
- API responses include more detailed error information

Remember to disable debug mode after troubleshooting to avoid performance impacts:

```bash
# Disable debug mode
curl -X PUT "https://your-cortex-instance.com/api/system/logging/level" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "info"
  }'
```

## Log Analysis

### Centralized Logging

Cortex aggregates logs from all components into a centralized logging system:

```bash
# Retrieve logs with filtering
curl -X GET "https://your-cortex-instance.com/api/system/logs?service=job-service&level=error&from=2025-07-10T00:00:00Z" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Key log parameters:

- `service`: Filter by service name (job-service, provider-adapter, etc.)
- `level`: Filter by log level (debug, info, warn, error)
- `from`/`to`: Time range in ISO format
- `query`: Full-text search across logs
- `limit`: Maximum number of logs to return

### Structured Log Analysis

Cortex logs are structured in JSON format for easier analysis:

```json
{
  "timestamp": "2025-07-10T12:34:56.789Z",
  "level": "error",
  "service": "job-service",
  "message": "Failed to submit job to provider",
  "correlationId": "corr-1a2b3c4d",
  "jobId": "job-5e6f7g8h",
  "providerId": "akash-main",
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "Provider endpoint not responding",
    "details": {
      "endpoint": "https://akash-rpc.example.com",
      "timeout": true,
      "attempts": 3
    }
  },
  "context": {
    "userId": "user-9i8h7g6f",
    "requestId": "req-5a4b3c2d"
  }
}
```

For complex log analysis, you can use the log export feature:

```bash
# Export logs for offline analysis
curl -X POST "https://your-cortex-instance.com/api/system/logs/export" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "job-service",
    "level": "error",
    "from": "2025-07-10T00:00:00Z",
    "to": "2025-07-11T00:00:00Z",
    "format": "jsonl"
  }'
```

### Log Correlation

Cortex uses correlation IDs to track requests across services:

1. Each incoming request receives a unique correlation ID
2. The ID is propagated to all internal services
3. All logs related to the request include the correlation ID

To trace a specific request:

```bash
# Find logs by correlation ID
curl -X GET "https://your-cortex-instance.com/api/system/logs?correlationId=corr-1a2b3c4d" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Network Debugging

### API Traffic Inspection

Inspect API traffic between components:

```bash
# Enable API traffic logging
curl -X POST "https://your-cortex-instance.com/api/system/network/capture" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "target": "api-gateway",
    "duration": 300,  # Capture for 5 minutes
    "filters": {
      "methods": ["POST", "PUT"],
      "pathPattern": "/api/plugin-core/jobs/*"
    }
  }'
```

The captured traffic can be downloaded as a HAR file for analysis in tools like Chrome DevTools or Postman.

### Provider Network Diagnostics

Test connectivity to provider networks:

```bash
# Run network diagnostics for a provider
curl -X POST "https://your-cortex-instance.com/api/plugin-core/providers/{providerId}/diagnostics" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tests": ["ping", "dns", "http", "rpc"]
  }'
```

For blockchain-based providers, verify transaction propagation:

```bash
# Check transaction status
curl -X GET "https://your-cortex-instance.com/api/plugin-core/providers/{providerId}/transactions/{txHash}" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Database Debugging

### Query Analysis

Identify slow or problematic database queries:

```bash
# Get slow query log
curl -X GET "https://your-cortex-instance.com/api/system/database/slow-queries" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

For detailed query analysis:

```bash
# Explain a specific query
curl -X POST "https://your-cortex-instance.com/api/system/database/explain" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT * FROM jobs WHERE status = ? AND provider_id = ? ORDER BY created_at DESC LIMIT 100",
    "params": ["running", "akash-main"]
  }'
```

### Database Consistency Checks

Run consistency checks to identify data integrity issues:

```bash
# Check database consistency
curl -X POST "https://your-cortex-instance.com/api/system/database/check" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "tables": ["jobs", "job_status", "providers"],
    "level": "thorough"
  }'
```

For specific entity checks:

```bash
# Check job data consistency
curl -X POST "https://your-cortex-instance.com/api/plugin-core/jobs/{jobId}/verify" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Job Debugging

### Job Inspection

Get detailed information about a job's execution:

```bash
# Get job details with debug info
curl -X GET "https://your-cortex-instance.com/api/plugin-core/jobs/{jobId}?debug=true" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

The debug output includes:

- Full job configuration
- Provider-specific deployment details
- Resource allocation and usage
- Network configuration
- Volume mounts
- Environment variables (non-sensitive)

### Container Inspection

For running jobs, inspect the container state:

```bash
# Get container inspection data
curl -X GET "https://your-cortex-instance.com/api/plugin-core/jobs/{jobId}/container" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

This returns detailed information about the container:

- Process list
- Resource usage
- Network connections
- Mounted volumes
- Environment variables

### Interactive Debugging

For advanced debugging, you can access a running container:

```bash
# Get interactive shell access
curl -X POST "https://your-cortex-instance.com/api/plugin-core/jobs/{jobId}/exec" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "command": ["/bin/sh"],
    "interactive": true
  }'
```

This returns a WebSocket URL that you can connect to for interactive shell access.

For non-interactive commands:

```bash
# Run a diagnostic command
curl -X POST "https://your-cortex-instance.com/api/plugin-core/jobs/{jobId}/exec" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "command": ["cat", "/proc/meminfo"],
    "interactive": false
  }'
```

## Event Debugging

### Event Tracing

Trace events through the system:

```bash
# Enable event tracing
curl -X POST "https://your-cortex-instance.com/api/system/events/trace" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "types": ["job.created", "job.scheduled", "job.started"],
    "duration": 600,  # Trace for 10 minutes
    "detail": "full"
  }'
```

Event traces show:

- Event propagation path
- Processing time at each step
- Handler execution details
- Related events

### Event Replay

For debugging event processing issues, you can replay events:

```bash
# Replay a specific event
curl -X POST "https://your-cortex-instance.com/api/system/events/replay" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "evt-1a2b3c4d",
    "handlers": ["job-status-handler", "notification-handler"]
  }'
```

## Performance Debugging

### Profiling

Generate performance profiles for system components:

```bash
# CPU profiling
curl -X POST "https://your-cortex-instance.com/api/system/profile" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "job-service",
    "type": "cpu",
    "duration": 30
  }'

# Memory profiling
curl -X POST "https://your-cortex-instance.com/api/system/profile" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "service": "job-service",
    "type": "heap",
    "duration": 30
  }'
```

Profiles can be downloaded and analyzed with tools like pprof.

### Request Tracing

Enable distributed tracing to analyze request flow:

```bash
# Enable tracing for a specific endpoint
curl -X POST "https://your-cortex-instance.com/api/system/tracing" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/plugin-core/jobs",
    "method": "POST",
    "duration": 300,
    "samplingRate": 1.0
  }'
```

Traces can be viewed in the Cortex dashboard or exported to compatible tracing systems like Jaeger or Zipkin.

## Configuration Debugging

### Configuration Validation

Validate system configuration:

```bash
# Validate configuration
curl -X POST "https://your-cortex-instance.com/api/system/config/validate" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

For specific component configuration:

```bash
# Validate provider configuration
curl -X POST "https://your-cortex-instance.com/api/plugin-core/providers/{providerId}/validate" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Configuration Comparison

Compare configuration across environments:

```bash
# Compare with reference configuration
curl -X POST "https://your-cortex-instance.com/api/system/config/compare" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "production",
    "sections": ["database", "providers", "security"]
  }'
```

## Security Debugging

### Authentication Debugging

Debug authentication issues:

```bash
# Test authentication
curl -X POST "https://your-cortex-instance.com/api/auth/test" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

For API key validation:

```bash
# Validate API key
curl -X POST "https://your-cortex-instance.com/api/auth/validate-key" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "api-key-to-validate"
  }'
```

### Permission Debugging

Check effective permissions:

```bash
# Get effective permissions
curl -X GET "https://your-cortex-instance.com/api/users/me/effective-permissions?resource=jobs&action=create" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

For detailed permission analysis:

```bash
# Analyze permission decision
curl -X POST "https://your-cortex-instance.com/api/system/permissions/analyze" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-1a2b3c4d",
    "resource": "jobs",
    "action": "delete",
    "resourceId": "job-5e6f7g8h"
  }'
```

## Debugging Best Practices

### Methodical Approach

Follow these steps for effective debugging:

1. **Identify the Scope**: Determine if the issue is system-wide or specific to a component
2. **Gather Information**: Collect logs, error messages, and relevant context
3. **Form Hypotheses**: Develop theories about what might be causing the issue
4. **Test Systematically**: Test each hypothesis with targeted debugging
5. **Document Findings**: Record what you learn for future reference

### Creating Reproducible Test Cases

For complex issues, create a minimal reproducible test case:

```bash
# Create test job
curl -X POST "https://your-cortex-instance.com/api/plugin-core/jobs/test" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "provider-connection-failure",
    "parameters": {
      "provider": "akash",
      "errorType": "timeout",
      "probability": 1.0
    }
  }'
```

### Using the Debug Console

For advanced users, Cortex provides a debug console:

```bash
# Access debug console
curl -X POST "https://your-cortex-instance.com/api/system/debug-console" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

The debug console provides:

- Interactive JavaScript environment
- Access to internal APIs
- Real-time system monitoring
- Custom diagnostic commands

**Note**: The debug console should only be used by experienced administrators as it provides low-level system access.

## Next Steps

- Learn about [Support](./support) options for getting help with complex issues
- Explore [Performance Optimization](./performance) for system tuning
- Review [Security Best Practices](../architecture/security) to ensure your deployment is secure
