import { EventEmitter } from 'events';
import { logger } from './logger';
import type { JobStatusType } from './types';

// Define job interface to avoid using 'any'
interface JobData {
  jobId: string;
  providerJobId: string;
  status: JobStatusType;
  logs?: string[];
}

// Mock JobService for testing the JobPoller
export class JobService extends EventEmitter {
  private mockActiveJobs = new Map<string, JobData>();

  constructor() {
    super();
    logger.log('MockJobService initialized');

    // Add a sample job for testing
    this.mockActiveJobs.set('job-123', {
      jobId: 'job-123',
      providerJobId: 'provider-456',
      status: 'running',
    });
  }

  async pollStatus(jobId: string): Promise<JobData> {
    logger.log(`Polling status for job ${jobId}`);
    return {
      jobId,
      providerJobId: 'provider-456',
      status: 'running',
      logs: ['Log entry 1', 'Log entry 2'],
    };
  }

  getActiveJobs(): Array<{ id: string; status: JobStatusType }> {
    // Convert Map to Array format expected by JobPoller
    return Array.from(this.mockActiveJobs.entries()).map(([id, job]) => ({
      id,
      status: job.status,
    }));
  }
}
