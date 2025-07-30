import { PerformanceObserver } from 'perf_hooks';
import * as v8 from 'v8';
import * as os from 'os';
import * as cluster from 'cluster';
import { EventEmitter } from 'events';

interface PerformanceMetric {
    name: string;
    duration: number;
    timestamp: number;
    type: 'render' | 'network' | 'computation' | 'database' | 'custom';
}

interface ResourceUsage {
    cpuUsage: number;
    memoryUsage: {
        total: number;
        used: number;
        free: number;
    };
    diskUsage?: {
        total: number;
        used: number;
        free: number;
    };
}

interface OptimizationStrategy {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    threshold?: {
        metric: string;
        value: number;
        action: 'warn' | 'optimize' | 'alert';
    };
}

class PerformanceOptimizer extends EventEmitter {
    private performanceMetrics: PerformanceMetric[] = [];
    private optimizationStrategies: Map<string, OptimizationStrategy> = new Map();
    private performanceObserver: PerformanceObserver | null = null;

    constructor() {
        super();
        this.initializePerformanceObserver();
        this.setupDefaultOptimizationStrategies();
        this.monitorSystemResources();
    }

    private initializePerformanceObserver() {
        this.performanceObserver = new PerformanceObserver((list) => {
            const entry = list.getEntries()[0];
            if (entry) {
                this.recordPerformanceMetric({
                    name: entry.name,
                    duration: entry.duration,
                    timestamp: Date.now(),
                    type: this.inferMetricType(entry.name)
                });
            }
        });

        this.performanceObserver?.observe({ 
            entryTypes: ['measure', 'function'] 
        });
    }

    private inferMetricType(name: string): PerformanceMetric['type'] {
        if (name.includes('render')) return 'render';
        if (name.includes('network')) return 'network';
        if (name.includes('compute') || name.includes('calculation')) return 'computation';
        if (name.includes('database') || name.includes('query')) return 'database';
        return 'custom';
    }

    private setupDefaultOptimizationStrategies() {
        const defaultStrategies: OptimizationStrategy[] = [
            {
                id: 'render-performance',
                name: 'Render Performance Optimization',
                description: 'Optimize rendering performance for complex UI components',
                enabled: true,
                threshold: {
                    metric: 'render-duration',
                    value: 100, // ms
                    action: 'optimize'
                }
            },
            {
                id: 'memory-management',
                name: 'Memory Usage Optimization',
                description: 'Manage and optimize memory consumption',
                enabled: true,
                threshold: {
                    metric: 'memory-usage',
                    value: 75, // percent
                    action: 'alert'
                }
            },
            {
                id: 'network-performance',
                name: 'Network Performance Optimization',
                description: 'Optimize network request performance',
                enabled: true,
                threshold: {
                    metric: 'network-latency',
                    value: 500, // ms
                    action: 'warn'
                }
            }
        ];

        defaultStrategies.forEach(strategy => 
            this.registerOptimizationStrategy(strategy)
        );
    }

    public registerOptimizationStrategy(strategy: OptimizationStrategy) {
        this.optimizationStrategies.set(strategy.id, strategy);
        this.emit('optimization-strategy-registered', strategy);
    }

    public recordPerformanceMetric(metric: PerformanceMetric) {
        this.performanceMetrics.push(metric);

        // Limit metrics to last 1000 entries
        if (this.performanceMetrics.length > 1000) {
            this.performanceMetrics.shift();
        }

        // Check against optimization strategies
        this.checkOptimizationStrategies(metric);
    }

    private checkOptimizationStrategies(metric: PerformanceMetric) {
        this.optimizationStrategies.forEach(strategy => {
            if (!strategy.enabled || !strategy.threshold) return;

            let metricValue: number;
            switch (strategy.threshold.metric) {
                case 'render-duration':
                    metricValue = metric.duration;
                    break;
                default:
                    return;
            }

            if (metricValue > strategy.threshold.value) {
                this.emit('performance-threshold-exceeded', {
                    strategy,
                    metric,
                    action: strategy.threshold.action
                });
            }
        });
    }

    private monitorSystemResources() {
        // Periodic system resource monitoring
        setInterval(() => {
            const resourceUsage = this.getResourceUsage();
            this.emit('system-resource-update', resourceUsage);

            // Check memory usage
            if (resourceUsage.memoryUsage.used / resourceUsage.memoryUsage.total > 0.75) {
                this.emit('high-memory-usage', resourceUsage);
            }
        }, 60000); // Every minute
    }

    public getResourceUsage(): ResourceUsage {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();

        const diskUsage = this.getDiskUsage();
        return {
            cpuUsage: os.cpus().map((cpu: any) => cpu.times).reduce((acc: number, times: any) => {
                const total = Object.values(times).reduce((a, b) => (Number(a) + Number(b)), 0);
                const idle = times.idle;
                return acc + (((total as number) - idle) / (total as number)) * 100;
            }, 0) / os.cpus().length,
            memoryUsage: {
                total: totalMemory,
                used: totalMemory - freeMemory,
                free: freeMemory
            },
            ...(diskUsage && { diskUsage })
        };
    }

    private getDiskUsage(): ResourceUsage['diskUsage'] {
        // Placeholder for disk usage - would require platform-specific implementation
        return undefined;
    }

    public generatePerformanceReport() {
        const metrics = this.performanceMetrics;
        const strategies = Array.from(this.optimizationStrategies.values());
        const resourceUsage = this.getResourceUsage();

        return {
            metrics: {
                total: metrics.length,
                byType: metrics.reduce((acc, metric) => {
                    (acc as Record<string, number>)[metric.type] = ((acc as Record<string, number>)[metric.type] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
                averageDurations: metrics.reduce((acc, metric) => {
                    const currentAvg = (acc as Record<string, number>)[metric.type];
                    (acc as Record<string, number>)[metric.type] = currentAvg 
                        ? (currentAvg + metric.duration) / 2 
                        : metric.duration;
                    return acc;
                }, {} as Record<string, number>)
            },
            optimizationStrategies: strategies,
            resourceUsage,
            recommendations: this.generateOptimizationRecommendations()
        };
    }

    private generateOptimizationRecommendations() {
        const recommendations: string[] = [];
        const report = this.generatePerformanceReport();

        // Memory optimization recommendations
        if (report.resourceUsage.memoryUsage.used / report.resourceUsage.memoryUsage.total > 0.7) {
            recommendations.push('Consider implementing memory-efficient data structures');
            recommendations.push('Use lazy loading and code splitting');
        }

        // Performance metric recommendations
        Object.entries(report.metrics.averageDurations).forEach(([type, avgDuration]) => {
            if (typeof avgDuration === 'number' && avgDuration > 200) {
                recommendations.push(`Optimize ${type} performance - current average duration exceeds 200ms`);
            }
        });

        return recommendations;
    }

    // Advanced V8 Optimization Techniques
    public optimizeV8Runtime() {
        // Configure V8 optimization settings
        v8.setFlagsFromString('--optimize-for-size');
        v8.setFlagsFromString('--max-old-space-size=4096');

        // Trigger garbage collection
        global.gc?.();

        this.emit('v8-runtime-optimized');
    }

    // Cluster-based Performance Scaling
    public setupClusterPerformance(workerCount?: number) {
        if (!(cluster as any).isPrimary) return;

        const numCPUs = workerCount || os.cpus().length;

        console.log(`Primary ${process.pid} is running`);

        // Fork workers
        for (let i = 0; i < numCPUs; i++) {
            (cluster as any).fork();
        }

        (cluster as any).on('exit', (worker: any, _code: any, _signal: any) => {
            console.log(`worker ${worker.process.pid} died`);
            // Automatically restart worker
            (cluster as any).fork();
        });

        this.emit('cluster-performance-setup', { workerCount: numCPUs });
    }
}

export default new PerformanceOptimizer(); 