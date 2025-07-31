import React, { 
    useState, 
    useEffect, 
    useCallback, 
    useMemo, 
    lazy, 
    Suspense 
} from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { motion } from 'framer-motion';
import { 
    performanceMonitor, 
    accessibilityEnhancer,
    componentRegistry
} from '../lib/system-integrations';

interface ComponentConfig {
    id: string;
    name: string;
    lazy?: boolean;
    performanceThreshold?: number;
    accessibilityEnhanced?: boolean;
    dependencies?: string[];
}

class ComponentManager {
    private static instance: ComponentManager;
    private components: Map<string, React.ComponentType<any>> = new Map();
    private componentConfigs: Map<string, ComponentConfig> = new Map();
    private renderHistory: Map<string, number[]> = new Map();

    private constructor() {}

    public static getInstance(): ComponentManager {
        if (!ComponentManager.instance) {
            ComponentManager.instance = new ComponentManager();
        }
        return ComponentManager.instance;
    }

    public registerComponent(
        id: string, 
        component: React.ComponentType<any>, 
        config: Partial<ComponentConfig> = {}
    ) {
        const defaultConfig: ComponentConfig = {
            id,
            name: id,
            lazy: true,
            performanceThreshold: 50, // ms
            accessibilityEnhanced: true,
            dependencies: []
        };

        const finalConfig = { ...defaultConfig, ...config };

        // Validate dependencies
        if (finalConfig.dependencies) {
            finalConfig.dependencies.forEach(dep => {
                if (!this.components.has(dep)) {
                    throw new Error(`Dependency ${dep} not found for component ${id}`);
                }
            });
        }

        this.components.set(id, component);
        this.componentConfigs.set(id, finalConfig);
        this.renderHistory.set(id, []);

        componentRegistry.register(id, component);
    }

    public getComponent(id: string): React.ComponentType<any> {
        const component = this.components.get(id);
        if (!component) {
            throw new Error(`Component ${id} not found`);
        }
        return component;
    }

    public createEnhancedComponent(id: string) {
        const Component = this.getComponent(id);
        const config = this.componentConfigs.get(id);

        if (!config) {
            throw new Error(`Configuration not found for component ${id}`);
        }

        return (props: any) => {
            const startTime = performance.now();

            // Accessibility enhancement
            const EnhancedComponent = config.accessibilityEnhanced 
                ? accessibilityEnhancer.enhance(Component) 
                : Component;

            // Performance tracking
            useEffect(() => {
                const endTime = performance.now();
                const renderDuration = endTime - startTime;

                const history = this.renderHistory.get(id) || [];
                history.push(renderDuration);
                
                // Keep only last 100 render times
                if (history.length > 100) {
                    history.shift();
                }
                this.renderHistory.set(id, history);

                // Log performance if threshold exceeded
                if (renderDuration > (config.performanceThreshold || 50)) {
                    performanceMonitor.logSlowRender({
                        component: id,
                        duration: renderDuration
                    });
                }
            }, []);

            return (
                <ErrorBoundary 
                    fallbackRender={({ error }) => (
                        <div>
                            <h1>Component Error</h1>
                            <p>{error.message}</p>
                        </div>
                    )}
                >
                    <Suspense fallback={<div>Loading...</div>}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <EnhancedComponent {...props} />
                        </motion.div>
                    </Suspense>
                </ErrorBoundary>
            );
        };
    }

    public generateComponentReport() {
        const report: any = {
            totalComponents: this.components.size,
            componentPerformance: {}
        };

        this.components.forEach((_, id) => {
            const renderTimes = this.renderHistory.get(id) || [];
            const config = this.componentConfigs.get(id);

            report.componentPerformance[id] = {
                config,
                renderStats: {
                    averageRenderTime: renderTimes.length > 0 
                        ? renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length 
                        : 0,
                    maxRenderTime: renderTimes.length > 0 
                        ? Math.max(...renderTimes) 
                        : 0,
                    renderCount: renderTimes.length
                }
            };
        });

        return report;
    }
}

// Predefined component configurations
const componentManager = ComponentManager.getInstance();

// Register standard components
const standardComponents = [
    { id: 'AIAssistant', path: './AIAssistant' },
    { id: 'AIOperationsCenter', path: './AIOperationsCenter' },
    { id: 'AdvancedAnalytics', path: './AdvancedAnalytics' },
    { id: 'AdvancedDashboard', path: './AdvancedDashboard' },
    { id: 'AdvancedScheduling', path: './AdvancedScheduling' },
    { id: 'AdvancedSearch', path: './AdvancedSearch' },
    { id: 'ApiDocumentation', path: './ApiDocumentation' },
    { id: 'AppSidebar', path: './AppSidebar' },
    { id: 'CostCounter', path: './CostCounter' },
    { id: 'CrewManagement', path: './CrewManagement' },
    { id: 'DashboardCustomizer', path: './DashboardCustomizer' },
    { id: 'EmployeeTracker', path: './EmployeeTracker' },
    { id: 'EnhancedProjectManagement', path: './EnhancedProjectManagement' },
    { id: 'EnterpriseIntegrations', path: './EnterpriseIntegrations' },
    { id: 'ErrorBoundary', path: './ErrorBoundary' },
    { id: 'FinancialDashboard', path: './FinancialDashboard' },
    { id: 'GlobalExpansion', path: './GlobalExpansion' },
    { id: 'Header', path: './Header' },
    { id: 'IoTDashboard', path: './IoTDashboard' },
    { id: 'LazyLoadWrapper', path: './LazyLoadWrapper' },
    { id: 'Loading', path: './Loading' },
    { id: 'MetricCard', path: './MetricCard' },
    { id: 'MissionControlCenter', path: './MissionControlCenter' },
    { id: 'MobileCompanion', path: './MobileCompanion' },
    { id: 'MobileFieldInterface', path: './MobileFieldInterface' },
    { id: 'NotificationCenter', path: './NotificationCenter' },
    { id: 'OfflineManager', path: './OfflineManager' },
    { id: 'OverWatchTOSS', path: './OverWatchTOSS' },
    { id: 'PerformanceDashboard', path: './PerformanceDashboard' },
    { id: 'PerformanceMonitor', path: './PerformanceMonitor' },
    { id: 'PredictiveAnalytics', path: './PredictiveAnalytics' },
    { id: 'ProjectCard', path: './ProjectCard' },
    { id: 'ProtectedRoute', path: './ProtectedRoute' },
    { id: 'QuantumOperationsCenter', path: './QuantumOperationsCenter' },
    { id: 'QuickActions', path: './QuickActions' },
    { id: 'RealtimeDashboard', path: './RealtimeDashboard' },
    { id: 'RecentActivity', path: './RecentActivity' },
    { id: 'SecurityDashboard', path: './SecurityDashboard' },
    { id: 'TaskPriorityManager', path: './TaskPriorityManager' },
    { id: 'ThemeCard', path: './ThemeCard' },
    { id: 'ThemeSelector', path: './ThemeSelector' },
    { id: 'UltimateEnhancedMissionControl', path: './UltimateEnhancedMissionControl' },
    { id: 'VoiceInterface', path: './VoiceInterface' }
];

standardComponents.forEach(({ id, path }) => {
    const LazyComponent = lazy(() => import(path));
    componentManager.registerComponent(id, LazyComponent, {
        lazy: true,
        performanceThreshold: 100,
        accessibilityEnhanced: true
    });
});

export default componentManager;