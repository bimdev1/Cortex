import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface CostData {
  timestamp: string;
  estimated: number;
  actual: number;
}

interface CostOverviewChartProps {
  data: CostData[];
  darkMode?: boolean;
}

export const CostOverviewChart: React.FC<CostOverviewChartProps> = ({ data, darkMode = false }) => {
  const chartRef = useRef<ChartJS<'line'>>(null);

  useEffect(() => {
    // Trigger chart animation when data changes
    if (chartRef.current) {
      chartRef.current.update('active');
    }
  }, [data]);

  const chartData = {
    labels: data.map((item) => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Estimated Cost',
        data: data.map((item) => item.estimated),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Actual Cost',
        data: data.map((item) => item.actual),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: darkMode ? '#f9fafb' : '#111827',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: 'Cost Overview (Last 7 Days)',
        color: darkMode ? '#f9fafb' : '#111827',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#374151' : '#ffffff',
        titleColor: darkMode ? '#f9fafb' : '#111827',
        bodyColor: darkMode ? '#f9fafb' : '#111827',
        borderColor: darkMode ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: function (context: any) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
        },
        grid: {
          color: darkMode ? '#374151' : '#f3f4f6',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: darkMode ? '#9ca3af' : '#6b7280',
          callback: function (value: any) {
            return '$' + Number(value).toFixed(2);
          },
        },
        grid: {
          color: darkMode ? '#374151' : '#f3f4f6',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="chart-container">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>

      {data.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Estimated</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              ${data.reduce((sum, item) => sum + item.estimated, 0).toFixed(4)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Actual</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              ${data.reduce((sum, item) => sum + item.actual, 0).toFixed(4)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
