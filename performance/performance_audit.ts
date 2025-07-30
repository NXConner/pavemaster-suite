import { performance } from 'perf_hooks';
import * as os from 'os';
import * as v8 from 'v8';

interface AuditMetric {
    name: string;
    value: number;
    unit: string;
    type: 'time' | 'memory' | 'count' | 'percentage';
    timestamp: number;
}

interface ModulePerformanceProfile {
    moduleName: string;
    metrics: AuditMetric[];
    recommendations: string[];
}

class PerformanceAudit {
    private moduleProfiles: Map<string, ModulePerformanceProfile> = new Map();

    constructor() {
        this.initializeStandardModules();
    }

    private initializeStandardModules() {
        const standardModules = [
            'feature_manager',
            'deployment_manager',
            'security_configuration',
            'performance_optimizer',
            'scalability_manager',
            'enterprise_integration_manager'
        ];

        standardModules.forEach(moduleName => {
            this.moduleProfiles.set(moduleName, {
                moduleName,
                metrics: [],
                recommendations: []
            });
        });
    }

    public measureModulePerformance(moduleName: string, performanceTest: () => any) {
        const startTime = performance.now();
        const startMemory = process.memoryUsage().heapUsed;

        try {
            const result = performanceTest();

            const endTime = performance.now();
            const endMemory = process.memoryUsage().heapUsed;

            const profile = this.moduleProfiles.get(moduleName);
            if (profile) {
                profile.metrics.push(
                    {
                        name: 'execution_time',
                        value: endTime - startTime,
                        unit: 'ms',
                        type: 'time',
                        timestamp: Date.now()
                    },
                    {
                        name: 'memory_usage',
                        value: (endMemory - startMemory) / 1024 / 1024,
                        unit: 'MB',
                        type: 'memory',
                        timestamp: Date.now()
                    }
                );

                this.analyzePerformance(profile);
            }

            return result;
        } catch (error) {
            console.error(`Performance measurement error in ${moduleName}:`, error);
            return null;
        }
    }

    private analyzePerformance(profile: ModulePerformanceProfile) {
        const executionTimeMetrics = profile.metrics.filter(m => m.name === 'execution_time');
        const memoryUsageMetrics = profile.metrics.filter(m => m.name === 'memory_usage');

        // Time-based analysis
        if (executionTimeMetrics.length > 0) {
            const avgExecutionTime = executionTimeMetrics.reduce((sum, metric) => sum + metric.value, 0) / executionTimeMetrics.length;
            
            if (avgExecutionTime > 100) {
                profile.recommendations.push(`Optimize ${profile.moduleName} execution time. Current average: ${avgExecutionTime.toFixed(2)}ms`);
            }
        }

        // Memory-based analysis
        if (memoryUsageMetrics.length > 0) {
            const avgMemoryUsage = memoryUsageMetrics.reduce((sum, metric) => sum + metric.value, 0) / memoryUsageMetrics.length;
            const maxMemoryUsage = Math.max(...memoryUsageMetrics.map(m => m.value));

            if (avgMemoryUsage > 50) {
                profile.recommendations.push(`Reduce memory consumption in ${profile.moduleName}. Current average: ${avgMemoryUsage.toFixed(2)}MB`);
            }

            if (maxMemoryUsage > 100) {
                profile.recommendations.push(`Critical memory spike detected in ${profile.moduleName}. Peak usage: ${maxMemoryUsage.toFixed(2)}MB`);
            }
        }
    }

    public generateSystemWidePerformanceReport() {
        const systemReport = {
            timestamp: Date.now(),
            systemResources: {
                cpuCount: os.cpus().length,
                totalMemory: os.totalmem() / (1024 * 1024 * 1024),
                freeMemory: os.freemem() / (1024 * 1024 * 1024),
                v8HeapStatistics: v8.getHeapStatistics()
            },
            modulePerformance: {},
            globalRecommendations: []
        };

        let totalRecommendations = 0;
        let criticalRecommendations = 0;

        this.moduleProfiles.forEach((profile, moduleName) => {
            (systemReport.modulePerformance as Record<string, any>)[moduleName] = {
                metrics: profile.metrics,
                recommendations: profile.recommendations
            };

            totalRecommendations += profile.recommendations.length;
            criticalRecommendations += profile.recommendations.filter(r => r.includes('Critical')).length;
        });

        // Global performance recommendations
        if (totalRecommendations > 5) {
            (systemReport.globalRecommendations as string[]).push('Multiple performance bottlenecks detected. Consider comprehensive system optimization.');
        }

        if (criticalRecommendations > 0) {
            (systemReport.globalRecommendations as string[]).push(`Critical performance issues found: ${criticalRecommendations} modules require immediate attention.`);
        }

        // V8 optimization suggestions
        const heapStats = systemReport.systemResources.v8HeapStatistics;
        const heapUtilization = (heapStats.used_heap_size / heapStats.total_heap_size) * 100;

        if (heapUtilization > 70) {
            (systemReport.globalRecommendations as string[]).push(`High V8 heap utilization: ${heapUtilization.toFixed(2)}%. Consider memory optimization techniques.`);
        }

        return systemReport;
    }

    public runComprehensivePerformanceTests() {
        // Simulate performance tests for each module
        this.moduleProfiles.forEach((_profile, moduleName) => {
            try {
                // Example performance test - replace with actual module-specific tests
                this.measureModulePerformance(moduleName, () => {
                    // Simulate some computational work
                    const arr = new Array(10000).fill(0).map(() => Math.random());
                    return arr.sort((a, b) => a - b);
                });
            } catch (error) {
                console.error(`Performance test failed for ${moduleName}:`, error);
            }
        });

        return this.generateSystemWidePerformanceReport();
    }
}

export default new PerformanceAudit(); 