import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from 'react-hot-toast';

interface GlobalLayoutProps {
  children: React.ReactNode;
  currentPath?: string;
}

export const GlobalLayout: React.FC<GlobalLayoutProps> = ({ children, currentPath = '/' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('cortex-dark-mode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save preference
    localStorage.setItem('cortex-dark-mode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200`}>
      <ErrorBoundary>
        <Header 
          onToggleSidebar={toggleSidebar}
          onToggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
          sidebarOpen={sidebarOpen}
        />
        
        <div className="flex">
          <Sidebar 
            isOpen={sidebarOpen}
            currentPath={currentPath}
          />
          
          <main className={`flex-1 transition-all duration-200 ${
            sidebarOpen ? 'ml-64' : 'ml-16'
          }`}>
            <div className="px-6 py-4">
              <Breadcrumbs currentPath={currentPath} />
              <div className="mt-4">
                {children}
              </div>
            </div>
          </main>
        </div>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: darkMode ? '#374151' : '#ffffff',
              color: darkMode ? '#f9fafb' : '#111827',
            },
          }}
        />
      </ErrorBoundary>
    </div>
  );
};
