import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

interface FeatureConfig {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    dependencies?: string[];
    permissions?: string[];
    performanceThresholds?: {
        maxExecutionTime: number;
        memoryLimit: number;
    };
}

interface FeatureMetadata {
    lastUsed: Date;
    usageCount: number;
    performanceHistory: number[];
}

class FeatureManager extends EventEmitter {
    private features: Map<string, FeatureConfig> = new Map();
    private featureMetadata: Map<string, FeatureMetadata> = new Map();
    private featureDependencyGraph: Map<string, string[]> = new Map();

    constructor() {
        super();
        this.initializeStandardFeatures();
    }

    private initializeStandardFeatures() {
        const standardFeatures: FeatureConfig[] = [
            {
                id: 'ai-services',
                name: 'AI-Powered Services',
                description: 'Advanced AI capabilities for pavement analysis',
                enabled: true,
                dependencies: ['weather', 'measurements'],
                permissions: ['admin', 'analyst'],
                performanceThresholds: {
                    maxExecutionTime: 5000, // 5 seconds
                    memoryLimit: 500 // MB
                }
            },
            {
                id: 'weather',
                name: 'Weather Integration',
                description: 'Real-time weather data for pavement conditions',
                enabled: true,
                dependencies: ['measurements'],
                permissions: ['admin', 'field-crew'],
                performanceThresholds: {
                    maxExecutionTime: 2000, // 2 seconds
                    memoryLimit: 200 // MB
                }
            },
            {
                id: 'measurements',
                name: 'Advanced Measurements',
                description: 'Precise pavement measurement and analysis',
                enabled: true,
                permissions: ['admin', 'analyst', 'field-crew'],
                performanceThresholds: {
                    maxExecutionTime: 3000, // 3 seconds
                    memoryLimit: 300 // MB
                }
            },
            {
                id: 'estimations',
                name: 'Project Estimations',
                description: 'AI-driven project cost and time estimations',
                enabled: true,
                dependencies: ['ai-services', 'measurements'],
                permissions: ['admin', 'sales'],
                performanceThresholds: {
                    maxExecutionTime: 4000, // 4 seconds
                    memoryLimit: 400 // MB
                }
            },
            {
                id: 'equipment',
                name: 'Equipment Management',
                description: 'Advanced tracking and optimization of equipment',
                enabled: true,
                permissions: ['admin', 'operations'],
                performanceThresholds: {
                    maxExecutionTime: 2500, // 2.5 seconds
                    memoryLimit: 250 // MB
                }
            },
            {
                id: 'projects',
                name: 'Project Management',
                description: 'Comprehensive project lifecycle management',
                enabled: true,
                dependencies: ['estimations', 'equipment'],
                permissions: ['admin', 'project-manager'],
                performanceThresholds: {
                    maxExecutionTime: 5000, // 5 seconds
                    memoryLimit: 500 // MB
                }
            }
        ];

        standardFeatures.forEach(feature => {
            this.registerFeature(feature);
        });
    }

    public registerFeature(feature: FeatureConfig) {
        // Validate feature configuration
        if (!feature.id) {
            feature.id = uuidv4();
        }

        // Check for circular dependencies
        if (feature.dependencies) {
            this.validateDependencies(feature.id, feature.dependencies);
        }

        this.features.set(feature.id, feature);
        
        // Initialize metadata
        this.featureMetadata.set(feature.id, {
            lastUsed: new Date(),
            usageCount: 0,
            performanceHistory: []
        });

        // Build dependency graph
        if (feature.dependencies) {
            this.featureDependencyGraph.set(feature.id, feature.dependencies);
        }

        this.emit('feature-registered', feature);
    }

    private validateDependencies(featureId: string, dependencies: string[], visited: Set<string> = new Set()) {
        if (visited.has(featureId)) {
            throw new Error(`Circular dependency detected for feature: ${featureId}`);
        }

        visited.add(featureId);

        dependencies.forEach(dep => {
            if (!this.features.has(dep)) {
                throw new Error(`Dependency ${dep} not found for feature ${featureId}`);
            }

            const depDependencies = this.featureDependencyGraph.get(dep) || [];
            this.validateDependencies(dep, depDependencies, new Set(visited));
        });
    }

    public enableFeature(featureId: string) {
        const feature = this.features.get(featureId);
        if (!feature) {
            throw new Error(`Feature ${featureId} not found`);
        }

        // Check and enable dependencies
        if (feature.dependencies) {
            feature.dependencies.forEach(dep => {
                const dependentFeature = this.features.get(dep);
                if (dependentFeature && !dependentFeature.enabled) {
                    this.enableFeature(dep);
                }
            });
        }

        feature.enabled = true;
        this.emit('feature-enabled', feature);
    }

    public disableFeature(featureId: string) {
        const feature = this.features.get(featureId);
        if (!feature) {
            throw new Error(`Feature ${featureId} not found`);
        }

        // Check for features depending on this feature
        const dependentFeatures = Array.from(this.featureDependencyGraph.entries())
            .filter(([, deps]) => deps.includes(featureId))
            .map(([featureId]) => featureId);

        if (dependentFeatures.length > 0) {
            throw new Error(`Cannot disable feature. Dependent features exist: ${dependentFeatures.join(', ')}`);
        }

        feature.enabled = false;
        this.emit('feature-disabled', feature);
    }

    public executeFeature(featureId: string, executor: () => Promise<any>) {
        const feature = this.features.get(featureId);
        if (!feature || !feature.enabled) {
            throw new Error(`Feature ${featureId} is not enabled`);
        }

        const startTime = performance.now();

        return new Promise(async (resolve, reject) => {
            try {
                const result = await executor();
                
                const endTime = performance.now();
                const executionTime = endTime - startTime;

                // Update feature metadata
                const metadata = this.featureMetadata.get(featureId);
                if (metadata) {
                    metadata.lastUsed = new Date();
                    metadata.usageCount++;
                    metadata.performanceHistory.push(executionTime);

                    // Trim performance history
                    if (metadata.performanceHistory.length > 100) {
                        metadata.performanceHistory.shift();
                    }
                }

                // Check performance thresholds
                if (feature.performanceThresholds) {
                    if (executionTime > feature.performanceThresholds.maxExecutionTime) {
                        this.emit('performance-warning', {
                            featureId,
                            executionTime,
                            threshold: feature.performanceThresholds.maxExecutionTime
                        });
                    }
                }

                resolve(result);
            } catch (error) {
                this.emit('feature-error', { featureId, error });
                reject(error);
            }
        });
    }

    public getFeatureStatus(featureId: string) {
        const feature = this.features.get(featureId);
        if (!feature) {
            throw new Error(`Feature ${featureId} not found`);
        }

        const metadata = this.featureMetadata.get(featureId);
        return {
            ...feature,
            metadata: metadata || {}
        };
    }

    public listFeatures() {
        return Array.from(this.features.values());
    }

    public generateFeatureReport() {
        const report = {
            totalFeatures: this.features.size,
            enabledFeatures: 0,
            featurePerformance: {}
        };

        this.features.forEach((feature, featureId) => {
            if (feature.enabled) {
                report.enabledFeatures++;
            }

            const metadata = this.featureMetadata.get(featureId);
            if (metadata) {
                report.featurePerformance[featureId] = {
                    usageCount: metadata.usageCount,
                    lastUsed: metadata.lastUsed,
                    averageExecutionTime: metadata.performanceHistory.length > 0
                        ? metadata.performanceHistory.reduce((a, b) => a + b, 0) / metadata.performanceHistory.length
                        : 0
                };
            }
        });

        return report;
    }
}

export default new FeatureManager();