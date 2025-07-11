---
sidebar_position: 2
---

# Quick Start Guide

Get your first job running on Cortex in under 5 minutes.

## Prerequisites

- Access to a Cortex instance (local or hosted)
- Basic familiarity with Docker containers

## Step 1: Access the Dashboard

Navigate to your Cortex dashboard at `http://localhost:13000` (for local installations) or your hosted URL.

## Step 2: Check Network Status

Before submitting jobs, verify that DePIN networks are available:

1. Look at the **Live Network Status** panel
2. Ensure at least one network shows a green "Online" status
3. Note the current pricing and latency information

## Step 3: Submit Your First Job

Let's deploy a simple nginx web server:

1. In the **Submit New Job** form, enter:
   - **Provider**: Select "Akash Network" (if available)
   - **Docker Image**: `nginx:alpine`
   - **CPU**: `100` (millicores)
   - **Memory**: `512Mi`
   - **Storage**: `1Gi`
   - **Duration**: `3600` (1 hour)

2. Click **Submit Job**

## Step 4: Monitor Progress

Your job will appear in the **Recent Jobs** table with:
- A unique Job ID
- Current status (pending → running → completed)
- Real-time cost tracking
- Links to logs and outputs (when available)

## Step 5: View Results

Once your job status shows "completed":
1. Check the **Actual Cost** column for final pricing
2. View any output logs or files
3. The nginx server would be accessible if ports were configured

## Example API Usage

You can also submit jobs programmatically:

```bash
curl -X POST http://localhost:13000/api/plugin-core/jobs \
-H "Content-Type: application/json" \
-d '{
  "provider": "akash",
  "image": "nginx:alpine",
  "cpu": 100,
  "memory": "512Mi",
  "storage": "1Gi",
  "duration": 3600
}'
```

## What's Next?

- Explore [Job Management](../guide/job-management) for advanced features
- Learn about [Cost Optimization](../guide/cost-optimization) strategies
- Check out [Network Providers](../guide/network-providers) for detailed provider information
- Review the [API Reference](../api/overview) for programmatic access

## Troubleshooting

**Job stuck in "pending" status?**
- Check that the selected network is online
- Verify your resource requirements are within network limits
- Ensure sufficient balance if using a pay-per-use model

**Need help?** Visit our [Support page](../troubleshooting/support) or join our [Discord community](https://discord.gg/cortex).
