import React, { useState, useEffect } from 'react';
import { GlobalLayout } from './Layout/GlobalLayout';
import { JobSubmissionForm } from './JobSubmissionForm';
import { JobStatusTable } from './JobStatusTable';
import { CostOverviewChart } from './Dashboard/CostOverviewChart';
import { LiveNetworkStatus } from './Dashboard/LiveNetworkStatus';
import { GetStartedModal } from './Onboarding/GetStartedModal';
import toast from 'react-hot-toast';

export const CoreDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [providers, setProviders] = useState<any[]>([]);
  const [costData, setCostData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has completed onboarding
    const onboardingCompleted = localStorage.getItem('cortex-onboarding-completed');
    if (!onboardingCompleted) {
      // Show onboarding after a short delay
      setTimeout(() => setShowOnboarding(true), 1000);
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('cortex-dark-mode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }

    fetchJobs();
    fetchProviders();
    fetchCostData();
    
    // Set up polling for job updates
    const interval = setInterval(() => {
      fetchJobs();
      fetchCostData();
    }, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/plugin-core/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  };

  const fetchProviders = async () => {
    try {
      const response = await fetch('/api/plugin-core/providers');
      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error('Failed to fetch providers:', error);
    }
  };

  const fetchCostData = async () => {
    try {
      const response = await fetch('/api/plugin-core/analytics/costs');
      if (response.ok) {
        const data = await response.json();
        setCostData(data.costData || []);
      }
    } catch (error) {
      console.error('Failed to fetch cost data:', error);
      // Generate mock data for demo
      const mockData = generateMockCostData();
      setCostData(mockData);
    }
  };

  const generateMockCostData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        timestamp: date.toISOString(),
        estimated: Math.random() * 0.5 + 0.1,
        actual: Math.random() * 0.4 + 0.05,
      });
    }
    return data;
  };

  const handleJobSubmit = async (jobConfig: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/plugin-core/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(jobConfig),
      });

      if (response.ok) {
        const newJob = await response.json();
        setJobs(prev => [newJob, ...prev]);
        toast.success('Job submitted successfully!');
        console.log('Job submitted successfully:', newJob.jobId);
      } else {
        const error = await response.text();
        toast.error('Job submission failed: ' + error);
        console.error('Job submission failed:', error);
      }
    } catch (error: any) {
      toast.error('Job submission error: ' + error.message);
      console.error('Job submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJobCancel = async (jobId: string) => {
    try {
      const response = await fetch(`/api/plugin-core/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setJobs(prev => prev.map(job => 
          job.id === jobId ? { ...job, status: 'cancelled' } : job
        ));
        toast.success('Job cancelled successfully');
        console.log('Job cancelled successfully:', jobId);
      } else {
        toast.error('Job cancellation failed');
        console.error('Job cancellation failed');
      }
    } catch (error: any) {
      toast.error('Job cancellation error: ' + error.message);
      console.error('Job cancellation error:', error);
    }
  };

  const getActiveJobsCount = () => jobs.filter(job => ['pending', 'running'].includes(job.status)).length;
  const getCompletedJobsCount = () => jobs.filter(job => job.status === 'completed').length;
  const getTotalCost = () => jobs.reduce((sum, job) => sum + (job.actualCost || job.estimatedCost || 0), 0);

  return (
    <>
      <GetStartedModal 
        isOpen={showOnboarding} 
        onClose={() => setShowOnboarding(false)} 
      />
      
      <GlobalLayout currentPath="/">
        <div className="space-y-6">
          {/* Welcome banner for new users */}
          {jobs.length === 0 && (
            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100">
                    Welcome to Cortex! 👋
                  </h3>
                  <p className="text-blue-700 dark:text-blue-200 mt-1">
                    Get started by submitting your first compute job to a decentralized network.
                  </p>
                </div>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
                >
                  Show Tutorial
                </button>
              </div>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Active Jobs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {getActiveJobsCount()}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Completed
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {getCompletedJobsCount()}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Cost
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      ${getTotalCost().toFixed(4)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Networks
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {providers.filter(p => p.connected).length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CostOverviewChart data={costData} darkMode={darkMode} />
          <LiveNetworkStatus darkMode={darkMode} />
        </div>

        {/* Job Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Submit New Job</h2>
            <JobSubmissionForm 
              onSubmit={handleJobSubmit} 
              loading={loading}
              providers={providers.filter(p => p.connected)}
            />
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Recent Jobs ({jobs.length})
            </h2>
            <JobStatusTable 
              jobs={jobs} 
              onCancel={handleJobCancel}
              onRefresh={fetchJobs}
            />
          </div>
        </div>
      </div>
    </GlobalLayout>
    </>
  );
};
