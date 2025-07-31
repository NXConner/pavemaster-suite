import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Simple performance tracking
const performanceMonitor = {
  recordMetric: (name: string, value: number, unit: string, metadata?: any) => {
    if (import.meta.env.DEV) {
      console.log(`📊 ${name}: ${value}${unit}`, metadata);
    }
  },
  exportPerformanceData: () => ({}),
};

// Start performance monitoring
const appStartTime = performance.now();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Simple initialization
function initializeBasicSystems() {
  console.log('🚀 PaveMaster Suite starting...');
}

// Render application
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Initialize basic systems
initializeBasicSystems();

// Record application startup metrics
const appLoadTime = performance.now() - appStartTime;
performanceMonitor.recordMetric('app_startup_time', appLoadTime, 'ms', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  viewport: `${window.innerWidth.toString()}x${window.innerHeight.toString()}`,
});

// Log startup completion
console.log(`🎉 PaveMaster Suite loaded in ${appLoadTime.toFixed(2)}ms`);

// Enable development insights
if (import.meta.env.DEV) {
  console.log('🔧 Development mode enabled');
  (window as any).performanceMonitor = performanceMonitor;
}
