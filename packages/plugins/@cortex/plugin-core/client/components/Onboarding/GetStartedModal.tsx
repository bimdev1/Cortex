import React, { useState } from 'react';

interface GetStartedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GetStartedModal: React.FC<GetStartedModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 1,
      title: 'Welcome to Cortex',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Cortex is your gateway to decentralized computing. Submit jobs across multiple DePIN
            networks and pay only for what you use.
          </p>
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">What you can do:</h4>
            <ul className="list-disc list-inside text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>Deploy Docker containers to decentralized networks</li>
              <li>Monitor jobs in real-time</li>
              <li>Track costs and optimize spending</li>
              <li>Access multiple networks through one interface</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: 'Check Network Status',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Before submitting jobs, check which networks are available and their current status.
          </p>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Akash Network - Online</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              The network status panel shows real-time availability, latency, and pricing
              information.
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Tip:</strong> Green status means the network is ready to accept jobs. Yellow
              indicates degraded performance, and red means the network is offline.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: 'Submit Your First Job',
      content: (
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-300">
            Ready to deploy your first container? Use the job submission form to get started.
          </p>
          <div className="space-y-3">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                1. Choose a Docker image
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Try <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">nginx:alpine</code>{' '}
                for a simple web server
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900 dark:text-white">
                2. Set resource requirements
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Start with 100 CPU, 512Mi memory for basic applications
              </p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900 dark:text-white">3. Review and submit</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Your job will appear in the status table once submitted
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentStepData = steps.find((step) => step.id === currentStep);

  const handleNext = () => {
    setCompletedSteps((prev) => [...prev, currentStep]);
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as completed
      localStorage.setItem('cortex-onboarding-completed', 'true');
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('cortex-onboarding-completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Getting Started</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              {steps.map((step) => (
                <div key={step.id} className="flex-1">
                  <div
                    className={`h-2 rounded-full ${
                      completedSteps.includes(step.id)
                        ? 'bg-green-500'
                        : step.id === currentStep
                          ? 'bg-blue-500'
                          : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <span
                  key={step.id}
                  className={`text-xs ${
                    step.id === currentStep
                      ? 'text-blue-600 dark:text-blue-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Step {step.id}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              {currentStepData?.title}
            </h3>
            <div className="text-sm">{currentStepData?.content}</div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Skip tour
            </button>

            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Previous
                </button>
              )}
              <button
                onClick={handleNext}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {currentStep === steps.length ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
