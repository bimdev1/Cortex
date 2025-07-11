---
sidebar_position: 3
---

# Providers API

The Providers API allows you to configure, manage, and monitor DePIN network providers in your Cortex instance.

## Provider Object

A provider object represents a connection to a DePIN network:

```json
{
  "id": "provider_akash_main",
  "name": "Akash Network",
  "type": "akash",
  "status": "online",
  "version": "0.20.0",
  "endpoints": ["https://akash-rpc.polkachu.com:443"],
  "metrics": {
    "latency": 120,
    "uptime": 99.8,
    "jobsCompleted": 156,
    "jobsFailed": 3
  },
  "pricing": {
    "cpu": 0.02,
    "memory": 0.01,
    "storage": 0.001,
    "currency": "USD"
  },
  "config": {
    "mnemonic": "[REDACTED]",
    "gasPrice": "0.025uakt",
    "deploymentProfile": "standard"
  },
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-07-10T08:30:00Z"
}
```

## List Providers

Retrieve a list of configured providers.

```
GET /api/plugin-core/providers
```

### Query Parameters

| Parameter | Type   | Description                                          |
| --------- | ------ | ---------------------------------------------------- |
| `status`  | string | Filter by status (online, offline, degraded)         |
| `type`    | string | Filter by provider type (akash, render, golem, etc.) |

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/providers?status=online" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "provider_akash_main",
      "name": "Akash Network",
      "type": "akash",
      "status": "online",
      "endpoints": ["https://akash-rpc.polkachu.com:443"],
      "metrics": {
        "latency": 120,
        "uptime": 99.8
      },
      "pricing": {
        "cpu": 0.02,
        "memory": 0.01,
        "storage": 0.001,
        "currency": "USD"
      }
    },
    {
      "id": "provider_render_main",
      "name": "Render Network",
      "type": "render",
      "status": "online",
      "endpoints": ["https://api.render.com/v1"],
      "metrics": {
        "latency": 85,
        "uptime": 99.9
      },
      "pricing": {
        "cpu": 0.03,
        "gpu": 0.5,
        "memory": 0.02,
        "storage": 0.002,
        "currency": "USD"
      }
    }
  ]
}
```

## Get Provider Details

Retrieve detailed information about a specific provider.

```
GET /api/plugin-core/providers/:id
```

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/providers/provider_akash_main" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "provider_akash_main",
    "name": "Akash Network",
    "type": "akash",
    "status": "online",
    "version": "0.20.0",
    "endpoints": ["https://akash-rpc.polkachu.com:443"],
    "metrics": {
      "latency": 120,
      "uptime": 99.8,
      "jobsCompleted": 156,
      "jobsFailed": 3,
      "costToDate": 45.23
    },
    "pricing": {
      "cpu": 0.02,
      "memory": 0.01,
      "storage": 0.001,
      "currency": "USD"
    },
    "config": {
      "mnemonic": "[REDACTED]",
      "gasPrice": "0.025uakt",
      "deploymentProfile": "standard"
    },
    "createdAt": "2025-01-15T10:00:00Z",
    "updatedAt": "2025-07-10T08:30:00Z"
  }
}
```

## Create Provider

Configure a new provider connection.

```
POST /api/plugin-core/providers
```

### Request Body

| Field       | Type   | Required | Description                                |
| ----------- | ------ | -------- | ------------------------------------------ |
| `name`      | string | Yes      | Display name for the provider              |
| `type`      | string | Yes      | Provider type (akash, render, golem, etc.) |
| `endpoints` | array  | Yes      | Array of provider endpoints                |
| `config`    | object | Yes      | Provider-specific configuration            |

### Example Request

```bash
curl -X POST "https://your-cortex-instance.com/api/plugin-core/providers" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Akash Network",
    "type": "akash",
    "endpoints": [
      "https://akash-rpc.polkachu.com:443"
    ],
    "config": {
      "mnemonic": "your wallet mnemonic",
      "gasPrice": "0.025uakt",
      "deploymentProfile": "standard",
      "maxBidPrice": {
        "denom": "uakt",
        "amount": "10000"
      }
    }
  }'
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "provider_akash_main",
    "name": "Akash Network",
    "type": "akash",
    "status": "initializing",
    "endpoints": ["https://akash-rpc.polkachu.com:443"],
    "createdAt": "2025-07-10T12:34:56Z",
    "updatedAt": "2025-07-10T12:34:56Z"
  }
}
```

## Update Provider

Update an existing provider configuration.

```
PUT /api/plugin-core/providers/:id
```

### Example Request

```bash
curl -X PUT "https://your-cortex-instance.com/api/plugin-core/providers/provider_akash_main" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Akash Network Main",
    "endpoints": [
      "https://akash-rpc.polkachu.com:443",
      "https://rpc-akash.ecostake.com:443"
    ],
    "config": {
      "gasPrice": "0.030uakt",
      "deploymentProfile": "performance"
    }
  }'
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "provider_akash_main",
    "name": "Akash Network Main",
    "type": "akash",
    "status": "online",
    "endpoints": ["https://akash-rpc.polkachu.com:443", "https://rpc-akash.ecostake.com:443"],
    "updatedAt": "2025-07-10T13:45:30Z"
  }
}
```

## Delete Provider

Remove a provider configuration.

```
DELETE /api/plugin-core/providers/:id
```

### Example Request

```bash
curl -X DELETE "https://your-cortex-instance.com/api/plugin-core/providers/provider_akash_main" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "message": "Provider successfully deleted"
  }
}
```

## Check Provider Status

Check the current status and health of a provider.

```
GET /api/plugin-core/providers/:id/status
```

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/providers/provider_akash_main/status" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "provider_akash_main",
    "status": "online",
    "latency": 120,
    "lastChecked": "2025-07-10T13:50:00Z",
    "version": "0.20.0",
    "nodeCount": 5,
    "walletBalance": {
      "denom": "uakt",
      "amount": "5000000",
      "usdValue": 50.0
    },
    "networkLoad": {
      "cpu": 65,
      "memory": 70,
      "storage": 45
    }
  }
}
```

## Get Provider Metrics

Retrieve historical performance metrics for a provider.

```
GET /api/plugin-core/providers/:id/metrics
```

### Query Parameters

| Parameter    | Type   | Description                                |
| ------------ | ------ | ------------------------------------------ |
| `period`     | string | Time period (1h, 6h, 24h, 7d, 30d)         |
| `resolution` | string | Data point resolution (5m, 1h, 1d)         |
| `metrics`    | string | Comma-separated list of metrics to include |

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/providers/provider_akash_main/metrics?period=24h&resolution=1h&metrics=latency,jobsCompleted" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "latency": [
      {
        "timestamp": "2025-07-09T14:00:00Z",
        "value": 115
      },
      {
        "timestamp": "2025-07-09T15:00:00Z",
        "value": 120
      }
      // Additional data points...
    ],
    "jobsCompleted": [
      {
        "timestamp": "2025-07-09T14:00:00Z",
        "value": 3
      },
      {
        "timestamp": "2025-07-09T15:00:00Z",
        "value": 5
      }
      // Additional data points...
    ]
  }
}
```

## Get Provider Pricing

Retrieve current pricing information for a provider.

```
GET /api/plugin-core/providers/:id/pricing
```

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/providers/provider_akash_main/pricing" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": {
    "id": "provider_akash_main",
    "pricing": {
      "cpu": {
        "price": 0.02,
        "unit": "core/hour",
        "currency": "USD"
      },
      "memory": {
        "price": 0.01,
        "unit": "GB/hour",
        "currency": "USD"
      },
      "storage": {
        "price": 0.001,
        "unit": "GB/hour",
        "currency": "USD"
      },
      "network": {
        "ingress": {
          "price": 0.0,
          "unit": "GB",
          "currency": "USD"
        },
        "egress": {
          "price": 0.05,
          "unit": "GB",
          "currency": "USD"
        }
      },
      "lastUpdated": "2025-07-10T12:00:00Z"
    },
    "historicalPricing": {
      "7d": {
        "cpu": {
          "min": 0.018,
          "max": 0.022,
          "avg": 0.02
        },
        "memory": {
          "min": 0.009,
          "max": 0.012,
          "avg": 0.01
        }
      },
      "30d": {
        "cpu": {
          "min": 0.015,
          "max": 0.025,
          "avg": 0.019
        },
        "memory": {
          "min": 0.008,
          "max": 0.015,
          "avg": 0.01
        }
      }
    }
  }
}
```

## Get Provider Jobs

Retrieve jobs associated with a specific provider.

```
GET /api/plugin-core/providers/:id/jobs
```

### Query Parameters

| Parameter | Type   | Description                |
| --------- | ------ | -------------------------- |
| `status`  | string | Filter by job status       |
| `page`    | number | Page number for pagination |
| `limit`   | number | Items per page             |

### Example Request

```bash
curl -X GET "https://your-cortex-instance.com/api/plugin-core/providers/provider_akash_main/jobs?status=running" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id": "job_1a2b3c4d5e6f",
      "status": "running",
      "image": "nginx:alpine",
      "cpu": 1000,
      "memory": "512Mi",
      "createdAt": "2025-07-10T12:34:56Z"
    }
    // Additional jobs...
  ],
  "meta": {
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  }
}
```

## Provider-Specific Configuration

Each provider type requires specific configuration parameters:

### Akash Network

```json
{
  "mnemonic": "your wallet mnemonic",
  "endpoints": ["https://akash-rpc.polkachu.com:443"],
  "gasPrice": "0.025uakt",
  "deploymentProfile": "standard",
  "maxBidPrice": {
    "denom": "uakt",
    "amount": "10000"
  }
}
```

### Render Network

```json
{
  "apiKey": "your-render-api-key",
  "endpoints": ["https://api.render.com/v1"],
  "paymentAddress": "0x1234...",
  "gpuPreference": "nvidia-a100",
  "region": "us-west"
}
```

### Golem

```json
{
  "paymentDriver": "erc20",
  "paymentNetwork": "polygon",
  "subnet": "public",
  "budget": "5.0",
  "maxPrice": "0.1",
  "timeout": 3600
}
```

### Bittensor

```json
{
  "hotkey": "your-hotkey",
  "coldkey": "your-coldkey",
  "subtensor": "finney",
  "minTau": 0.5,
  "minStake": 1000
}
```

### io.net

```json
{
  "apiKey": "your-ionet-api-key",
  "region": "us-east",
  "replicationFactor": 3,
  "storageClass": "standard"
}
```

## Error Handling

| HTTP Code | Error Code             | Description                  |
| --------- | ---------------------- | ---------------------------- |
| 400       | `VALIDATION_ERROR`     | Invalid request parameters   |
| 401       | `UNAUTHORIZED`         | Missing or invalid API key   |
| 403       | `FORBIDDEN`            | Insufficient permissions     |
| 404       | `PROVIDER_NOT_FOUND`   | Provider not found           |
| 409       | `PROVIDER_CONFLICT`    | Provider ID already exists   |
| 429       | `RATE_LIMIT_EXCEEDED`  | Too many requests            |
| 500       | `INTERNAL_ERROR`       | Server error                 |
| 503       | `PROVIDER_UNAVAILABLE` | Provider network unavailable |

## Webhooks

You can configure webhooks to receive provider status updates:

```
POST /api/plugin-core/webhooks
```

```json
{
  "url": "https://your-server.com/webhook",
  "events": ["provider.status.changed", "provider.pricing.changed"],
  "secret": "your-webhook-secret"
}
```

See the [Webhooks API](./webhooks) documentation for more details.

## Next Steps

- Explore the [Jobs API](./jobs) for job management
- Learn about [Webhooks](./webhooks) for event notifications
- Review [Network Providers](../guide/network-providers) for best practices
