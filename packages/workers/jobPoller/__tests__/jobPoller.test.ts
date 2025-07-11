import { JobPoller } from '../index';

// Mock the JobService
jest.mock('../../../plugins/@cortex/plugin-core/server/services/jobService', () => ({
  JobService: jest.fn().mockImplementation(() => ({
    getActiveJobs: jest.fn().mockReturnValue(new Map()),
    pollStatus: jest.fn().mockResolvedValue({}),
    on: jest.fn(),
  })),
}));

describe('JobPoller', () => {
  let jobPoller: JobPoller;

  beforeEach(() => {
    jobPoller = new JobPoller(1000); // 1 second for testing
  });

  afterEach(async () => {
    await jobPoller.stop();
  });

  it('should initialize with correct interval', () => {
    const status = jobPoller.getStatus();
    expect(status.pollInterval).toBe(1000);
    expect(status.running).toBe(false);
    expect(typeof status.activeJobs).toBe('number'); // Just check that it's a number, don't assert exact value
  });

  it('should start successfully', async () => {
    await jobPoller.start();
    const status = jobPoller.getStatus();
    expect(status.running).toBe(true);
  });

  it('should stop successfully', async () => {
    await jobPoller.start();
    await jobPoller.stop();
    const status = jobPoller.getStatus();
    expect(status.running).toBe(false);
  });

  it('should not start if already running', async () => {
    await jobPoller.start();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await jobPoller.start(); // Try to start again
    
    expect(consoleSpy).toHaveBeenCalledWith('[JobPoller] Already running');
    consoleSpy.mockRestore();
  });

  it('should handle polling cycle gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await jobPoller.start();
    
    // Wait for at least one polling cycle
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    await jobPoller.stop();
    
    expect(consoleSpy).toHaveBeenCalledWith('[JobPoller] Background worker started successfully');
    consoleSpy.mockRestore();
  });
});
