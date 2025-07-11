---
sidebar_position: 1
---

# API Overview

Cortex provides a comprehensive REST API that allows you to programmatically manage jobs, providers, and resources across multiple DePIN networks.

## API Basics

### Base URL

All API endpoints are relative to your Cortex instance URL:

```
http://localhost:13000/api/
```

For production deployments, use your domain:

```
https://your-cortex-instance.com/api/
```

### Authentication

Most API endpoints require authentication using an API key:

```bash
curl -X GET https://your-cortex-instance.com/api/plugin-core/jobs \
  -H "Authorization: Bearer YOUR_API_KEY"
```

To generate an API key:

1. Navigate to **Settings** > **API Keys** in the dashboard
2. Click **Generate New Key**
3. Set permissions and expiration
4. Copy the key (it will only be shown once)

### Response Format

All API responses are in JSON format and follow a consistent structure:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "meta": {
    // Pagination or additional metadata
  }
}
```

For errors:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details if available
    }
  }
}
```

### Rate Limiting

API requests are rate-limited to protect the system from abuse:

| Plan       | Rate Limit              |
| ---------- | ----------------------- |
| Free       | 60 requests per minute  |
| Pro        | 300 requests per minute |
| Enterprise | Custom limits           |

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1625097600
```

## API Namespaces

The API is organized into logical namespaces:

| Namespace | Description            | Base Path                    |
| --------- | ---------------------- | ---------------------------- |
| Jobs      | Job management         | `/api/plugin-core/jobs`      |
| Providers | Provider configuration | `/api/plugin-core/providers` |
| Networks  | Network status         | `/api/plugin-core/networks`  |
| Webhooks  | Event notifications    | `/api/plugin-core/webhooks`  |
| Auth      | Authentication         | `/api/auth`                  |
| Users     | User management        | `/api/users`                 |
| System    | System operations      | `/api/system`                |

## Common Operations

### Pagination

For endpoints that return collections, pagination is supported:

```
GET /api/plugin-core/jobs?page=2&limit=10
```

Parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Response includes pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "total": 45,
      "page": 2,
      "limit": 10,
      "pages": 5
    }
  }
}
```

### Filtering

Many endpoints support filtering:

```
GET /api/plugin-core/jobs?status=running&provider=akash
```

### Sorting

Sort results by specific fields:

```
GET /api/plugin-core/jobs?sort=createdAt:desc
```

### Field Selection

Request only specific fields:

```
GET /api/plugin-core/jobs?fields=id,status,createdAt
```

## WebSocket API

For real-time updates, Cortex provides a WebSocket API:

```javascript
const socket = new WebSocket('wss://your-cortex-instance.com/ws');

socket.onopen = () => {
  // Authenticate
  socket.send(
    JSON.stringify({
      type: 'auth',
      token: 'YOUR_API_KEY',
    })
  );

  // Subscribe to job updates
  socket.send(
    JSON.stringify({
      type: 'subscribe',
      channel: 'jobs',
    })
  );
};

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received update:', data);
};
```

Available channels:

- `jobs`: Job status updates
- `networks`: Network status changes
- `system`: System notifications

## API Versioning

The API uses versioning to ensure backward compatibility:

```
/api/v1/plugin-core/jobs
```

The current stable version is `v1`. When breaking changes are introduced, a new version will be released.

## SDK Libraries

Official client libraries are available for popular languages:

### JavaScript/TypeScript

```bash
npm install @cortex/client
```

```javascript
import { CortexClient } from '@cortex/client';

const client = new CortexClient({
  baseUrl: 'https://your-cortex-instance.com',
  apiKey: 'YOUR_API_KEY',
});

const jobs = await client.jobs.list();
```

### Python

```bash
pip install cortex-client
```

```python
from cortex_client import CortexClient

client = CortexClient(
    base_url='https://your-cortex-instance.com',
    api_key='YOUR_API_KEY'
)

jobs = client.jobs.list()
```

## API Reference

Detailed documentation for each API endpoint:

- [Jobs API](./jobs): Submit, monitor, and manage compute jobs
- [Providers API](./providers): Configure and query provider networks
- [Webhooks API](./webhooks): Set up event notifications

## Best Practices

1. **Use Exponential Backoff**: When retrying failed requests
2. **Handle Rate Limits**: Check rate limit headers and pause when needed
3. **Validate Inputs**: Validate all inputs before sending to the API
4. **Secure API Keys**: Never expose API keys in client-side code
5. **Use Webhooks**: For event-driven architectures instead of polling
6. **Implement Caching**: Cache responses when appropriate

## Troubleshooting

### Common Error Codes

| Code                  | Description             | Solution                   |
| --------------------- | ----------------------- | -------------------------- |
| `AUTH_INVALID`        | Invalid API key         | Check your API key         |
| `RATE_LIMIT_EXCEEDED` | Too many requests       | Implement backoff strategy |
| `RESOURCE_NOT_FOUND`  | Resource doesn't exist  | Verify resource ID         |
| `VALIDATION_ERROR`    | Invalid request data    | Check request parameters   |
| `PROVIDER_ERROR`      | Provider-specific error | Check provider status      |

### Debugging Tools

1. **API Explorer**: Available at `/api/explorer` on your Cortex instance
2. **Request Logs**: View recent API requests in the dashboard
3. **Curl Command Generator**: Generate curl commands in the dashboard

## Next Steps

- Explore the [Jobs API](./jobs) for job management
- Learn about [Provider APIs](./providers) for network configuration
- Set up [Webhooks](./webhooks) for event notifications
