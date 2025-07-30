import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize advanced systems
import { initializeBundleOptimization } from '@/lib/bundleOptimization';
import { initializeAIOptimization } from '@/lib/aiPerformanceOptimizer';
import { initializeAccessibility } from '@/lib/accessibility';
import { initializeOfflineSupport } from '@/lib/offline';
import { performanceMonitor } from '@/lib/performance';

// Initialize mobile service and advanced offline manager
import mobileService from '@/services/mobileService';
import advancedOfflineManager from '@/services/advancedOfflineManager';

// Start performance monitoring
const appStartTime = performance.now();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

// Initialize all advanced systems
async function initializeAdvancedSystems(): Promise<void> {
  console.log('🚀 Initializing Advanced Systems');

  try {
    // Initialize bundle optimization
    console.log('📦 Initializing intelligent bundle optimization...');
    initializeBundleOptimization();

    // Initialize AI performance optimization
    console.log('🤖 Initializing AI performance optimizer...');
    initializeAIOptimization();

    // Initialize accessibility system
    console.log('♿ Initializing accessibility system...');
    initializeAccessibility();

    // Initialize offline support
    console.log('📴 Initializing offline support...');
    await initializeOfflineSupport();

    // Initialize mobile service if on mobile platform
    console.log('📱 Initializing mobile service...');
    try {
      await mobileService.initialize();
      console.log('✅ Mobile service initialized successfully');
    } catch (error) {
      console.log('ℹ️ Mobile service not available (running in browser)');
    }

    // Initialize advanced offline manager
    console.log('💾 Initializing advanced offline manager...');
    try {
      await advancedOfflineManager.initialize();
      console.log('✅ Advanced offline manager initialized successfully');
    } catch (error) {
      console.log('ℹ️ Advanced offline manager initialization failed:', error);
    }

    console.log('✅ All advanced systems initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing advanced systems:', error);
  }
}

// Render application
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Initialize advanced systems after initial render
void initializeAdvancedSystems();

// Record application startup metrics
const appLoadTime = performance.now() - appStartTime;
performanceMonitor.recordMetric('app_startup_time', appLoadTime, 'ms', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  viewport: `${window.innerWidth.toString()}x${window.innerHeight.toString()}`,
});

// Log startup completion
console.log(`🎉 PaveMaster Suite loaded in ${appLoadTime.toFixed(2)}ms`);

// Enable performance insights in development
if (import.meta.env.DEV) {
  console.log('🔧 Development mode - Performance insights enabled')

  // Make performance tools available globally for debugging
  ;(window as any).performanceMonitor = performanceMonitor;
  ;(window as any).mobileService = mobileService;
  ;(window as any).advancedOfflineManager = advancedOfflineManager;

  // Log performance metrics every 10 seconds in development
  setInterval(() => {
    const metrics = performanceMonitor.exportPerformanceData();
    if (Object.keys(metrics).length > 0) {
      console.log('📊 Performance Metrics Update');
      Object.entries(metrics).forEach(([category, data]) => {
        if (data.length > 0) {
          console.log(`${category}:`, data.slice(-5)); // Show last 5 entries
        }
      });
    }
  }, 10000);
}
