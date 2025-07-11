import React from 'react';

interface JobStatusTableProps {
  jobs: any[];
  onCancel: (jobId: string) => void;
  onRefresh: () => void;
}

export const JobStatusTable: React.FC<JobStatusTableProps> = ({ 
  jobs, 
  onCancel, 
  onRefresh 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#28a745';
      case 'running': return '#007bff';
      case 'failed': return '#dc3545';
      case 'cancelled': return '#6c757d';
      case 'pending': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const canCancel = (status: string) => {
    return ['pending', 'running'].includes(status);
  };

  if (jobs.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
        No jobs found. Submit a job to get started.
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '10px', textAlign: 'right' }}>
        <button onClick={onRefresh} style={{ padding: '5px 10px' }}>
          Refresh
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Job ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Provider</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Image</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Status</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Cost</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Created</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <code style={{ fontSize: '12px' }}>{job.id?.substring(0, 8) || 'N/A'}</code>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {job.configuration?.provider || 'Unknown'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <code style={{ fontSize: '12px' }}>{job.configuration?.image || 'N/A'}</code>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  <span 
                    style={{ 
                      padding: '3px 8px', 
                      borderRadius: '3px', 
                      color: 'white',
                      backgroundColor: getStatusColor(job.status),
                      fontSize: '12px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {job.status}
                  </span>
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  ${(job.actualCost || job.estimatedCost || 0).toFixed(4)}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {job.createdAt ? new Date(job.createdAt).toLocaleString() : 'N/A'}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {canCancel(job.status) && (
                    <button
                      onClick={() => onCancel(job.id)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
