// Layout Components
export { default as Layout } from './layout/Layout'
export { default as Sidebar } from './layout/Sidebar'

// Authentication Components
export { default as AuthPage } from './auth/AuthPage'
export { default as ProtectedRoute } from './auth/ProtectedRoute'

// Dashboard Components
export { default as Dashboard } from './dashboard/Dashboard'
export { default as FinancialDashboard } from './dashboard/FinancialDashboard'

// Analytics Components
export { default as Analytics } from './analytics/Analytics'

// Data Management Components
export { default as Projects } from './data/Projects'
export { default as CRM } from './data/CRM'
export { default as Equipment } from './data/Equipment'
export { default as Estimates } from './data/Estimates'
export { default as TeamManagement } from './data/TeamManagement'

// Advanced Components
export { default as SecurityMonitor } from './advanced/SecurityMonitor'
export { default as WeatherMonitor } from './advanced/WeatherMonitor'
export { default as IntelligenceEngine } from './advanced/IntelligenceEngine'
export { default as IoTHub } from './advanced/IoTHub'
export { default as BlockchainHub } from './advanced/BlockchainHub'

// Common Components
export { default as ThemeCustomizer } from './common/ThemeCustomizer'
export { default as QuickThemeToggle } from './common/QuickThemeToggle'
export { default as TempIndex } from './common/TempIndex'

// Specialized Modules
export { default as AdvancedAI } from './ai/AdvancedAI'
export { default as EnterpriseHub } from './enterprise/EnterpriseHub'
export { default as GISHub } from './mapping/GISHub'

// Re-export from specialized directories
export * from './reports'
export * from './safety'
export * from './mobile'
export * from './integration'

// UI Components (re-exported from ui folder)
export * from '../ui'