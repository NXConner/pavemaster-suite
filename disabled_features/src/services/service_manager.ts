import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { Circuit } from 'opossum'; // Circuit breaker library

interface ServiceConfig {
    id: string;
    name: string;
    type: 'internal' | 'external';
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    timeout?: number;
    retries?: number;
    circuitBreaker?: {
        failureThreshold?: number;
        resetTimeout?: number;
    };
    dependencies?: string[];
    performanceThreshold?: number;
}

interface ServiceMetadata {
    lastCalled: Date;
    callCount: number;
    successCount: number;
    failureCount: number;
    averageResponseTime: number;
    performanceHistory: number[];
}

class ServiceManager extends EventEmitter {
    private services: Map<string, Function> = new Map();
    private serviceConfigs: Map<string, ServiceConfig> = new Map();
    private serviceMetadata: Map<string, ServiceMetadata> = new Map();
    private circuitBreakers: Map<string, Circuit> = new Map();

    constructor() {
        super();
        this.initializeStandardServices();
    }

    private initializeStandardServices() {
        const standardServices: Array<{
            service: Function;
            config: ServiceConfig;
        }> = [
            {
                service: this.aiService,
                config: {
                    id: 'ai-service',
                    name: 'AI Analysis Service',
                    type: 'internal',
                    endpoint: '/api/ai/analyze',
                    method: 'POST',
                    timeout: 5000,
                    retries: 3,
                    circuitBreaker: {
                        failureThreshold: 0.5,
                        resetTimeout: 30000
                    },
                    performanceThreshold: 1000
                }
            },
            {
                service: this.weatherService,
                config: {
                    id: 'weather-service',
                    name: 'Weather Data Service',
                    type: 'external',
                    endpoint: 'https://api.weatherservice.com/forecast',
                    method: 'GET',
                    timeout: 3000,
                    retries: 2,
                    circuitBreaker: {
                        failureThreshold: 0.3,
                        resetTimeout: 60000
                    },
                    performanceThreshold: 800
                }
            },
            {
                service: this.financialService,
                config: {
                    id: 'financial-service',
                    name: 'Financial Calculation Service',
                    type: 'internal',
                    endpoint: '/api/financial/calculate',
                    method: 'POST',
                    timeout: 4000,
                    retries: 3,
                    circuitBreaker: {
                        failureThreshold: 0.4,
                        resetTimeout: 45000
                    },
                    performanceThreshold: 1200
                }
            }
        ];

        standardServices.forEach(({ service, config }) => {
            this.registerService(config, service);
        });
    }

    public registerService(
        config: ServiceConfig, 
        service: Function
    ) {
        // Generate unique ID if not provided
        if (!config.id) {
            config.id = uuidv4();
        }

        // Validate service
        if (typeof service !== 'function') {
            throw new Error(`Invalid service: ${config.name}`);
        }

        // Create circuit breaker
        const circuitBreaker = new Circuit(service, {
            timeout: config.timeout || 3000,
            errorThresholdPercentage: (config.circuitBreaker?.failureThreshold || 0.5) * 100,
            resetTimeout: config.circuitBreaker?.resetTimeout || 30000
        });

        this.services.set(config.id, service);
        this.serviceConfigs.set(config.id, config);
        this.circuitBreakers.set(config.id, circuitBreaker);
        
        // Initialize metadata
        this.serviceMetadata.set(config.id, {
            lastCalled: new Date(),
            callCount: 0,
            successCount: 0,
            failureCount: 0,
            averageResponseTime: 0,
            performanceHistory: []
        });

        this.emit('service-registered', config);
    }

    private async aiService(data: any) {
        // Simulate AI analysis service
        const startTime = performance.now();
        
        try {
            // Simulated AI processing
            const result = await this.simulateAsyncProcess(data, 1000);
            
            const endTime = performance.now();
            this.trackServicePerformance('ai-service', endTime - startTime, true);
            
            return result;
        } catch (error) {
            this.trackServicePerformance('ai-service', 0, false);
            throw error;
        }
    }

    private async weatherService(location: string) {
        // External weather service call
        const startTime = performance.now();
        
        try {
            const response = await axios.get(`https://api.weatherservice.com/forecast?location=${location}`, {
                timeout: 3000
            });
            
            const endTime = performance.now();
            this.trackServicePerformance('weather-service', endTime - startTime, true);
            
            return response.data;
        } catch (error) {
            this.trackServicePerformance('weather-service', 0, false);
            throw error;
        }
    }

    private async financialService(calculationData: any) {
        // Simulate financial calculation service
        const startTime = performance.now();
        
        try {
            // Simulated financial calculation
            const result = await this.simulateAsyncProcess(calculationData, 1500);
            
            const endTime = performance.now();
            this.trackServicePerformance('financial-service', endTime - startTime, true);
            
            return result;
        } catch (error) {
            this.trackServicePerformance('financial-service', 0, false);
            throw error;
        }
    }

    private async simulateAsyncProcess(data: any, delay: number): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate some processing
                if (Math.random() > 0.1) { // 90% success rate
                    resolve({ processed: true, data });
                } else {
                    reject(new Error('Simulated service failure'));
                }
            }, delay);
        });
    }

    private trackServicePerformance(
        serviceId: string, 
        duration: number, 
        success: boolean
    ) {
        const metadata = this.serviceMetadata.get(serviceId);
        if (!metadata) return;

        metadata.lastCalled = new Date();
        metadata.callCount++;
        
        if (success) {
            metadata.successCount++;
            metadata.performanceHistory.push(duration);
        } else {
            metadata.failureCount++;
        }

        // Calculate average response time
        if (metadata.performanceHistory.length > 0) {
            metadata.averageResponseTime = 
                metadata.performanceHistory.reduce((a, b) => a + b, 0) / 
                metadata.performanceHistory.length;
        }

        // Trim performance history
        if (metadata.performanceHistory.length > 100) {
            metadata.performanceHistory.shift();
        }

        // Check performance threshold
        const config = this.serviceConfigs.get(serviceId);
        if (config && duration > (config.performanceThreshold || 1000)) {
            this.emit('performance-warning', {
                serviceId,
                duration,
                threshold: config.performanceThreshold
            });
        }
    }

    public async executeService(
        serviceId: string, 
        ...args: any[]
    ) {
        const service = this.services.get(serviceId);
        const circuitBreaker = this.circuitBreakers.get(serviceId);
        
        if (!service || !circuitBreaker) {
            throw new Error(`Service ${serviceId} not found`);
        }

        try {
            // Execute service through circuit breaker
            return await circuitBreaker.fire(...args);
        } catch (error) {
            this.emit('service-error', { serviceId, error });
            throw error;
        }
    }

    public generateServiceReport() {
        const report: any = {
            totalServices: this.services.size,
            servicePerformance: {}
        };

        this.services.forEach((_, serviceId) => {
            const config = this.serviceConfigs.get(serviceId);
            const metadata = this.serviceMetadata.get(serviceId);
            const circuitBreaker = this.circuitBreakers.get(serviceId);

            report.servicePerformance[serviceId] = {
                config,
                metadata,
                circuitBreakerState: circuitBreaker ? {
                    isOpen: circuitBreaker.state === 'open',
                    failureRate: circuitBreaker.failures / circuitBreaker.totalCount
                } : null
            };
        });

        return report;
    }

    public getServiceStatus(serviceId: string) {
        const config = this.serviceConfigs.get(serviceId);
        const metadata = this.serviceMetadata.get(serviceId);
        const circuitBreaker = this.circuitBreakers.get(serviceId);

        if (!config || !metadata || !circuitBreaker) {
            throw new Error(`Service ${serviceId} not found`);
        }

        return {
            ...config,
            metadata,
            circuitBreakerState: {
                isOpen: circuitBreaker.state === 'open',
                failureRate: circuitBreaker.failures / circuitBreaker.totalCount
            }
        };
    }
}

export default new ServiceManager(); 