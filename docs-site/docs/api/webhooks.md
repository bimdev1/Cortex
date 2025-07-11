---
sidebar_position: 4
---

# Webhooks API

The Webhooks API allows you to configure event notifications for your Cortex instance, enabling real-time integration with external systems.

## Webhook Object

A webhook object represents a notification endpoint:

```json
{
  "id": "webhook_1a2b3c4d5e6f",
  "name": "Job Status Notifications",
  "url": "https://your-server.com/cortex-webhook",
  "events": ["job.created", "job.started", "job.completed", "job.failed"],
  "secret": "sha256:1234abcd...",
  "enabled": true,
  "createdAt": "2025-07-01T10:00:00Z",
  "updatedAt": "2025-07-10T15:30:00Z",
  "lastTriggered": "2025-07-10T14:25:12Z",
  "stats": {
    "delivered": 156,
    "failed": 2,
    "retried": 5
  }
}
```

## List Webhooks

Retrieve a list of configured webhooks.

```
GET /api/plugin-core/webhooks
```

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/webhooks" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "webhook_1a2b3c4d5e6f",
      "name": "Job Status Notifications",
      "url": "https://your-server.com/cortex-webhook",
      "events": ["job.created", "job.started", "job.completed", "job.failed"],
      "enabled": true,
      "createdAt": "2025-07-01T10:00:00Z",
      "updatedAt": "2025-07-10T15:30:00Z"
    },
    {
      "id": "webhook_2b3c4d5e6f7g",
      "name": "Provider Status Alerts",
      "url": "https://your-server.com/provider-alerts",
      "events": ["provider.status.changed", "provider.pricing.changed"],
      "enabled": true,
      "createdAt": "2025-07-05T14:20:00Z",
      "updatedAt": "2025-07-10T09:15:00Z"
    }
  ]
}
```

## Get Webhook Details

Retrieve detailed information about a specific webhook.

```
GET /api/plugin-core/webhooks/:id
```

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/webhooks/webhook_1a2b3c4d5e6f" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "webhook_1a2b3c4d5e6f",
    "name": "Job Status Notifications",
    "url": "https://your-server.com/cortex-webhook",
    "events": ["job.created", "job.started", "job.completed", "job.failed"],
    "secret": "sha256:1234abcd...",
    "enabled": true,
    "createdAt": "2025-07-01T10:00:00Z",
    "updatedAt": "2025-07-10T15:30:00Z",
    "lastTriggered": "2025-07-10T14:25:12Z",
    "stats": {
      "delivered": 156,
      "failed": 2,
      "retried": 5
    },
    "deliveryHistory": [
      {
        "eventId": "evt_1234abcd",
        "eventType": "job.completed",
        "timestamp": "2025-07-10T14:25:12Z",
        "status": "delivered",
        "responseCode": 200,
        "responseTime": 120
      },
      {
        "eventId": "evt_2345bcde",
        "eventType": "job.failed",
        "timestamp": "2025-07-10T13:15:45Z",
        "status": "delivered",
        "responseCode": 200,
        "responseTime": 135
      }
    ]
  }
}
```

## Create Webhook

Configure a new webhook endpoint.

```
POST /api/plugin-core/webhooks
```

### Request Body

| Field     | Type    | Required | Description                                   |
| --------- | ------- | -------- | --------------------------------------------- |
| `name`    | string  | Yes      | Display name for the webhook                  |
| `url`     | string  | Yes      | Endpoint URL to receive webhook events        |
| `events`  | array   | Yes      | Array of event types to subscribe to          |
| `secret`  | string  | No       | Secret for webhook signature verification     |
| `enabled` | boolean | No       | Whether the webhook is active (default: true) |

### Example Request

```bash
curl -X POST "https://your-cortex-instance.com/api/plugin-core/webhooks" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Job Status Notifications",
    "url": "https://your-server.com/cortex-webhook",
    "events": [
      "job.created",
      "job.started",
      "job.completed",
      "job.failed"
    ],
    "secret": "your-webhook-secret"
  }'
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "webhook_1a2b3c4d5e6f",
    "name": "Job Status Notifications",
    "url": "https://your-server.com/cortex-webhook",
    "events": ["job.created", "job.started", "job.completed", "job.failed"],
    "secret": "sha256:1234abcd...",
    "enabled": true,
    "createdAt": "2025-07-10T16:45:00Z",
    "updatedAt": "2025-07-10T16:45:00Z"
  }
}
```

## Update Webhook

Update an existing webhook configuration.

```
PUT /api/plugin-core/webhooks/:id
```

### Example Request

```bash
curl -X PUT "https://your-cortex-instance.com/api/plugin-core/webhooks/webhook_1a2b3c4d5e6f" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Job Status Notifications",
    "events": [
      "job.created",
      "job.started",
      "job.completed",
      "job.failed",
      "job.cancelled"
    ],
    "enabled": true
  }'
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "webhook_1a2b3c4d5e6f",
    "name": "Job Status Notifications",
    "url": "https://your-server.com/cortex-webhook",
    "events": ["job.created", "job.started", "job.completed", "job.failed", "job.cancelled"],
    "enabled": true,
    "updatedAt": "2025-07-10T17:30:00Z"
  }
}
```

## Delete Webhook

Remove a webhook configuration.

```
DELETE /api/plugin-core/webhooks/:id
```

### Example Request

```bash
curl -X DELETE "https://your-cortex-instance.com/api/plugin-core/webhooks/webhook_1a2b3c4d5e6f" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "message": "Webhook successfully deleted"
  }
}
```

## Test Webhook

Send a test event to a webhook endpoint.

```
POST /api/plugin-core/webhooks/:id/test
```

### Example Request

```bash
curl -X POST "https://your-cortex-instance.com/api/plugin-core/webhooks/webhook_1a2b3c4d5e6f/test" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "job.completed"
  }'
```

### Example Response

```json
{
  "success": true,
  "data": {
    "delivered": true,
    "statusCode": 200,
    "responseTime": 135,
    "timestamp": "2025-07-10T17:45:00Z"
  }
}
```

## Get Webhook Delivery History

Retrieve the delivery history for a webhook.

```
GET /api/plugin-core/webhooks/:id/history
```

### Query Parameters

| Parameter | Type   | Description                                             |
| --------- | ------ | ------------------------------------------------------- |
| `status`  | string | Filter by delivery status (delivered, failed, retrying) |
| `from`    | string | Filter by delivery date (ISO format)                    |
| `to`      | string | Filter by delivery date (ISO format)                    |
| `page`    | number | Page number for pagination                              |
| `limit`   | number | Items per page                                          |

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/webhooks/webhook_1a2b3c4d5e6f/history?status=delivered&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "delivery_1a2b3c4d",
      "eventId": "evt_1234abcd",
      "eventType": "job.completed",
      "timestamp": "2025-07-10T14:25:12Z",
      "status": "delivered",
      "responseCode": 200,
      "responseTime": 120,
      "attempts": 1
    },
    {
      "id": "delivery_2b3c4d5e",
      "eventId": "evt_2345bcde",
      "eventType": "job.failed",
      "timestamp": "2025-07-10T13:15:45Z",
      "status": "delivered",
      "responseCode": 200,
      "responseTime": 135,
      "attempts": 1
    }
  ],
  "meta": {
    "pagination": {
      "total": 156,
      "page": 1,
      "limit": 10,
      "pages": 16
    }
  }
}
```

## Retry Failed Delivery

Retry a failed webhook delivery.

```
POST /api/plugin-core/webhooks/:id/history/:deliveryId/retry
```

### Example Request

```bash
curl -X POST "https://your-cortex-instance.com/api/plugin-core/webhooks/webhook_1a2b3c4d5e6f/history/delivery_3c4d5e6f/retry" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "delivery_3c4d5e6f",
    "status": "retrying",
    "attempts": 2,
    "timestamp": "2025-07-10T18:00:00Z"
  }
}
```

## Available Event Types

### Job Events

| Event Type           | Description                          |
| -------------------- | ------------------------------------ |
| `job.created`        | Job has been created                 |
| `job.scheduled`      | Job has been scheduled on a provider |
| `job.started`        | Job has started running              |
| `job.completed`      | Job has completed successfully       |
| `job.failed`         | Job has failed                       |
| `job.cancelled`      | Job has been cancelled               |
| `job.expired`        | Job has reached its duration limit   |
| `job.cost.threshold` | Job cost has reached a threshold     |

### Provider Events

| Event Type                 | Description                    |
| -------------------------- | ------------------------------ |
| `provider.status.changed`  | Provider status has changed    |
| `provider.pricing.changed` | Provider pricing has changed   |
| `provider.added`           | New provider has been added    |
| `provider.removed`         | Provider has been removed      |
| `provider.wallet.low`      | Provider wallet balance is low |

### System Events

| Event Type                  | Description                                   |
| --------------------------- | --------------------------------------------- |
| `system.alert`              | System alert has been triggered               |
| `system.update.available`   | System update is available                    |
| `system.resource.threshold` | System resource usage has reached a threshold |

## Webhook Payload Format

When an event occurs, Cortex sends a POST request to your webhook URL with a JSON payload:

```json
{
  "id": "evt_1234abcd",
  "type": "job.completed",
  "createdAt": "2025-07-10T14:25:12Z",
  "data": {
    "job": {
      "id": "job_1a2b3c4d5e6f",
      "provider": "akash",
      "status": "completed",
      "image": "nginx:alpine",
      "cpu": 1000,
      "memory": "512Mi",
      "storage": "1Gi",
      "duration": 3600,
      "createdAt": "2025-07-10T12:34:56Z",
      "startedAt": "2025-07-10T12:35:30Z",
      "endedAt": "2025-07-10T14:25:12Z",
      "cost": {
        "final": 0.08,
        "currency": "USD"
      },
      "results": {
        "exitCode": 0,
        "outputUrl": "https://storage.cortex.example/job_1a2b3c4d5e6f/output.log"
      }
    }
  }
}
```

## Webhook Signatures

For security, Cortex signs all webhook requests using HMAC-SHA256:

```
X-Cortex-Signature: t=1625097600,v1=5257a869e7ecebeda32affa62cdca3fa51cad7e77a0e56ff536d0ce8e108d8bd
```

The signature is composed of:

- `t`: Timestamp when the request was sent
- `v1`: Signature version and hash

To verify the signature:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  // Extract timestamp and signature value
  const [timestamp, signatureValue] = signature.replace('t=', '').replace('v1=', '').split(',');

  // Create the signature
  const hmac = crypto.createHmac('sha256', secret);
  const expectedSignature = hmac.update(`${timestamp}.${JSON.stringify(payload)}`).digest('hex');

  // Compare signatures using constant-time comparison
  return crypto.timingSafeEqual(Buffer.from(signatureValue), Buffer.from(expectedSignature));
}
```

## Retry Policy

If a webhook delivery fails, Cortex will retry with exponential backoff:

1. First retry: 30 seconds after failure
2. Second retry: 2 minutes after first retry
3. Third retry: 10 minutes after second retry
4. Fourth retry: 30 minutes after third retry
5. Fifth retry: 1 hour after fourth retry

After 5 failed attempts, the delivery will be marked as permanently failed.

## Error Handling

| HTTP Code | Error Code            | Description                      |
| --------- | --------------------- | -------------------------------- |
| 400       | `VALIDATION_ERROR`    | Invalid request parameters       |
| 401       | `UNAUTHORIZED`        | Missing or invalid API key       |
| 403       | `FORBIDDEN`           | Insufficient permissions         |
| 404       | `WEBHOOK_NOT_FOUND`   | Webhook not found                |
| 404       | `DELIVERY_NOT_FOUND`  | Delivery record not found        |
| 409       | `DUPLICATE_WEBHOOK`   | Duplicate webhook URL and events |
| 429       | `RATE_LIMIT_EXCEEDED` | Too many requests                |
| 500       | `INTERNAL_ERROR`      | Server error                     |

## Best Practices

1. **Implement Idempotency**: Process webhook events idempotently to handle potential duplicates
2. **Respond Quickly**: Return a 2xx response as quickly as possible (under 3 seconds)
3. **Verify Signatures**: Always verify webhook signatures to ensure authenticity
4. **Handle Retries**: Be prepared to receive the same event multiple times
5. **Monitor Failures**: Set up alerts for webhook delivery failures
6. **Use HTTPS**: Always use HTTPS endpoints for security

## Next Steps

- Explore the [Jobs API](./jobs) for job management
- Learn about [Providers API](./providers) for network configuration
- Review [Job Management](../guide/job-management) for best practices
