---
sidebar_position: 3
---

# Network Providers

This guide covers the DePIN network providers supported by Cortex, their unique features, configuration requirements, and best practices for each.

## Supported Providers

Cortex currently supports the following decentralized physical infrastructure networks:

| Provider | Type | Best For | Cost Range |
|----------|------|----------|------------|
| Akash Network | General Compute | Web apps, APIs, databases | $0.01-0.10 per CPU/hr |
| Render Network | GPU Compute | AI/ML, rendering, video processing | $0.10-1.00 per GPU/hr |
| Golem | Batch Processing | Scientific computing, simulations | $0.005-0.05 per CPU/hr |
| Bittensor | AI Inference | Large language models, AI APIs | Pay-per-call |
| io.net | Storage + Compute | Data-intensive applications | $0.02-0.20 per CPU/hr |

## Provider Configuration

Each provider requires specific configuration in your Cortex setup:

### Akash Network

```json
// config/providers/akash.json
{
  "mnemonic": "your wallet mnemonic",
  "endpoints": [
    "https://akash-rpc.polkachu.com:443",
    "https://rpc-akash.ecostake.com:443"
  ],
  "gasPrice": "0.025uakt",
  "deploymentProfile": "standard",
  "maxBidPrice": {
    "denom": "uakt",
    "amount": "10000"
  }
}
```

Key configuration parameters:
- **mnemonic**: Your wallet seed phrase (keep secure!)
- **endpoints**: RPC endpoints for the Akash network
- **gasPrice**: Transaction fee in uakt (micro AKT)
- **deploymentProfile**: Resource profile template
- **maxBidPrice**: Maximum bid price for compute resources

### Render Network

```json
// config/providers/render.json
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
// config/providers/golem.json
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
// config/providers/bittensor.json
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
// config/providers/ionet.json
{
  "apiKey": "your-ionet-api-key",
  "region": "us-east",
  "replicationFactor": 3,
  "storageClass": "standard"
}
```

## Provider Selection Strategy

Cortex can automatically select the optimal provider for your workload based on:

### Cost Optimization

When cost is the primary concern:

```json
{
  "providerStrategy": "cost",
  "maxPrice": 0.05,
  "fallbackProvider": "akash"
}
```

### Performance Optimization

When performance is the primary concern:

```json
{
  "providerStrategy": "performance",
  "minCpu": 4000,
  "minMemory": "8Gi",
  "maxLatency": 100
}
```

### Availability Optimization

When uptime is the primary concern:

```json
{
  "providerStrategy": "availability",
  "minUptime": 99.9,
  "replication": true,
  "regions": ["us-east", "eu-west", "ap-south"]
}
```

## Provider-Specific Features

### Akash Network

- **Persistent Storage**: Supports persistent volumes via Kubernetes PVCs
- **Escrow System**: Funds locked in escrow until job completion
- **Manifest Customization**: Supports custom Kubernetes manifests

### Render Network

- **GPU Types**: Offers various GPU models (A100, V100, T4)
- **Web Services**: Built-in support for web service deployments
- **Private Networking**: VPC support for secure communications

### Golem

- **Task Fragmentation**: Automatically splits large workloads
- **Verification System**: Ensures computation correctness
- **P2P Direct Payments**: Pay only for completed tasks

### Bittensor

- **Neural Networks**: Specialized for AI model inference
- **Incentive Mechanism**: Token-based incentives for validators
- **Subnet Selection**: Different subnets for different AI capabilities

### io.net

- **Content Delivery**: Built-in CDN capabilities
- **Data Persistence**: Long-term storage with compute
- **Geo-replication**: Automatic data replication across regions

## Best Practices

### Provider Selection

- **Match workload to provider strengths**: Use Render for GPU tasks, Akash for web services
- **Consider data locality**: Choose providers in regions close to your users
- **Balance cost vs. performance**: Higher reliability often comes with higher costs

### Resource Optimization

- **Right-size resources**: Request only what your application needs
- **Use spot instances**: For non-critical, interruptible workloads
- **Implement auto-scaling**: Scale resources based on demand

### Security Considerations

- **Secure credentials**: Never hardcode API keys or mnemonics
- **Use environment variables**: Pass sensitive data via env vars
- **Audit provider permissions**: Review what each provider can access

## Troubleshooting Provider Issues

### Common Provider Errors

| Error | Provider | Solution |
|-------|----------|----------|
| Insufficient funds | Akash, Golem | Add funds to your wallet |
| Resource unavailable | Render, io.net | Try a different region or resource size |
| Network congestion | Bittensor | Increase gas price or retry later |
| Deployment timeout | All | Check provider status and network connectivity |

### Provider Status Checking

```bash
# Check Akash provider status
cortex provider status akash

# Check all provider statuses
cortex provider status --all
```

## Next Steps

- Learn about [Cost Optimization](./cost-optimization) strategies
- Explore the [API Reference](../api/providers) for programmatic provider management
- Review [Architecture](../architecture/overview) to understand how Cortex integrates with providers
