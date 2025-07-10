export class NetworkService {
  async getNetworkStatus(networkName: string) {
    return { 
      networkName, 
      status: 'unknown',
      lastChecked: new Date().toISOString()
    };
  }
  
  async getAllNetworkStatus() {
    const networks = ['akash', 'render', 'golem', 'bittensor', 'ionet'];
    return networks.map(name => ({
      networkName: name,
      status: 'unknown',
      lastChecked: new Date().toISOString()
    }));
  }
  
  async updateNetworkStatus(networkName: string, status: any) {
    return { networkName, ...status };
  }
}
