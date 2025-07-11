---
sidebar_position: 2
---

# Jobs API

The Jobs API allows you to programmatically submit, monitor, and manage compute jobs across multiple DePIN networks.

## Job Object

A job object represents a compute workload in Cortex:

```json
{
  "id": "job_1a2b3c4d5e6f",
  "provider": "akash",
  "status": "running",
  "image": "nginx:alpine",
  "cpu": 1000,
  "memory": "512Mi",
  "storage": "1Gi",
  "duration": 3600,
  "createdAt": "2025-07-10T12:34:56Z",
  "startedAt": "2025-07-10T12:35:30Z",
  "endedAt": null,
  "cost": {
    "current": 0.023,
    "projected": 0.1,
    "currency": "USD"
  },
  "config": {
    "env": {
      "DEBUG": "true"
    },
    "ports": [
      {
        "port": 80,
        "expose": true
      }
    ]
  },
  "results": {
    "exitCode": null,
    "outputUrl": null
  }
}
```

## List Jobs

Retrieve a list of jobs with optional filtering.

```
GET /api/plugin-core/jobs
```

### Query Parameters

| Parameter  | Type   | Description                                            |
| ---------- | ------ | ------------------------------------------------------ |
| `status`   | string | Filter by status (pending, running, completed, failed) |
| `provider` | string | Filter by provider network                             |
| `from`     | string | Filter by creation date (ISO format)                   |
| `to`       | string | Filter by creation date (ISO format)                   |
| `page`     | number | Page number for pagination                             |
| `limit`    | number | Items per page (default: 20, max: 100)                 |
| `sort`     | string | Sort field and direction (e.g., createdAt:desc)        |

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/jobs?status=running&provider=akash" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "job_1a2b3c4d5e6f",
      "provider": "akash",
      "status": "running",
      "image": "nginx:alpine",
      "cpu": 1000,
      "memory": "512Mi",
      "storage": "1Gi",
      "duration": 3600,
      "createdAt": "2025-07-10T12:34:56Z",
      "startedAt": "2025-07-10T12:35:30Z",
      "endedAt": null,
      "cost": {
        "current": 0.023,
        "projected": 0.1,
        "currency": "USD"
      }
    }
    // Additional jobs...
  ],
  "meta": {
    "pagination": {
      "total": 45,
      "page": 1,
      "limit": 20,
      "pages": 3
    }
  }
}
```

## Get Job Details

Retrieve detailed information about a specific job.

```
GET /api/plugin-core/jobs/:id
```

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/jobs/job_1a2b3c4d5e6f" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "job_1a2b3c4d5e6f",
    "provider": "akash",
    "status": "running",
    "image": "nginx:alpine",
    "cpu": 1000,
    "memory": "512Mi",
    "storage": "1Gi",
    "duration": 3600,
    "createdAt": "2025-07-10T12:34:56Z",
    "startedAt": "2025-07-10T12:35:30Z",
    "endedAt": null,
    "cost": {
      "current": 0.023,
      "projected": 0.1,
      "currency": "USD"
    },
    "config": {
      "env": {
        "DEBUG": "true"
      },
      "ports": [
        {
          "port": 80,
          "expose": true
        }
      ]
    },
    "results": {
      "exitCode": null,
      "outputUrl": null
    },
    "events": [
      {
        "type": "created",
        "timestamp": "2025-07-10T12:34:56Z"
      },
      {
        "type": "scheduled",
        "timestamp": "2025-07-10T12:35:10Z"
      },
      {
        "type": "started",
        "timestamp": "2025-07-10T12:35:30Z"
      }
    ]
  }
}
```

## Create Job

Submit a new compute job.

```
POST /api/plugin-core/jobs
```

### Request Body

| Field      | Type   | Required | Description                                   |
| ---------- | ------ | -------- | --------------------------------------------- |
| `provider` | string | Yes      | Provider network (akash, render, golem, etc.) |
| `image`    | string | Yes      | Docker image name and tag                     |
| `cpu`      | number | Yes      | CPU millicores (1000m = 1 CPU)                |
| `memory`   | string | Yes      | Memory with units (e.g., "512Mi", "2Gi")      |
| `storage`  | string | Yes      | Storage with units (e.g., "1Gi", "100Gi")     |
| `duration` | number | Yes      | Maximum runtime in seconds                    |
| `env`      | object | No       | Environment variables as key-value pairs      |
| `ports`    | array  | No       | Port configurations                           |
| `volumes`  | array  | No       | Volume mount configurations                   |
| `command`  | array  | No       | Container command override                    |
| `args`     | array  | No       | Container args override                       |

### Example Request

```bash
curl -X POST "https://your-cortex-instance.com/api/plugin-core/jobs" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "akash",
    "image": "nginx:alpine",
    "cpu": 1000,
    "memory": "512Mi",
    "storage": "1Gi",
    "duration": 3600,
    "env": {
      "DEBUG": "true"
    },
    "ports": [
      {
        "port": 80,
        "expose": true
      }
    ]
  }'
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "job_1a2b3c4d5e6f",
    "provider": "akash",
    "status": "pending",
    "image": "nginx:alpine",
    "cpu": 1000,
    "memory": "512Mi",
    "storage": "1Gi",
    "duration": 3600,
    "createdAt": "2025-07-10T12:34:56Z",
    "startedAt": null,
    "endedAt": null,
    "cost": {
      "current": 0,
      "projected": 0.1,
      "currency": "USD"
    }
  }
}
```

## Cancel Job

Cancel a running job.

```
POST /api/plugin-core/jobs/:id/cancel
```

### Example Request

```bash
curl -X POST "https://your-cortex-instance.com/api/plugin-core/jobs/job_1a2b3c4d5e6f/cancel" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "job_1a2b3c4d5e6f",
    "status": "cancelling"
  }
}
```

## Get Job Logs

Retrieve logs from a job.

```
GET /api/plugin-core/jobs/:id/logs
```

### Query Parameters

| Parameter | Type    | Description                              |
| --------- | ------- | ---------------------------------------- |
| `tail`    | number  | Number of recent log lines to return     |
| `follow`  | boolean | Stream logs in real-time (SSE)           |
| `since`   | string  | Return logs since timestamp (ISO format) |

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/jobs/job_1a2b3c4d5e6f/logs?tail=100" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "timestamp": "2025-07-10T12:35:31Z",
        "line": "Starting nginx..."
      },
      {
        "timestamp": "2025-07-10T12:35:32Z",
        "line": "nginx started successfully"
      }
    ]
  }
}
```

## Stream Job Logs

Stream logs in real-time using Server-Sent Events (SSE).

```
GET /api/plugin-core/jobs/:id/logs?follow=true
```

### Example JavaScript Client

```javascript
const eventSource = new EventSource(
  'https://your-cortex-instance.com/api/plugin-core/jobs/job_1a2b3c4d5e6f/logs?follow=true',
  {
    headers: {
      Authorization: 'Bearer YOUR_API_KEY',
    },
  }
);

eventSource.onmessage = (event) => {
  const logEntry = JSON.parse(event.data);
  console.log(`${logEntry.timestamp}: ${logEntry.line}`);
};

eventSource.onerror = (error) => {
  console.error('Error:', error);
  eventSource.close();
};
```

## Get Job Metrics

Retrieve resource utilization metrics for a job.

```
GET /api/plugin-core/jobs/:id/metrics
```

### Query Parameters

| Parameter    | Type   | Description                        |
| ------------ | ------ | ---------------------------------- |
| `period`     | string | Time period (1h, 6h, 24h, 7d)      |
| `resolution` | string | Data point resolution (1m, 5m, 1h) |

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/jobs/job_1a2b3c4d5e6f/metrics?period=1h&resolution=1m" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "cpu": [
      {
        "timestamp": "2025-07-10T12:36:00Z",
        "value": 120
      },
      {
        "timestamp": "2025-07-10T12:37:00Z",
        "value": 150
      }
    ],
    "memory": [
      {
        "timestamp": "2025-07-10T12:36:00Z",
        "value": 256000000
      },
      {
        "timestamp": "2025-07-10T12:37:00Z",
        "value": 260000000
      }
    ],
    "network": {
      "rx": [
        {
          "timestamp": "2025-07-10T12:36:00Z",
          "value": 1024
        }
      ],
      "tx": [
        {
          "timestamp": "2025-07-10T12:36:00Z",
          "value": 2048
        }
      ]
    }
  }
}
```

## Batch Job Operations

Submit multiple jobs in a single request.

```
POST /api/plugin-core/jobs/batch
```

### Request Body

```json
{
  "jobs": [
    {
      "provider": "akash",
      "image": "image1:latest",
      "cpu": 1000,
      "memory": "512Mi",
      "storage": "1Gi",
      "duration": 3600
    },
    {
      "provider": "render",
      "image": "image2:latest",
      "cpu": 2000,
      "memory": "1Gi",
      "storage": "2Gi",
      "duration": 7200
    }
  ],
  "concurrency": 2
}
```

### Example Response

```json
{
  "success": true,
  "data": {
    "jobIds": ["job_1a2b3c4d5e6f", "job_2a3b4c5d6e7f"],
    "status": "submitted"
  }
}
```

## Job Templates

Create and manage job templates for reusable configurations.

### Create Template

```
POST /api/plugin-core/jobs/templates
```

```json
{
  "name": "Web Server",
  "description": "Basic nginx web server",
  "config": {
    "provider": "akash",
    "image": "nginx:alpine",
    "cpu": 1000,
    "memory": "512Mi",
    "storage": "1Gi",
    "duration": 3600,
    "ports": [
      {
        "port": 80,
        "expose": true
      }
    ]
  }
}
```

### List Templates

```
GET /api/plugin-core/jobs/templates
```

### Create Job from Template

```
POST /api/plugin-core/jobs/from-template/:templateId
```

```json
{
  "overrides": {
    "cpu": 2000,
    "memory": "1Gi"
  }
}
```

## Error Handling

| HTTP Code | Error Code             | Description                  |
| --------- | ---------------------- | ---------------------------- |
| 400       | `VALIDATION_ERROR`     | Invalid request parameters   |
| 401       | `UNAUTHORIZED`         | Missing or invalid API key   |
| 403       | `FORBIDDEN`            | Insufficient permissions     |
| 404       | `JOB_NOT_FOUND`        | Job not found                |
| 409       | `PROVIDER_CONFLICT`    | Provider-specific conflict   |
| 429       | `RATE_LIMIT_EXCEEDED`  | Too many requests            |
| 500       | `INTERNAL_ERROR`       | Server error                 |
| 503       | `PROVIDER_UNAVAILABLE` | Provider network unavailable |

## Webhooks

You can configure webhooks to receive job status updates:

```
POST /api/plugin-core/webhooks
```

```json
{
  "url": "https://your-server.com/webhook",
  "events": ["job.created", "job.started", "job.completed", "job.failed"],
  "secret": "your-webhook-secret"
}
```

See the [Webhooks API](./webhooks) documentation for more details.

## Next Steps

- Explore the [Providers API](./providers) for network configuration
- Learn about [Webhooks](./webhooks) for event notifications
- Review [Job Management](../guide/job-management) for best practices
