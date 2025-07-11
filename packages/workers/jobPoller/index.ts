// Import types from local types.ts file
import type { JobStatusType } from './types';

// Import logger utility
import { logger } from './logger';

// Import event types for proper typing
interface JobCreatedEvent {
  jobId: string;
  provider: string;
  status: JobStatusType;
}

interface JobStatusChangedEvent {
  jobId: string;
  oldStatus: JobStatusType;
  newStatus: JobStatusType;
  logs?: string[];
}

interface JobCancelledEvent {
  jobId: string;
  refund?: number;
}

// Import mock JobService for testing
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { JobService } = require('./mockJobService');

class JobPoller {
  // Using a more specific type definition for the JobService
  private jobService: {
    on: (event: string, listener: Function) => void;
    getActiveJobs: () => Array<{ id: string; status?: JobStatusType }>;
    pollStatus: (jobId: string) => Promise<{ status: JobStatusType; logs?: string[] }>;
  };
  private pollInterval: number;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor(pollIntervalMs = 15000) {
    this.pollInterval = pollIntervalMs;
    this.jobService = new JobService();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.jobService.on('jobCreated', (event: JobCreatedEvent) => {
      logger.log(`New job created: ${event.jobId} on ${event.provider}`);
    });

    this.jobService.on('jobStatusChanged', (event: JobStatusChangedEvent) => {
      logger.log(`Job ${event.jobId} status: ${event.oldStatus} → ${event.newStatus}`);

      if (event.logs && event.logs.length > 0) {
        logger.log(`Latest logs:`, event.logs.slice(-3));
      }
    });

    this.jobService.on('jobCancelled', (event: JobCancelledEvent) => {
      logger.log(`Job ${event.jobId} cancelled. Refund: ${event.refund || 'N/A'}`);
    });
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      logger.log('Already running');
      return;
    }

    logger.log(`Starting with ${this.pollInterval}ms interval`);
    this.isRunning = true;

    // Initial poll
    await this.pollActiveJobs();

    // Set up recurring polling
    this.intervalId = setInterval(async () => {
      try {
        await this.pollActiveJobs();
      } catch (error: unknown) {
        logger.error(
          'Error during polling cycle:',
          error instanceof Error ? error.message : String(error)
        );
      }
    }, this.pollInterval);

    logger.log('Background worker started successfully');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    logger.log('Stopping background worker');
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    logger.log('Background worker stopped');
  }

  private async pollActiveJobs(): Promise<void> {
    const activeJobs = this.jobService.getActiveJobs();

    if (activeJobs.length === 0) {
      return;
    }

    logger.log(`Polling ${activeJobs.length} active jobs`);

    const pollPromises = activeJobs.map(async (job) => {
      try {
        // Skip polling for terminal states
        if (job && job.status && this.isTerminalState(job.status)) {
          return;
        }

        await this.jobService.pollStatus(job.id);
      } catch (error: unknown) {
        logger.error(
          `Failed to poll job ${job.id}:`,
          error instanceof Error ? error.message : String(error)
        );
      }
    });

    await Promise.allSettled(pollPromises);
  }

  private isTerminalState(status: JobStatusType): boolean {
    return ['completed', 'failed', 'cancelled'].includes(status);
  }

  // Health check method
  getStatus(): { running: boolean; activeJobs: number; pollInterval: number } {
    return {
      running: this.isRunning,
      activeJobs: this.jobService.getActiveJobs().length,
      pollInterval: this.pollInterval,
    };
  }
}

// Export for programmatic use
export { JobPoller };

// CLI execution
// Check if this is being run directly (not imported)
// Check if this is the main module (compatible with both ESM and CommonJS)
const isMainModule = typeof require !== 'undefined' ? require.main === module : false;

if (isMainModule) {
  const poller = new JobPoller();

  // Graceful shutdown handling
  process.on('SIGINT', async () => {
    logger.log('Received SIGINT, shutting down gracefully...');
    await poller.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.log('Received SIGTERM, shutting down gracefully...');
    await poller.stop();
    process.exit(0);
  });

  // Start the poller
  poller.start().catch((error: unknown) => {
    logger.error('Failed to start:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
