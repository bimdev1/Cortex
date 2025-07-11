---
sidebar_position: 2
---

# Job Management

This guide covers advanced job management features in Cortex, including job lifecycle, monitoring, troubleshooting, and automation.

## Job Lifecycle

Every job in Cortex goes through the following states:

1. **Pending** - Job has been submitted and is waiting for provider allocation
2. **Scheduled** - Provider has accepted the job and is preparing resources
3. **Running** - Job is actively executing on provider infrastructure
4. **Completed** - Job has finished successfully
5. **Failed** - Job encountered an error during execution
6. **Cancelled** - Job was manually terminated by the user

![Job Lifecycle Diagram](/img/job-lifecycle.png)

## Creating Jobs

### Basic Job Creation

The simplest way to create a job is through the dashboard:

1. Navigate to **Jobs** > **Create Job**
2. Select a provider network
3. Specify your Docker image
4. Configure resource requirements
5. Click **Submit**

### Advanced Configuration

For more complex workloads, you can specify:

#### Environment Variables

```json
{
  "env": {
    "DATABASE_URL": "postgres://user:pass@host:5432/db",
    "API_KEY": "secret-key",
    "DEBUG": "true"
  }
}
```

#### Volume Mounts

```json
{
  "volumes": [
    {
      "name": "data",
      "mountPath": "/data",
      "size": "10Gi"
    }
  ]
}
```

#### Network Configuration

```json
{
  "ports": [
    {
      "port": 8080,
      "expose": true,
      "protocol": "TCP"
    }
  ]
}
```

#### Resource Constraints

```json
{
  "cpu": 1000, // millicores (1000m = 1 CPU)
  "memory": "2Gi", // memory in Mi or Gi
  "storage": "10Gi", // storage in Mi or Gi
  "gpu": 1 // number of GPUs (if supported)
}
```

## Monitoring Jobs

### Dashboard Monitoring

The Jobs table provides real-time status updates for all your jobs. For detailed information:

1. Click on a job ID to open the job details page
2. View the **Logs** tab for real-time output
3. Check the **Metrics** tab for resource utilization
4. Review the **Events** tab for lifecycle events

### API Monitoring

You can also monitor jobs programmatically:

```javascript
// Get job status
const jobStatus = await fetch(`http://localhost:13000/api/plugin-core/jobs/${jobId}`, {
  headers: { Authorization: 'Bearer YOUR_API_TOKEN' },
}).then((res) => res.json());

// Stream job logs
const logStream = new EventSource(`http://localhost:13000/api/plugin-core/jobs/${jobId}/logs`);
logStream.onmessage = (event) => {
  console.log(JSON.parse(event.data).line);
};
```

## Managing Running Jobs

### Cancelling Jobs

To cancel a running job:

1. In the Jobs table, find the job you want to cancel
2. Click the **Actions** menu (three dots)
3. Select **Cancel Job**
4. Confirm the cancellation

Via API:

```javascript
await fetch(`http://localhost:13000/api/plugin-core/jobs/${jobId}/cancel`, {
  method: 'POST',
  headers: { Authorization: 'Bearer YOUR_API_TOKEN' },
});
```

### Extending Job Duration

If your job needs more time:

1. Open the job details page
2. Click **Extend Duration**
3. Specify additional time needed
4. Confirm the extension

Note: Not all providers support duration extension.

## Job Templates

For frequently used job configurations:

1. Navigate to **Jobs** > **Templates**
2. Click **Create Template**
3. Configure the job parameters
4. Save the template with a descriptive name

To use a template:

1. Click **Create Job from Template**
2. Select your saved template
3. Modify any parameters as needed
4. Submit the job

## Batch Jobs

For processing multiple similar workloads:

1. Navigate to **Jobs** > **Create Batch**
2. Configure the base job parameters
3. Upload a CSV file with variable parameters
4. Specify concurrency limits
5. Submit the batch

Each row in the CSV file will create a separate job with the specified parameters.

## Scheduled Jobs

To run jobs on a recurring schedule:

1. Navigate to **Jobs** > **Schedules**
2. Click **Create Schedule**
3. Configure the job parameters
4. Set the schedule using cron syntax
5. Save the schedule

## Troubleshooting

### Common Job Failures

| Error                   | Possible Causes                             | Solutions                                  |
| ----------------------- | ------------------------------------------- | ------------------------------------------ |
| Image Pull Error        | Invalid image name, private registry        | Check image name, add registry credentials |
| Resource Limit Exceeded | Job requested more resources than available | Reduce resource requirements               |
| Network Error           | Provider network connectivity issues        | Try a different provider                   |
| Exit Code 1             | Application error                           | Check application logs for details         |

### Debugging Strategies

1. **Check Logs**: Always start by examining the complete job logs
2. **Verify Configuration**: Ensure resource limits are appropriate
3. **Test Locally**: Run your container locally before submitting
4. **Provider Status**: Check provider network status
5. **Incremental Changes**: Make one change at a time when troubleshooting

## Next Steps

- Learn about [Network Providers](./network-providers)
- Explore [Cost Optimization](./cost-optimization) strategies
- Review the [API Reference](../api/jobs) for programmatic job management
