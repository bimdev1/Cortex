import { AkashProvider, AkashConfig } from '../index';
import { JobConfiguration } from '../../interfaces';

// Mock gRPC modules
jest.mock('@grpc/grpc-js', () => ({
  loadPackageDefinition: jest.fn(),
  credentials: {
    createInsecure: jest.fn(),
  },
}));

jest.mock('@grpc/proto-loader', () => ({
  loadSync: jest.fn(() => ({})),
}));

describe('AkashProvider', () => {
  let provider: AkashProvider;
  let mockConfig: AkashConfig;

  beforeEach(() => {
    mockConfig = {
      rpcEndpoint: 'https://rpc.akash.test:443',
      apiEndpoint: 'https://api.akash.test:443',
      chainId: 'akashnet-test',
      defaultTimeout: 30000,
    };
    provider = new AkashProvider(mockConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with correct properties', () => {
      expect(provider.name).toBe('Akash Network');
      expect(provider.network).toBe('akash');
      expect(provider.isConnected()).toBe(false);
    });
  });

  describe('connection management', () => {
    it('should connect successfully', async () => {
      await provider.connect();
      expect(provider.isConnected()).toBe(true);
    });

    it('should disconnect successfully', async () => {
      await provider.connect();
      await provider.disconnect();
      expect(provider.isConnected()).toBe(false);
    });
  });

  describe('job methods', () => {
    const mockJobConfig: JobConfiguration = {
      image: 'nginx:alpine',
      cpu: 100,
      memory: '512Mi',
      env: { NODE_ENV: 'production' },
    };

    beforeEach(async () => {
      await provider.connect();
    });

    it('should throw error for unimplemented submitJob', async () => {
      await expect(provider.submitJob(mockJobConfig)).rejects.toThrow('Method not implemented');
    });

    it('should throw error for unimplemented pollStatus', async () => {
      await expect(provider.pollStatus('test-job-id')).rejects.toThrow('Method not implemented');
    });

    it('should throw error for unimplemented cancelJob', async () => {
      await expect(provider.cancelJob('test-job-id')).rejects.toThrow('Method not implemented');
    });

    it('should throw error for unimplemented getNetworkStatus', async () => {
      await expect(provider.getNetworkStatus()).rejects.toThrow('Method not implemented');
    });

    it('should throw error for unimplemented estimateCost', async () => {
      await expect(provider.estimateCost(mockJobConfig)).rejects.toThrow('Method not implemented');
    });
  });
});
