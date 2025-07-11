---
sidebar_position: 1
---

# Dashboard Overview

The Cortex Dashboard provides a centralized interface for monitoring and managing your decentralized compute operations. This guide walks you through the key components and features of the dashboard.

## Dashboard Layout

The dashboard is organized into several key sections:

1. **Global Navigation** - Access different parts of the application
2. **Cost Overview** - Track spending across providers
3. **Live Network Status** - Monitor provider availability and pricing
4. **Recent Jobs** - View and manage your compute jobs
5. **Resource Utilization** - Track your compute resource usage

## Getting Started Modal

When you first access the dashboard, you'll see a **Get Started** modal that provides:

- A quick tour of key features
- Links to documentation
- Setup guidance for first-time users

You can reopen this modal anytime by clicking the **Help** button in the top navigation bar.

## Cost Overview Chart

The Cost Overview chart displays:

- Daily/weekly/monthly spending trends
- Cost breakdown by provider
- Projected costs based on current usage

Use the timeframe selector to adjust the view period, and hover over data points for detailed information.

## Live Network Status

This panel shows real-time information about connected DePIN networks:

| Column | Description |
|--------|-------------|
| Provider | Name of the DePIN network |
| Status | Current connection status (Online/Offline) |
| Latency | Current response time in ms |
| Price | Current price per CPU/hour |
| Capacity | Available compute resources |

The status indicators update automatically every 60 seconds, or you can click the refresh button for immediate updates.

## Job Submission Form

The job submission form allows you to:

1. Select a provider network
2. Specify your Docker image
3. Configure resource requirements
4. Set job duration and other parameters

Each field includes inline help text explaining the expected values and constraints.

## Job Status Table

The Job Status table displays:

| Column | Description |
|--------|-------------|
| Job ID | Unique identifier for the job |
| Provider | Network running the job |
| Status | Current job status |
| Created | Submission timestamp |
| Duration | Elapsed/total runtime |
| Cost | Current/projected cost |
| Actions | View logs, cancel, etc. |

Click on any job row to view detailed information, including:
- Complete logs
- Resource utilization
- Configuration details
- Cost breakdown

## Filtering and Sorting

You can filter the job list by:
- Status (Running, Completed, Failed)
- Provider network
- Date range
- Cost range

Click column headers to sort the table by that column.

## Notifications

The dashboard provides real-time notifications for:
- Job status changes
- Cost alerts
- Network status changes
- System updates

Click the bell icon in the top navigation to view your notification history.

## User Preferences

Access user preferences by clicking your profile icon in the top-right corner. Here you can:
- Configure default provider networks
- Set cost alerts
- Customize the dashboard layout
- Manage API keys

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `?` | Show keyboard shortcuts |
| `N` | Create new job |
| `J` | Go to jobs list |
| `D` | Go to dashboard |
| `S` | Go to settings |
| `H` | Open help modal |

## Next Steps

- Learn about [Job Management](./job-management) features
- Explore [Network Providers](./network-providers) configuration
- Review [Cost Optimization](./cost-optimization) strategies
