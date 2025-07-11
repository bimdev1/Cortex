import React, { useState } from 'react';
import { FieldHelp } from './Help/FieldHelp';
import toast from 'react-hot-toast';

interface JobSubmissionFormProps {
  onSubmit: (jobConfig: any) => Promise<void>;
  loading: boolean;
  providers: any[];
}

interface FormValidation {
  image: string;
  cpu: string;
  memory: string;
  duration: string;
}

export const JobSubmissionForm: React.FC<JobSubmissionFormProps> = ({
  onSubmit,
  loading,
  providers,
}) => {
  const [formData, setFormData] = useState({
    provider: 'akash',
    image: 'nginx:alpine',
    cpu: 100,
    memory: '512Mi',
    storage: '1Gi',
    env: '',
    duration: 3600, // 1 hour default
  });

  const [errors, setErrors] = useState<FormValidation>({
    image: '',
    cpu: '',
    memory: '',
    duration: '',
  });

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'image':
        if (!value || typeof value !== 'string') return 'Docker image is required';
        if (!value.includes(':')) return 'Image should include a tag (e.g., nginx:alpine)';
        return '';

      case 'cpu':
        const cpuNum = Number(value);
        if (!cpuNum || cpuNum < 50) return 'CPU must be at least 50 millicores';
        if (cpuNum > 8000) return 'CPU cannot exceed 8000 millicores';
        return '';

      case 'memory':
        if (!value || typeof value !== 'string') return 'Memory is required';
        const memoryPattern = /^\d+(Mi|Gi)$/;
        if (!memoryPattern.test(value)) return 'Memory format should be like 512Mi or 2Gi';
        return '';

      case 'duration':
        const durationNum = Number(value);
        if (!durationNum || durationNum < 60) return 'Duration must be at least 60 seconds';
        if (durationNum > 86400) return 'Duration cannot exceed 24 hours';
        return '';

      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      image: validateField('image', formData.image),
      cpu: validateField('cpu', formData.cpu),
      memory: validateField('memory', formData.memory),
      duration: validateField('duration', formData.duration),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    if (providers.length === 0) {
      toast.error('No providers available. Please check network status.');
      return;
    }

    // Parse environment variables
    const env: Record<string, string> = {};
    if (formData.env.trim()) {
      try {
        formData.env.split('\n').forEach((line) => {
          const [key, value] = line.split('=');
          if (key && value) {
            env[key.trim()] = value.trim();
          }
        });
      } catch (error) {
        toast.error('Invalid environment variable format');
        return;
      }
    }

    const jobConfig = {
      provider: formData.provider,
      image: formData.image,
      cpu: formData.cpu,
      memory: formData.memory,
      storage: formData.storage,
      env,
      duration: formData.duration,
    };

    await onSubmit(jobConfig);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field as keyof FormValidation]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const getInputClassName = (field: keyof FormValidation) => {
    const baseClass =
      'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm';
    return errors[field]
      ? `${baseClass} border-red-300 dark:border-red-600`
      : `${baseClass} border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white`;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
    >
      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span>Provider</span>
          <FieldHelp content="Select which decentralized network to deploy your job on. Each provider has different pricing and capabilities." />
        </label>
        <select
          value={formData.provider}
          onChange={(e) => handleInputChange('provider', e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {providers.map((provider) => (
            <option key={provider.network} value={provider.network}>
              {provider.name} {provider.connected ? '✓' : '✗'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span>Docker Image</span>
          <FieldHelp content="Specify the Docker image to deploy. Include the tag (e.g., nginx:alpine). Popular choices: nginx:alpine, node:18-alpine, python:3.9-slim" />
        </label>
        <input
          type="text"
          value={formData.image}
          onChange={(e) => handleInputChange('image', e.target.value)}
          placeholder="nginx:alpine"
          className={getInputClassName('image')}
        />
        {errors.image && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.image}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span>CPU (millicores)</span>
            <FieldHelp content="CPU allocation in millicores. 1000 = 1 CPU core. Minimum 50, maximum 8000. Start with 100-500 for basic applications." />
          </label>
          <input
            type="number"
            value={formData.cpu}
            onChange={(e) => handleInputChange('cpu', parseInt(e.target.value))}
            min="50"
            max="8000"
            step="50"
            className={getInputClassName('cpu')}
          />
          {errors.cpu && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cpu}</p>
          )}
        </div>

        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            <span>Memory</span>
            <FieldHelp content="Memory allocation. Use Mi for megabytes or Gi for gigabytes. Examples: 512Mi, 1Gi, 2Gi. Most applications need 512Mi-2Gi." />
          </label>
          <input
            type="text"
            value={formData.memory}
            onChange={(e) => handleInputChange('memory', e.target.value)}
            placeholder="512Mi"
            className={getInputClassName('memory')}
          />
          {errors.memory && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.memory}</p>
          )}
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span>Storage</span>
          <FieldHelp content="Persistent storage allocation. Use Gi for gigabytes. This is optional - leave as 1Gi for basic usage." />
        </label>
        <input
          type="text"
          value={formData.storage}
          onChange={(e) => handleInputChange('storage', e.target.value)}
          placeholder="1Gi"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span>Duration ({formatDuration(formData.duration)})</span>
          <FieldHelp content="How long to run the job in seconds. Minimum 60 seconds (1 minute), maximum 86400 seconds (24 hours). You can cancel early if needed." />
        </label>
        <input
          type="range"
          min="60"
          max="86400"
          step="60"
          value={formData.duration}
          onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
          className="block w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>1 min</span>
          <span className="font-medium">{formatDuration(formData.duration)}</span>
          <span>24 hours</span>
        </div>
        {errors.duration && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.duration}</p>
        )}
      </div>

      <div>
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <span>Environment Variables</span>
          <FieldHelp content="Optional environment variables for your container. Format: KEY=VALUE, one per line. Example: NODE_ENV=production" />
        </label>
        <textarea
          value={formData.env}
          onChange={(e) => handleInputChange('env', e.target.value)}
          placeholder="NODE_ENV=production&#10;PORT=3000"
          rows={3}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={loading || providers.length === 0}
        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          loading || providers.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Submitting...
          </div>
        ) : (
          'Submit Job'
        )}
      </button>

      {providers.length === 0 && (
        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-md">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            No providers are currently connected. Please check the network status panel.
          </p>
        </div>
      )}
    </form>
  );
};
