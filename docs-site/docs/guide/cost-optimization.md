---
sidebar_position: 4
---

# Cost Optimization

This guide covers strategies and best practices for optimizing costs when using Cortex to manage decentralized compute workloads.

## Understanding DePIN Cost Structures

Decentralized Physical Infrastructure Networks (DePINs) typically offer significant cost advantages over centralized cloud providers, often 15-30x cheaper for equivalent resources. However, each provider has a unique pricing model:

| Provider       | Pricing Model      | Cost Factors                               |
| -------------- | ------------------ | ------------------------------------------ |
| Akash Network  | Auction-based      | CPU, memory, storage, duration             |
| Render Network | Fixed rate + usage | GPU type, runtime, data transfer           |
| Golem          | Market-based       | CPU, memory, task complexity               |
| Bittensor      | Token-weighted     | Query complexity, token stake              |
| io.net         | Fixed + variable   | Storage size, retrieval frequency, compute |

## Cost Monitoring Tools

### Dashboard Cost Overview

The Cost Overview chart on the Cortex dashboard provides:

- Real-time spending metrics
- Historical cost trends
- Provider cost comparisons
- Projected monthly expenses

### Cost Alerts

Set up cost alerts to be notified when:

- Individual jobs exceed cost thresholds
- Daily/weekly spending exceeds budgets
- Unusual spending patterns are detected

To configure alerts:

1. Navigate to **Settings** > **Notifications**
2. Select **Cost Alerts**
3. Define your thresholds and notification preferences

## Cost Optimization Strategies

### 1. Right-Size Resources

One of the most effective ways to reduce costs is to properly size your resource requests:

```javascript
// Before: Over-provisioned
{
  "cpu": 4000,    // 4 cores
  "memory": "8Gi",
  "storage": "100Gi"
}

// After: Right-sized
{
  "cpu": 1000,    // 1 core
  "memory": "2Gi",
  "storage": "20Gi"
}
```

**Tools for right-sizing:**

- Use the **Resource Analyzer** in the job details page
- Review historical utilization patterns
- Start small and scale up as needed

### 2. Use Spot Instances

For non-critical or fault-tolerant workloads, use spot instances:

```javascript
{
  "provider": "akash",
  "spotInstance": true,
  "maxBidPrice": {
    "denom": "uakt",
    "amount": "5000"  // Lower than standard price
  }
}
```

Spot instances can be 40-80% cheaper than standard instances but may be terminated if demand increases.

### 3. Optimize Job Duration

Pay only for the time you need:

```javascript
// Before: Fixed long duration
{
  "duration": 86400  // 24 hours
}

// After: Optimized duration
{
  "duration": 3600,  // 1 hour
  "autoExtend": true,
  "maxDuration": 86400
}
```

The `autoExtend` feature will only extend the job if it's still running when the duration expires.

### 4. Batch Processing

Group similar tasks into batches:

```javascript
// Before: Multiple individual jobs
// job1, job2, job3, ...

// After: Single batch job
{
  "batchSize": 10,
  "concurrency": 3,
  "inputData": ["data1", "data2", "data3", ...],
  "command": "./process.sh ${INPUT}"
}
```

Batching reduces overhead costs associated with job scheduling and resource allocation.

### 5. Provider Selection

Let Cortex automatically select the most cost-effective provider:

```javascript
{
  "providerStrategy": "cost",
  "maxPrice": 0.05,
  "performanceRequirements": {
    "minCpu": 1000,
    "minMemory": "2Gi"
  }
}
```

This configuration will select the cheapest provider that meets your minimum performance requirements.

### 6. Scheduled Jobs

Run jobs during off-peak hours:

```javascript
{
  "schedule": "0 2 * * *",  // Run at 2 AM daily
  "providerStrategy": "cost"
}
```

Many DePIN networks have lower prices during periods of reduced demand.

### 7. Caching and Data Optimization

Minimize data transfer and storage costs:

```javascript
{
  "cacheResults": true,
  "compressionLevel": "high",
  "dataRetention": 86400  // Store results for 1 day
}
```

## Advanced Cost Management

### Budget Enforcement

Set hard spending limits:

```javascript
{
  "budget": {
    "amount": 50,
    "currency": "USD",
    "period": "monthly",
    "action": "alert"  // or "stop" to terminate jobs
  }
}
```

### Cost Allocation

Track costs by project, team, or purpose:

```javascript
{
  "labels": {
    "project": "recommendation-engine",
    "team": "data-science",
    "environment": "development"
  }
}
```

Use these labels in the Cost Analysis dashboard to break down spending by category.

### Cost Forecasting

The Cost Forecasting tool uses historical data to predict future expenses:

1. Navigate to **Analytics** > **Cost Forecasting**
2. Select the time period and providers
3. View projected costs based on current usage patterns

## Cost Comparison with Traditional Cloud

| Workload Type     | Traditional Cloud | Cortex + DePIN | Savings |
| ----------------- | ----------------- | -------------- | ------- |
| Web Application   | $150/month        | $10/month      | 93%     |
| ML Training (GPU) | $500/day          | $50/day        | 90%     |
| Data Processing   | $200/job          | $15/job        | 92%     |
| Database Hosting  | $100/month        | $25/month      | 75%     |

## Best Practices Checklist

- [ ] Monitor resource utilization and adjust allocations
- [ ] Use spot instances for non-critical workloads
- [ ] Set up cost alerts and budgets
- [ ] Regularly review the Cost Overview dashboard
- [ ] Optimize job duration and scheduling
- [ ] Use provider-specific cost optimizations
- [ ] Implement data transfer and storage optimizations
- [ ] Label jobs for cost allocation tracking

## Next Steps

- Review the [API Reference](../api/overview) for programmatic cost management
- Explore [Architecture](../architecture/overview) to understand Cortex's cost optimization mechanisms
- Check [Troubleshooting](../troubleshooting/common-issues) for solutions to common cost-related issues
