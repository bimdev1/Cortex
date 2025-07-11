import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface NetworkStatus {
  name: string;
  network: string;
  connected: boolean;
  status: 'online' | 'offline' | 'degraded';
  latency?: number;
  availableNodes?: number;
  currentPrice?: number;
  lastChecked: string;
}

interface LiveNetworkStatusProps {
  darkMode?: boolean;
}

export const LiveNetworkStatus: React.FC<LiveNetworkStatusProps> = ({ darkMode = false }) => {
  const [networks, setNetworks] = useState<NetworkStatus[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket
    const newSocket = io('/socket', {
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Connected to live updates');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from live updates');
      setConnected(false);
    });

    newSocket.on('networkStatus', (data: NetworkStatus[]) => {
      setNetworks(data);
    });

    setSocket(newSocket);

    // Initial fetch
    fetchNetworkStatus();

    // Set up polling fallback
    const interval = setInterval(fetchNetworkStatus, 5000);

    return () => {
      newSocket.disconnect();
      clearInterval(interval);
    };
  }, []);

  const fetchNetworkStatus = async () => {
    try {
      const response = await fetch('/api/plugin-core/providers');
      if (response.ok) {
        const data = await response.json();
        setNetworks(data.providers || []);
      }
    } catch (error) {
      console.error('Failed to fetch network status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 dark:text-green-400';
      case 'degraded': return 'text-yellow-600 dark:text-yellow-400';
      case 'offline': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'degraded':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'offline':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Live Network Status
        </h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>
      </div>

      {networks.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.713-3.714M14 40v-4c0-1.313.253-2.566.713-3.714m0 0A9.971 9.971 0 0121 28c4.418 0 7.859 2.437 9.287 5.286" />
          </svg>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            No networks available
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {networks.map((network) => (
            <div
              key={network.network}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(network.status)}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {network.name}
                    </h4>
                    <p className={`text-xs ${getStatusColor(network.status)}`}>
                      {network.status.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {network.latency && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {network.latency}ms
                    </p>
                  )}
                  {network.currentPrice && (
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      ${network.currentPrice.toFixed(4)}/hr
                    </p>
                  )}
                </div>
              </div>
              
              {network.availableNodes && (
                <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm0 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                  {network.availableNodes.toLocaleString()} nodes available
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
        Last updated: {networks.length > 0 ? new Date(networks[0].lastChecked).toLocaleTimeString() : 'Never'}
      </div>
    </div>
  );
};
