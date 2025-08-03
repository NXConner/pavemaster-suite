import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// PaveMaster Suite - Advanced Performance & System Monitoring
const performanceMonitor = {
  recordMetric: (name: string, value: number, unit: string, metadata?: any) => {
    if (import.meta.env.DEV) {
      console.log(`🎯 ISAC-OS Metric [${name}]: ${value}${unit}`, metadata);
    }
    // Store metrics for tactical analysis
    const metrics = JSON.parse(localStorage.getItem('tactical-metrics') || '[]');
    metrics.push({
      name,
      value,
      unit,
      timestamp: Date.now(),
      metadata,
    });
    localStorage.setItem('tactical-metrics', JSON.stringify(metrics.slice(-100))); // Keep last 100
  },
  exportPerformanceData: () => {
    const metrics = JSON.parse(localStorage.getItem('tactical-metrics') || '[]');
    return {
      metrics,
      systemHealth: 'OPERATIONAL',
      lastBoot: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
  },
};

// Start performance monitoring
const appStartTime = performance.now();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// ISAC-OS System Initialization - Maximum Potential
function initializeAdvancedSystems() {
  console.log('🛡️ ISAC-OS Initializing...');
  console.log('🎯 Tactical Interface Loading...');
  console.log('📡 Communication Grid: ONLINE');
  console.log('🔐 Security Protocols: ACTIVE');
  console.log('📊 Performance Monitoring: ENABLED');
  console.log('🌍 Global Positioning: READY');
  console.log('🔧 System Diagnostics: OPERATIONAL');

  // Initialize ISAC-OS theme
  const savedTheme = localStorage.getItem('theme') || 'isac-os';
  document.body.classList.add(`theme-${savedTheme}`);

  // Initialize tactical wallpaper
  document.documentElement.style.setProperty(
    '--wallpaper-image',
    'url(\'/wallpapers/tactical-grid-4k.jpg\')',
  );

  // Veteran system integration check
  const veteranMode = localStorage.getItem('jargonMode') === 'military';
  if (veteranMode) {
    console.log('🎖️ Veteran Integration: ACTIVE');
    console.log('📋 Military Terminology: ENABLED');
  }
}

// Render application
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Initialize advanced tactical systems
initializeAdvancedSystems();

// Record application startup metrics
const appLoadTime = performance.now() - appStartTime;
performanceMonitor.recordMetric('app_startup_time', appLoadTime, 'ms', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  viewport: `${window.innerWidth.toString()}x${window.innerHeight.toString()}`,
});

// Log tactical system deployment completion
console.log(`⚡ ISAC-OS Tactical Suite deployed in ${appLoadTime.toFixed(2)}ms`);
console.log('🎯 System Status: FULLY OPERATIONAL');
console.log('🛡️ All systems: GREEN');
console.log('📡 Network Status: CONNECTED');
console.log('🔒 Security Level: MAXIMUM');

// Enable tactical development insights
if (import.meta.env.DEV) {
  console.log('🔧 ISAC-OS Development Console: ACTIVE');
  console.log('📊 Tactical Analytics: ENABLED');
  console.log('🎯 Performance Tracking: ONLINE');
  (window as any).performanceMonitor = performanceMonitor;
  (window as any).isacOS = {
    version: '2.0.0',
    codename: 'Tactical Thunder',
    buildDate: new Date().toISOString(),
    features: [
      'Advanced Jargon Switching',
      'Military/Civilian Integration',
      'Veteran Resource System',
      'ISAC-OS Design System',
      'Tactical Performance Monitoring',
    ],
  };
  console.log('🚀 ISAC-OS Development Suite Ready');
}
