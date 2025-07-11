---
sidebar_position: 1
---

# Common Issues

This guide covers common issues you might encounter when using Cortex and provides troubleshooting steps to resolve them.

## Job Submission Issues

### Job Stuck in "Pending" State

**Symptoms:**

- Job remains in "pending" state for more than 5 minutes
- No error messages in the job logs
- No provider assignment

**Possible Causes:**

1. **Provider Unavailability**: Selected provider network is congested or offline
2. **Resource Constraints**: Requested resources exceed available capacity
3. **Wallet Balance**: Insufficient funds in provider wallet
4. **Network Connectivity**: Connection issues between Cortex and provider

**Troubleshooting Steps:**

1. Check provider status:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/plugin-core/providers/{providerId}/status" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. Verify wallet balance:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/plugin-core/providers/{providerId}/wallet" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

3. Check job submission logs:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/plugin-core/jobs/{jobId}/events" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

4. Try submitting to a different provider:
   ```bash
   curl -X POST "https://your-cortex-instance.com/api/plugin-core/jobs/{jobId}/resubmit" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"provider": "alternate-provider-id"}'
   ```

### Job Fails Immediately

**Symptoms:**

- Job transitions from "pending" to "failed" quickly
- Error message in job logs

**Possible Causes:**

1. **Invalid Configuration**: Incorrect job parameters
2. **Image Issues**: Docker image not found or access denied
3. **Resource Mismatch**: Requested resources not available
4. **Provider Rejection**: Provider rejected the job

**Troubleshooting Steps:**

1. Check job logs for specific error messages:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/plugin-core/jobs/{jobId}/logs" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. Verify image accessibility:

   ```bash
   docker pull {image}:{tag}
   ```

3. Check if the image is compatible with the provider:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/plugin-core/providers/{providerId}/capabilities" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

4. Adjust resource requests to match provider capabilities:
   ```bash
   curl -X PUT "https://your-cortex-instance.com/api/plugin-core/jobs/{jobId}" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "cpu": 1000,
       "memory": "1Gi",
       "storage": "10Gi"
     }'
   ```

## Provider Connection Issues

### Provider Shows as "Offline"

**Symptoms:**

- Provider status shows as "offline" in dashboard
- Jobs cannot be submitted to the provider
- Error messages about connection failures

**Possible Causes:**

1. **Network Connectivity**: Network issues between Cortex and provider
2. **Provider Downtime**: Provider network is experiencing outages
3. **Configuration Issues**: Incorrect provider endpoints
4. **Authentication Failure**: Invalid or expired credentials

**Troubleshooting Steps:**

1. Check provider endpoints:

   ```bash
   ping {provider-endpoint}
   ```

2. Verify provider status from external sources:
   - Check provider's status page
   - Check community forums or Discord channels

3. Update provider configuration:

   ```bash
   curl -X PUT "https://your-cortex-instance.com/api/plugin-core/providers/{providerId}" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "endpoints": ["https://updated-endpoint.example.com"]
     }'
   ```

4. Refresh provider credentials:
   ```bash
   curl -X POST "https://your-cortex-instance.com/api/plugin-core/providers/{providerId}/refresh-auth" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

### Provider Authentication Failures

**Symptoms:**

- Error messages about authentication failures
- Provider shows as "degraded" status
- Jobs fail with authentication errors

**Possible Causes:**

1. **Expired Credentials**: API keys or tokens have expired
2. **Wallet Issues**: Wallet has insufficient funds or permissions
3. **Changed Requirements**: Provider updated their authentication requirements
4. **Key Rotation**: Automatic key rotation failed

**Troubleshooting Steps:**

1. Check authentication logs:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/logs?service=provider-auth&provider={providerId}" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. Update provider credentials:

   ```bash
   curl -X PUT "https://your-cortex-instance.com/api/plugin-core/providers/{providerId}/credentials" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "apiKey": "new-api-key",
       "secret": "new-secret"
     }'
   ```

3. Check wallet balance and top up if needed:
   ```bash
   curl -X POST "https://your-cortex-instance.com/api/plugin-core/providers/{providerId}/wallet/topup" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "amount": "10.0"
     }'
   ```

## Dashboard and UI Issues

### Dashboard Not Loading

**Symptoms:**

- Blank page when accessing dashboard
- Console errors in browser developer tools
- Partial loading of UI components

**Possible Causes:**

1. **Browser Compatibility**: Unsupported browser version
2. **Cache Issues**: Stale cached resources
3. **JavaScript Errors**: Runtime errors in frontend code
4. **API Connectivity**: Frontend cannot connect to backend API

**Troubleshooting Steps:**

1. Clear browser cache and cookies:
   - Chrome: Settings > Privacy and security > Clear browsing data
   - Firefox: Options > Privacy & Security > Cookies and Site Data > Clear Data

2. Try a different browser:
   - Chrome, Firefox, Safari, or Edge (latest versions)

3. Check browser console for specific errors:
   - Open developer tools (F12) and look at the Console tab

4. Verify API connectivity:
   ```bash
   curl -X GET "https://your-cortex-instance.com/api/health" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

### Charts and Metrics Not Displaying

**Symptoms:**

- Empty charts or "No data" messages
- Metrics showing as "N/A" or "Loading..."
- Error messages about data retrieval

**Possible Causes:**

1. **Data Collection Issues**: Metrics collection service is not running
2. **Time Range**: Selected time range has no data
3. **Permission Issues**: User lacks access to metrics data
4. **Aggregation Errors**: Problems with data aggregation

**Troubleshooting Steps:**

1. Check metrics service status:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/services/metrics" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. Try a different time range:
   - Adjust the time picker to a wider range
   - Select "Last 24 hours" or "Last 7 days"

3. Verify permissions:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/users/me/permissions" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

4. Restart metrics collection:
   ```bash
   curl -X POST "https://your-cortex-instance.com/api/system/services/metrics/restart" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

## API and Integration Issues

### API Rate Limiting

**Symptoms:**

- HTTP 429 "Too Many Requests" responses
- Error messages about rate limits
- Throttled API performance

**Possible Causes:**

1. **Excessive Requests**: Too many API calls in a short period
2. **Inefficient Polling**: Frequent polling instead of webhooks
3. **Plan Limitations**: Current plan has lower rate limits
4. **Shared IP**: Multiple systems sharing the same IP address

**Troubleshooting Steps:**

1. Check current rate limit status:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/rate-limits" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. Implement exponential backoff:

   ```javascript
   async function fetchWithBackoff(url, options, maxRetries = 5) {
     let retries = 0;
     while (retries < maxRetries) {
       try {
         const response = await fetch(url, options);
         if (response.status !== 429) return response;

         const retryAfter = response.headers.get('Retry-After') || Math.pow(2, retries);
         await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
         retries++;
       } catch (error) {
         if (retries === maxRetries - 1) throw error;
         retries++;
       }
     }
   }
   ```

3. Switch to webhooks for event notifications:

   ```bash
   curl -X POST "https://your-cortex-instance.com/api/plugin-core/webhooks" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://your-server.com/webhook",
       "events": ["job.status.changed", "provider.status.changed"]
     }'
   ```

4. Upgrade your plan or request custom rate limits:
   - Contact support for plan options

### Webhook Delivery Failures

**Symptoms:**

- Missing webhook notifications
- Failed delivery status in webhook logs
- Timeout errors in webhook delivery

**Possible Causes:**

1. **Endpoint Unavailability**: Webhook endpoint is offline
2. **Timeout Issues**: Endpoint takes too long to respond
3. **Network Problems**: Network issues between Cortex and endpoint
4. **Signature Verification**: Webhook signature validation fails

**Troubleshooting Steps:**

1. Check webhook delivery logs:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/plugin-core/webhooks/{webhookId}/history" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. Verify endpoint availability:

   ```bash
   curl -X POST "https://your-webhook-endpoint.com" \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

3. Update webhook configuration:

   ```bash
   curl -X PUT "https://your-cortex-instance.com/api/plugin-core/webhooks/{webhookId}" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "url": "https://new-endpoint.example.com",
       "timeout": 10
     }'
   ```

4. Check signature verification code:

   ```javascript
   const crypto = require('crypto');

   function verifySignature(payload, signature, secret) {
     const hmac = crypto.createHmac('sha256', secret);
     const expectedSignature = hmac.update(JSON.stringify(payload)).digest('hex');
     return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
   }
   ```

## System Performance Issues

### High CPU or Memory Usage

**Symptoms:**

- System alerts about resource usage
- Slow response times
- Job processing delays
- Dashboard performance degradation

**Possible Causes:**

1. **Job Volume**: High number of concurrent jobs
2. **Database Growth**: Large database with inefficient queries
3. **Log Accumulation**: Excessive logging filling storage
4. **Memory Leaks**: Application memory leaks

**Troubleshooting Steps:**

1. Check system resource usage:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/metrics/resources" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. Identify resource-intensive processes:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/processes" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

3. Optimize database:

   ```bash
   curl -X POST "https://your-cortex-instance.com/api/system/database/optimize" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

4. Configure log rotation:
   ```bash
   curl -X PUT "https://your-cortex-instance.com/api/system/logging/config" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "maxSize": "100MB",
       "maxFiles": 10,
       "compressionEnabled": true
     }'
   ```

### Database Connection Issues

**Symptoms:**

- Error messages about database connections
- Intermittent system availability
- Slow query responses
- Connection pool exhaustion

**Possible Causes:**

1. **Connection Leaks**: Unclosed database connections
2. **Pool Configuration**: Insufficient connection pool size
3. **Database Load**: High query volume or long-running queries
4. **Network Issues**: Network problems between application and database

**Troubleshooting Steps:**

1. Check database connection status:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/database/status" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. Monitor active connections:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/database/connections" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

3. Identify slow queries:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/database/slow-queries" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

4. Adjust connection pool settings:
   ```bash
   curl -X PUT "https://your-cortex-instance.com/api/system/database/config" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "poolSize": 20,
       "idleTimeout": 30000,
       "connectionTimeout": 5000
     }'
   ```

## Deployment and Upgrade Issues

### Failed Upgrades

**Symptoms:**

- Error messages during upgrade process
- System in inconsistent state
- Services failing to start after upgrade
- Version mismatch between components

**Possible Causes:**

1. **Dependency Conflicts**: Incompatible dependencies
2. **Database Schema**: Failed database migrations
3. **Configuration Changes**: New configuration requirements
4. **Disk Space**: Insufficient disk space for upgrade

**Troubleshooting Steps:**

1. Check upgrade logs:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/logs?service=upgrade" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. Verify system requirements:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/requirements" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

3. Check disk space:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/storage" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

4. Rollback to previous version if needed:
   ```bash
   curl -X POST "https://your-cortex-instance.com/api/system/rollback" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "version": "previous-stable-version"
     }'
   ```

### Container Orchestration Issues

**Symptoms:**

- Containers failing to start
- Service discovery problems
- Network connectivity issues between containers
- Resource allocation errors

**Possible Causes:**

1. **Resource Constraints**: Insufficient CPU/memory
2. **Network Configuration**: Incorrect network settings
3. **Image Issues**: Container image problems
4. **Volume Mounts**: Incorrect or missing volume mounts

**Troubleshooting Steps:**

1. Check container status:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/containers" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

2. View container logs:

   ```bash
   curl -X GET "https://your-cortex-instance.com/api/system/containers/{containerId}/logs" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

3. Restart problematic containers:

   ```bash
   curl -X POST "https://your-cortex-instance.com/api/system/containers/{containerId}/restart" \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

4. Update resource allocations:
   ```bash
   curl -X PUT "https://your-cortex-instance.com/api/system/containers/{containerId}/resources" \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "cpu": "1.0",
       "memory": "1Gi"
     }'
   ```

## Getting Additional Help

If you're still experiencing issues after trying the troubleshooting steps above, there are several ways to get additional help:

1. **Community Forum**: Post your question on the [Cortex Community Forum](https://community.cortex.io)

2. **Discord Channel**: Join our [Discord community](https://discord.gg/cortex) for real-time help

3. **GitHub Issues**: Report bugs on our [GitHub repository](https://github.com/cortexlabs/cortex)

4. **Support Ticket**: Enterprise customers can open a support ticket through the dashboard

5. **Documentation**: Check the [full documentation](https://docs.cortex.io) for detailed guides

When seeking help, please provide:

- Cortex version
- Error messages and logs
- Steps to reproduce the issue
- Environment details (OS, deployment method)
- Any recent changes made to the system

## Next Steps

- Learn about [Debugging](./debugging) techniques for advanced troubleshooting
- Explore [Performance Optimization](./performance) for system tuning
- Review [Security Best Practices](../architecture/security) to ensure your deployment is secure
