import { JobService } from '../jobService';
import { EventEmitter } from 'events';

// Mock the providers
jest.mock('providers/akash', () => ({
  AkashProvider: jest.fn().mockImplementation(() => ({
    name: 'Akash Network',
    network: 'akash',
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    isConnected: jest.fn().mockReturnValue(true),
    submitJob: jest.fn().mockResolvedValue({
      jobId: 'test-job-123',
      providerJobId: 'akash-job-456',
      status: 'pending',
      estimatedCost: 0.05,
      submittedAt: new Date(),
    }),
    pollStatus: jest.fn().mockResolvedValue({
      jobId: 'test-job-123',
      providerJobId: 'akash-job-456',
      status: 'running',
    }),
    cancelJob: jest.fn().mockResolvedValue({
      jobId: 'test-job-123',
      cancelled: true,
      refund: 0.02,
    }),
  })),
}));

describe('JobService', () => {
  let jobService: JobService;

  beforeEach(() => {
    jobService = new JobService();
  });

  afterEach(() => {
    jobService.removeAllListeners();
  });

  it('should be an EventEmitter', () => {
    expect(jobService).toBeInstanceOf(EventEmitter);
  });

  it('should initialize with empty active jobs', () => {
    expect(jobService.getActiveJobs().size).toBe(0);
  });

  describe('job lifecycle', () => {
    const mockJobConfig = {
      provider: 'akash',
      image: 'nginx:alpine',
      cpu: 100,
      memory: '512Mi',
    };

    it('should submit job successfully', async () => {
      const result = await jobService.submitJob(mockJobConfig);
      
      expect(result).toMatchObject({
        jobId: 'test-job-123',
        providerJobId: 'akash-job-456',
        status: 'pending',
        estimatedCost: 0.05,
      });
      
      expect(jobService.getActiveJobs().has('test-job-123')).toBe(true);
    });

    it('should emit jobCreated event on successful submission', (done) => {
      jobService.on('jobCreated', (event) => {
        expect(event).toMatchObject({
          jobId: 'test-job-123',
          provider: 'akash',
          status: 'pending',
        });
        done();
      });

      jobService.submitJob(mockJobConfig);
    });

    it('should poll job status successfully', async () => {
      // First submit a job
      await jobService.submitJob(mockJobConfig);
      
      // Then poll its status
      const status = await jobService.pollStatus('test-job-123');
      
      expect(status).toMatchObject({
        jobId: 'test-job-123',
        providerJobId: 'akash-job-456',
        status: 'running',
      });
    });

    it('should emit jobStatusChanged event when status changes', (done) => {
      jobService.on('jobStatusChanged', (event) => {
        expect(event).toMatchObject({
          jobId: 'test-job-123',
          oldStatus: 'pending',
          newStatus: 'running',
        });
        done();
      });

      // Submit job then poll status to trigger status change
      jobService.submitJob(mockJobConfig).then(() => {
        jobService.pollStatus('test-job-123');
      });
    });

    it('should cancel job successfully', async () => {
      // First submit a job
      await jobService.submitJob(mockJobConfig);
      
      // Then cancel it
      const result = await jobService.cancelJob('test-job-123');
      
      expect(result).toMatchObject({
        success: true,
        refund: 0.02,
      });
      
      expect(jobService.getActiveJobs().has('test-job-123')).toBe(false);
    });

    it('should throw error for unknown provider', async () => {
      const invalidConfig = { ...mockJobConfig, provider: 'unknown' };
      
      await expect(jobService.submitJob(invalidConfig)).rejects.toThrow('Provider unknown not available');
    });

    it('should throw error for non-existent job', async () => {
      await expect(jobService.pollStatus('non-existent')).rejects.toThrow('Job non-existent not found');
    });
  });

  describe('CRUD methods', () => {
    it('should list jobs', async () => {
      const jobs = await jobService.list();
      expect(Array.isArray(jobs)).toBe(true);
    });

    it('should create job via create method', async () => {
      const jobConfig = {
        provider: 'akash',
        image: 'nginx:alpine',
        cpu: 100,
        memory: '512Mi',
      };
      
      const result = await jobService.create(jobConfig);
      expect(result).toHaveProperty('jobId');
    });

    it('should update job via update method', async () => {
      const result = await jobService.update('test-id', { status: 'completed' });
      expect(result).toMatchObject({ id: 'test-id', status: 'completed' });
    });

    it('should delete job via delete method', async () => {
      // First submit a job
      await jobService.submitJob({
        provider: 'akash',
        image: 'nginx:alpine',
        cpu: 100,
        memory: '512Mi',
      });
      
      const result = await jobService.delete('test-job-123');
      expect(result).toMatchObject({ id: 'test-job-123' });
    });
  });
});
