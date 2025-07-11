---
sidebar_position: 2
---

# Atomic Commitment Protocol

Cortex implements a robust atomic commitment protocol to ensure data consistency across distributed DePIN networks. This document explains how Cortex maintains transaction integrity when working with multiple decentralized systems.

## The Challenge of Distributed Transactions

When orchestrating workloads across multiple DePIN networks, Cortex must ensure that operations either complete successfully across all networks or are rolled back entirely. This is particularly challenging because:

1. Each DePIN network has its own consensus mechanism
2. Network latency and failures are common in decentralized systems
3. Different providers have varying transaction models
4. Partial failures can lead to inconsistent state

## Two-Phase Commit Protocol

Cortex implements a modified two-phase commit (2PC) protocol adapted for blockchain and DePIN environments:

![Two-Phase Commit Diagram](/img/atomic-commitment.png)

### Phase 1: Preparation

During the preparation phase:

1. The Cortex coordinator sends a `prepare` request to all involved provider adapters
2. Each provider validates the operation and reserves necessary resources
3. Providers respond with `ready` or `abort`
4. If any provider responds with `abort`, the entire transaction is cancelled

```typescript
// Simplified coordinator code
async function prepareTransaction(txId: string, providers: IDePINProvider[]) {
  const responses = await Promise.all(
    providers.map((provider) => provider.prepare(txId, operationData))
  );

  return responses.every((response) => response.status === 'ready');
}
```

### Phase 2: Commit or Rollback

Based on the preparation results:

1. If all providers are `ready`, the coordinator sends a `commit` message
2. If any provider aborted, the coordinator sends a `rollback` message
3. Each provider finalizes or cancels their part of the transaction
4. The coordinator records the final outcome

```typescript
// Simplified commit phase
async function commitTransaction(txId: string, providers: IDePINProvider[]) {
  try {
    await Promise.all(providers.map((provider) => provider.commit(txId)));
    return true;
  } catch (error) {
    // Handle commit failures
    await rollbackTransaction(txId, providers);
    return false;
  }
}
```

## Handling Network Failures

To handle network failures and crashes, Cortex implements:

### Transaction Logs

All transaction steps are recorded in a durable transaction log:

```json
{
  "txId": "tx_1a2b3c4d5e6f",
  "status": "preparing",
  "participants": ["akash", "render"],
  "operation": "job_deployment",
  "data": { ... },
  "timestamps": {
    "created": "2025-07-10T12:00:00Z",
    "prepared": null,
    "committed": null
  },
  "participantStatus": {
    "akash": "ready",
    "render": "pending"
  }
}
```

### Recovery Process

When the system restarts after a failure:

1. The recovery manager reads the transaction log
2. For transactions in `preparing` state:
   - If timeout exceeded, rollback
   - Otherwise, continue preparation
3. For transactions in `committing` state:
   - Retry commit for all participants
4. For transactions in `rolling_back` state:
   - Ensure all participants have rolled back

```typescript
// Simplified recovery process
async function recoverTransactions() {
  const pendingTxs = await transactionLog.getPendingTransactions();

  for (const tx of pendingTxs) {
    if (tx.status === 'preparing' && isTimedOut(tx)) {
      await rollbackTransaction(tx.txId, getProviders(tx.participants));
    } else if (tx.status === 'committing') {
      await commitTransaction(tx.txId, getProviders(tx.participants));
    } else if (tx.status === 'rolling_back') {
      await rollbackTransaction(tx.txId, getProviders(tx.participants));
    }
  }
}
```

## Timeouts and Heuristic Decisions

Cortex implements timeout mechanisms to prevent indefinite blocking:

1. **Preparation Timeout**: Maximum time allowed for preparation phase
2. **Commit Timeout**: Maximum time allowed for commit phase
3. **Heuristic Decision**: In rare cases, make a best-effort decision to commit or abort

```typescript
// Timeout configuration
const PREPARE_TIMEOUT_MS = 30000; // 30 seconds
const COMMIT_TIMEOUT_MS = 60000; // 60 seconds

// Heuristic resolution
async function resolveHeuristically(txId: string) {
  const tx = await transactionLog.getTransaction(txId);
  const readyCount = countReadyParticipants(tx);

  if (readyCount / tx.participants.length > 0.75) {
    // More than 75% ready, attempt commit
    return commitTransaction(txId, getProviders(tx.participants));
  } else {
    // Otherwise rollback
    return rollbackTransaction(txId, getProviders(tx.participants));
  }
}
```

## Blockchain-Specific Adaptations

For blockchain-based DePIN networks, Cortex implements additional safeguards:

### Transaction Monitoring

1. Monitor transaction inclusion in blocks
2. Handle chain reorganizations
3. Verify transaction finality based on network-specific rules

```typescript
// Simplified blockchain transaction monitoring
async function monitorBlockchainTransaction(network: string, txHash: string) {
  let confirmations = 0;
  const requiredConfirmations = getRequiredConfirmations(network);

  while (confirmations < requiredConfirmations) {
    await sleep(blockTime);
    const status = await getTransactionStatus(network, txHash);

    if (status === 'confirmed') {
      confirmations++;
    } else if (status === 'failed' || status === 'rejected') {
      throw new Error(`Transaction failed on ${network}`);
    }
  }

  return true;
}
```

### Escrow Mechanisms

For financial transactions, Cortex uses escrow mechanisms:

1. Funds are first locked in an escrow contract
2. Only released when all conditions are met
3. Automatically returned if the transaction is aborted

## Idempotent Operations

All operations in Cortex are designed to be idempotent:

1. Multiple identical requests produce the same result
2. Safe to retry operations without side effects
3. Transaction IDs used to detect and handle duplicates

```typescript
// Idempotent job submission
async function submitJob(jobConfig: JobConfiguration) {
  const jobId = generateIdempotentId(jobConfig);

  // Check if job already exists
  const existingJob = await jobService.findJob(jobId);
  if (existingJob) {
    return existingJob;
  }

  // Create new job
  return jobService.createJob(jobId, jobConfig);
}
```

## Compensation Transactions

For operations that cannot be easily rolled back, Cortex uses compensation transactions:

1. Define compensating actions for each operation
2. Execute compensations in reverse order
3. Record compensation status in the transaction log

```typescript
// Compensation example
const compensations = {
  create_deployment: async (txData) => {
    await providerAdapter.deleteDeployment(txData.deploymentId);
  },
  fund_wallet: async (txData) => {
    await providerAdapter.withdrawFunds(txData.walletId, txData.amount);
  },
};

async function executeCompensation(txId: string) {
  const tx = await transactionLog.getTransaction(txId);

  // Execute compensations in reverse order
  for (const step of [...tx.steps].reverse()) {
    await compensations[step.operation](step.data);
  }
}
```

## Consistency Levels

Cortex supports multiple consistency levels for different use cases:

| Consistency Level    | Description                       | Use Case                |
| -------------------- | --------------------------------- | ----------------------- |
| **Strong**           | Full 2PC with all safeguards      | Financial transactions  |
| **Eventual**         | Asynchronous updates with retries | Status updates, metrics |
| **Read-your-writes** | Immediate local updates           | UI responsiveness       |
| **Best-effort**      | No guarantees                     | Non-critical operations |

## Performance Optimizations

To minimize the performance impact of the 2PC protocol, Cortex implements:

1. **Parallel Preparation**: Prepare all participants in parallel
2. **Early Abort**: Cancel as soon as any participant aborts
3. **Batching**: Group related operations into a single transaction
4. **Presume Abort**: Default to rollback for uncertain states
5. **Read-Only Optimizations**: Skip 2PC for read-only operations

## Monitoring and Debugging

Cortex provides tools for monitoring and debugging distributed transactions:

1. **Transaction Explorer**: UI for viewing transaction status and history
2. **Distributed Tracing**: OpenTelemetry integration for transaction tracing
3. **Anomaly Detection**: Automatic detection of stuck or inconsistent transactions
4. **Manual Resolution**: Admin tools for manually resolving problematic transactions

## Next Steps

- Learn about [Security](./security) architecture
- Understand [Scaling](./scaling) strategies for high-volume deployments
- Explore [Provider Integration](./provider-integration) for adding new networks
