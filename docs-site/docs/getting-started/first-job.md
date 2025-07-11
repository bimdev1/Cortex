---
sidebar_position: 3
---

# Your First Job

This guide walks you through submitting your first computational job on Cortex, explaining each step in detail.

## Understanding Job Components

Before submitting a job, it's helpful to understand the key components:

- **Provider**: The DePIN network that will execute your job (e.g., Akash, Render)
- **Docker Image**: Container image with your application code
- **Resources**: CPU, memory, and storage requirements
- **Duration**: Maximum runtime for your job
- **Network**: Optional port configurations for networked applications
- **Volumes**: Optional persistent storage configurations

## Preparing Your Docker Image

For this guide, we'll use a simple "Hello World" container:

```bash
# Create a simple Dockerfile
cat > Dockerfile << 'EOF'
FROM alpine:latest
CMD echo "Hello from Cortex! Running on $(hostname) at $(date)"
EOF

# Build the image
docker build -t hello-cortex .

# Push to a registry (Docker Hub example)
docker tag hello-cortex yourusername/hello-cortex
docker push yourusername/hello-cortex
```

## Submitting via Dashboard

1. Navigate to the Cortex dashboard at `http://localhost:3000`
2. Click on the **Submit Job** button
3. Fill in the job details:
   - **Provider**: Select "Akash Network"
   - **Docker Image**: `yourusername/hello-cortex`
   - **CPU**: `100` (millicores)
   - **Memory**: `128Mi`
   - **Storage**: `100Mi`
   - **Duration**: `300` (5 minutes)
4. Click **Submit**

## Submitting via API

You can also submit jobs programmatically:

```javascript
// Using Node.js with fetch
const response = await fetch('http://localhost:13000/api/plugin-core/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_API_TOKEN',
  },
  body: JSON.stringify({
    provider: 'akash',
    image: 'yourusername/hello-cortex',
    cpu: 100,
    memory: '128Mi',
    storage: '100Mi',
    duration: 300,
  }),
});

const job = await response.json();
console.log('Job submitted:', job);
```

## Monitoring Job Progress

After submission, your job will go through several states:

1. **Pending**: Job is being scheduled on the provider network
2. **Running**: Job is actively executing
3. **Completed**: Job has finished successfully
4. **Failed**: Job encountered an error

You can monitor progress in the dashboard's **Jobs** tab or via API:

```javascript
const jobStatus = await fetch(`http://localhost:13000/api/plugin-core/jobs/${jobId}`, {
  headers: { Authorization: 'Bearer YOUR_API_TOKEN' },
}).then((res) => res.json());

console.log('Current status:', jobStatus.status);
```

## Viewing Results

Once your job completes:

1. In the dashboard, click on the job ID to view details
2. Select the **Logs** tab to see the output
3. For jobs with file outputs, check the **Outputs** tab

## Advanced Job Configuration

For more complex workloads, you can specify additional parameters:

### Environment Variables

```json
{
  "provider": "akash",
  "image": "yourusername/app",
  "cpu": 500,
  "memory": "512Mi",
  "storage": "1Gi",
  "duration": 3600,
  "env": {
    "DATABASE_URL": "postgres://user:pass@host:5432/db",
    "API_KEY": "secret-key"
  }
}
```

### Port Mappings

```json
{
  "provider": "akash",
  "image": "nginx:alpine",
  "cpu": 100,
  "memory": "128Mi",
  "storage": "100Mi",
  "duration": 3600,
  "ports": [
    {
      "port": 80,
      "expose": true
    }
  ]
}
```

### Persistent Volumes

```json
{
  "provider": "akash",
  "image": "postgres:14",
  "cpu": 500,
  "memory": "512Mi",
  "storage": "5Gi",
  "duration": 86400,
  "volumes": [
    {
      "name": "data",
      "mountPath": "/var/lib/postgresql/data",
      "size": "5Gi"
    }
  ]
}
```

## Next Steps

Now that you've submitted your first job, explore these topics:

- [Job Management](../guide/job-management) for advanced operations
- [Cost Optimization](../guide/cost-optimization) to reduce expenses
- [Network Providers](../guide/network-providers) to learn about different DePIN options
