// Mock JobService for testing
class JobService {
  constructor() {
    this.jobs = new Map();
    this.eventListeners = {};
    // Initialization complete (removed console.log)
  }

  on(event, listener) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(listener);
    return this;
  }

  emit(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((listener) => listener(data));
    }
    return true;
  }

  getActiveJobs() {
    return this.jobs;
  }

  async submitJob(config) {
    const jobId = config.jobId || 'test-job-123';
    const result = { jobId, provider: config.provider };
    this.jobs.set(jobId, { ...config, status: 'created' });
    this.emit('jobCreated', { jobId, provider: config.provider });
    return result;
  }

  async pollStatus(jobId) {
    if (!this.jobs.has(jobId)) {
      throw new Error(`Job ${jobId} not found`);
    }
    const job = this.jobs.get(jobId);
    const status = {
      jobId,
      status: job.status || 'running',
      provider: job.provider,
      timestamp: new Date().toISOString(),
    };
    return status;
  }

  async cancelJob(jobId) {
    if (!this.jobs.has(jobId)) {
      throw new Error(`Job ${jobId} not found`);
    }
    const job = this.jobs.get(jobId);
    this.jobs.delete(jobId);
    return { jobId, status: 'cancelled', provider: job.provider };
  }

  async listJobs() {
    return Array.from(this.jobs.values());
  }

  async create(data) {
    return this.submitJob(data);
  }

  async update(id, data) {
    if (!this.jobs.has(id)) {
      throw new Error(`Job ${id} not found`);
    }
    const job = this.jobs.get(id);
    Object.assign(job, data);
    return { id, ...data };
  }

  async delete(id) {
    return this.cancelJob(id);
  }
}

module.exports = { JobService };
