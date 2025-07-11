export interface IDePINProvider {
  readonly name: string;
  readonly network: string;

  // Core job management methods
  submitJob(jobConfig: JobConfiguration): Promise<JobSubmissionResult>;
  pollStatus(jobId: string): Promise<JobStatus>;
  cancelJob(jobId: string): Promise<JobCancellationResult>;

  // Network health and pricing
  getNetworkStatus(): Promise<NetworkHealth>;
  estimateCost(jobConfig: JobConfiguration): Promise<CostEstimate>;

  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

export interface JobConfiguration {
  image: string;
  cpu: number;
  memory: string;
  storage?: string;
  env?: Record<string, string>;
  ports?: PortMapping[];
  duration?: number;
}

export interface JobSubmissionResult {
  jobId: string;
  providerJobId: string;
  status: JobStatusType;
  estimatedCost: number;
  submittedAt: Date;
}

export interface JobStatus {
  jobId: string;
  providerJobId: string;
  status: JobStatusType;
  logs?: string[];
  error?: string;
  completedAt?: Date;
  actualCost?: number;
}

export type JobStatusType = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface NetworkHealth {
  status: 'online' | 'offline' | 'degraded';
  latency: number;
  availableNodes: number;
  currentPrice: number;
  lastChecked: Date;
}

export interface CostEstimate {
  estimated: number;
  currency: string;
  breakdown: Record<string, number>;
}

export interface JobCancellationResult {
  jobId: string;
  cancelled: boolean;
  refund?: number;
}

export interface PortMapping {
  containerPort: number;
  protocol: 'TCP' | 'UDP';
  expose?: boolean;
}
