import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize advanced systems
import { initializeBundleOptimization } from '@/lib/bundleOptimization'
import { initializeAIOptimization } from '@/lib/aiPerformanceOptimizer'
import { initializeAccessibility } from '@/lib/accessibility'
import { initializeOfflineSupport } from '@/lib/offline'
import { performanceMonitor } from '@/lib/performance'

// Start performance monitoring
const appStartTime = performance.now()

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root element not found')
}

// Initialize all advanced systems
async function initializeAdvancedSystems() {
  console.group('🚀 Initializing Advanced Systems')
  
  try {
    // Initialize bundle optimization
    console.log('📦 Initializing intelligent bundle optimization...')
    initializeBundleOptimization()
    
    // Initialize AI performance optimization
    console.log('🤖 Initializing AI performance optimizer...')
    initializeAIOptimization()
    
    // Initialize accessibility system
    console.log('♿ Initializing accessibility system...')
    initializeAccessibility()
    
    // Initialize offline support
    console.log('📴 Initializing offline support...')
    await initializeOfflineSupport()
    
    console.log('✅ All advanced systems initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing advanced systems:', error)
  } finally {
    console.groupEnd()
  }
}

// Render application
createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Initialize advanced systems after initial render
initializeAdvancedSystems()

// Record application startup metrics
const appLoadTime = performance.now() - appStartTime
performanceMonitor.recordMetric('app_startup_time', appLoadTime, 'ms', {
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  viewport: `${window.innerWidth}x${window.innerHeight}`
})

// Log startup completion
console.log(`🎉 PaveMaster Suite loaded in ${appLoadTime.toFixed(2)}ms`)

// Enable performance insights in development
if (import.meta.env.DEV) {
  console.log('🔧 Development mode - Performance insights enabled')
  
  // Make performance tools available globally for debugging
  ;(window as any).performanceMonitor = performanceMonitor
  
  // Log performance metrics every 10 seconds in development
  setInterval(() => {
    const metrics = performanceMonitor.exportPerformanceData()
    if (Object.keys(metrics).length > 0) {
      console.group('📊 Performance Metrics Update')
      Object.entries(metrics).forEach(([category, data]) => {
        if (data.length > 0) {
          console.log(`${category}:`, data.slice(-5)) // Show last 5 entries
        }
      })
      console.groupEnd()
    }
  }, 10000)
}
