import { EventEmitter } from 'events';
import { IDePINProvider, JobConfiguration, JobSubmissionResult, JobStatus, JobStatusType } from '../../../../../providers/interfaces';
import { AkashProvider, AkashConfig } from '../../../../../providers/akash';
import * as fs from 'fs';
import * as path from 'path';

export class JobService extends EventEmitter {
  private providers: Map<string, IDePINProvider> = new Map();
  private activeJobs: Map<string, JobStatus> = new Map();

  constructor() {
    super();
    this.initializeProviders();
  }

  private async initializeProviders() {
    try {
      // Load Akash provider configuration from file
      const configPath = path.resolve(process.cwd(), 'config/providers/akash.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      const akashConfig: AkashConfig = JSON.parse(configData);
      const akashProvider = new AkashProvider(akashConfig);
    
      try {
        await akashProvider.connect();
        this.providers.set('akash', akashProvider);
        console.log('Akash provider initialized successfully');
      } catch (error: unknown) {
        console.error('Failed to initialize Akash provider:', error instanceof Error ? error.message : error);
      }
    } catch (error: unknown) {
      console.error('Failed to load Akash provider configuration:', error instanceof Error ? error.message : error);
    }
  }

  async submitJob(jobConfig: JobConfiguration & { provider: string }): Promise<JobSubmissionResult> {
    const provider = this.providers.get(jobConfig.provider);
    if (!provider) {
      throw new Error(`Provider ${jobConfig.provider} not available`);
    }

    try {
      const result = await provider.submitJob(jobConfig);
      
      // Persist to database (NocoBase collection)
      await this.persistJobToDatabase({
        id: result.jobId,
        name: `Job-${Date.now()}`,
        status: result.status,
        configuration: jobConfig,
        estimatedCost: result.estimatedCost,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Cache active job
      this.activeJobs.set(result.jobId, {
        jobId: result.jobId,
        providerJobId: result.providerJobId,
        status: result.status,
      });

      // Emit job created event
      this.emit('jobCreated', {
        jobId: result.jobId,
        provider: jobConfig.provider,
        status: result.status,
      });

      return result;
    } catch (error: unknown) {
      console.error('Job submission failed:', error instanceof Error ? error.message : error);
      throw error;
    }
  }

  async pollStatus(jobId: string): Promise<JobStatus> {
    // Find job in active jobs map
    const cachedJob = this.activeJobs.get(jobId);
    if (!cachedJob) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Determine provider from job configuration
    const jobRecord = await this.getJobFromDatabase(jobId);
    const provider = this.providers.get(jobRecord.configuration.provider);
    
    if (!provider) {
      throw new Error(`Provider not available for job ${jobId}`);
    }

    try {
      const status = await provider.pollStatus(jobId);
      
      // Update cache
      this.activeJobs.set(jobId, status);
      
      // Update database
      await this.updateJobInDatabase(jobId, {
        status: status.status,
        updatedAt: new Date(),
        completedAt: status.completedAt,
        actualCost: status.actualCost,
      });

      // Emit status change event
      if (cachedJob.status !== status.status) {
        this.emit('jobStatusChanged', {
          jobId,
          oldStatus: cachedJob.status,
          newStatus: status.status,
          logs: status.logs,
        });
      }

      return status;
    } catch (error: unknown) {
      console.error(`Failed to poll status for job ${jobId}:`, error instanceof Error ? error.message : error);
      throw error;
    }
  }

  async cancelJob(jobId: string): Promise<{ success: boolean; refund?: number }> {
    const cachedJob = this.activeJobs.get(jobId);
    if (!cachedJob) {
      throw new Error(`Job ${jobId} not found`);
    }

    const jobRecord = await this.getJobFromDatabase(jobId);
    const provider = this.providers.get(jobRecord.configuration.provider);
    
    if (!provider) {
      throw new Error(`Provider not available for job ${jobId}`);
    }

    try {
      const result = await provider.cancelJob(jobId);
      
      // Update status
      await this.updateJobInDatabase(jobId, {
        status: 'cancelled',
        updatedAt: new Date(),
        completedAt: new Date(),
      });

      // Remove from active jobs
      this.activeJobs.delete(jobId);

      // Emit cancellation event
      this.emit('jobCancelled', {
        jobId,
        refund: result.refund,
      });

      return {
        success: result.cancelled,
        refund: result.refund,
      };
    } catch (error: unknown) {
      console.error(`Failed to cancel job ${jobId}:`, error instanceof Error ? error.message : error);
      throw error;
    }
  }

  async list(): Promise<Array<{
    id: string;
    name: string;
    status: string;
    configuration: JobConfiguration & { provider: string };
    estimatedCost?: number;
    actualCost?: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
  }>> {
    return await this.getAllJobsFromDatabase();
  }

  async create(data: JobConfiguration & { provider: string; name?: string }): Promise<JobSubmissionResult> {
    return await this.submitJob(data);
  }

  async update(id: string, data: {
    status?: JobStatusType;
    name?: string;
    completedAt?: Date;
    actualCost?: number;
  }): Promise<{
    id: string;
    status?: JobStatusType;
    name?: string;
    completedAt?: Date;
    actualCost?: number;
    updatedAt: Date;
  }> {
    // For now, only support status updates
    const updates = {
      ...data,
      updatedAt: new Date()
    };
    await this.updateJobInDatabase(id, updates);
    return { id, ...updates };
  }

  async delete(id: string): Promise<any> {
    await this.cancelJob(id);
    return { id };
  }

  // Database interaction methods for NocoBase integration
  private async persistJobToDatabase(jobData: {
    id: string;
    name: string;
    status: string;
    configuration: JobConfiguration & { provider: string };
    estimatedCost?: number;
    createdAt: Date;
    updatedAt: Date;
  }): Promise<void> {
    try {
      // This will integrate with NocoBase's computeJobs collection
      // In a real implementation, this would use NocoBase's repository pattern
      // Example: await this.app.db.getRepository('computeJobs').create({ values: jobData });
      console.log('Persisting job to database:', jobData.id);
    } catch (error: unknown) {
      console.error('Failed to persist job to database:', error instanceof Error ? error.message : error);
      throw new Error(`Database error: Failed to persist job ${jobData.id}`);
    }
  }

  private async getJobFromDatabase(jobId: string): Promise<{
    id: string;
    name: string;
    status: string;
    configuration: JobConfiguration & { provider: string };
    estimatedCost?: number;
    actualCost?: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
  }> {
    try {
      // This will query NocoBase's computeJobs collection
      // Example: return await this.app.db.getRepository('computeJobs').findOne({ filter: { id: jobId } });
      
      // For now, return mock data
      return {
        id: jobId,
        name: `Job-${jobId}`,
        status: 'running',
        configuration: { 
          provider: 'akash', 
          image: 'nginx:latest',
          cpu: 2, 
          memory: '4Gi', 
          storage: '10Gi',
          env: { NODE_ENV: 'production' },
          ports: [{ containerPort: 80, protocol: 'TCP', expose: true }]
        },
        estimatedCost: 0.5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    } catch (error: unknown) {
      console.error(`Failed to retrieve job ${jobId} from database:`, error instanceof Error ? error.message : error);
      throw new Error(`Database error: Failed to retrieve job ${jobId}`);
    }
  }

  private async updateJobInDatabase(jobId: string, updates: {
    status?: string;
    updatedAt?: Date;
    completedAt?: Date;
    actualCost?: number;
    logs?: string[];
  }): Promise<void> {
    try {
      // This will update NocoBase's computeJobs collection
      // Example: await this.app.db.getRepository('computeJobs').update({ filter: { id: jobId }, values: updates });
      console.log('Updating job in database:', jobId, updates);
    } catch (error: unknown) {
      console.error(`Failed to update job ${jobId} in database:`, error instanceof Error ? error.message : error);
      throw new Error(`Database error: Failed to update job ${jobId}`);
    }
  }

  private async getAllJobsFromDatabase(): Promise<Array<{
    id: string;
    name: string;
    status: string;
    configuration: JobConfiguration & { provider: string };
    estimatedCost?: number;
    actualCost?: number;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date;
  }>> {
    try {
      // This will query all jobs from NocoBase's computeJobs collection
      // Example: return await this.app.db.getRepository('computeJobs').find();
      return [];
    } catch (error: unknown) {
      console.error('Failed to retrieve all jobs from database:', error instanceof Error ? error.message : error);
      throw new Error('Database error: Failed to retrieve jobs');
    }
  }

  // Get all active jobs being tracked
  getActiveJobs(): Map<string, JobStatus> {
    return new Map(this.activeJobs);
  }

  // Get provider status
  async getProviderStatus(providerName: string): Promise<any> {
    const provider = this.providers.get(providerName);
    if (!provider) {
      return { status: 'unavailable', name: providerName };
    }

    try {
      const health = await provider.getNetworkStatus();
      return {
        name: provider.name,
        network: provider.network,
        connected: provider.isConnected(),
        ...health,
      };
    } catch (error: unknown) {
      return {
        name: provider.name,
        network: provider.network,
        connected: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
