import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

interface MiddlewareConfig {
    id: string;
    name: string;
    priority: number;
    enabled: boolean;
    type: 'pre' | 'post' | 'error';
    performanceThreshold?: number;
}

interface MiddlewareExecutionContext {
    requestId: string;
    timestamp: number;
    metadata: Record<string, any>;
}

class MiddlewareManager extends EventEmitter {
    private middlewares: Map<string, Function> = new Map();
    private middlewareConfigs: Map<string, MiddlewareConfig> = new Map();
    private executionHistory: Map<string, number[]> = new Map();

    constructor() {
        super();
        this.initializeStandardMiddlewares();
    }

    private initializeStandardMiddlewares() {
        const standardMiddlewares: Array<{
            middleware: Function;
            config: MiddlewareConfig;
        }> = [
            {
                middleware: this.authMiddleware,
                config: {
                    id: 'auth',
                    name: 'Authentication Middleware',
                    priority: 100,
                    enabled: true,
                    type: 'pre',
                    performanceThreshold: 50
                }
            },
            {
                middleware: this.loggingMiddleware,
                config: {
                    id: 'logging',
                    name: 'Request Logging Middleware',
                    priority: 50,
                    enabled: true,
                    type: 'pre',
                    performanceThreshold: 30
                }
            },
            {
                middleware: this.securityHeadersMiddleware,
                config: {
                    id: 'security-headers',
                    name: 'Security Headers Middleware',
                    priority: 75,
                    enabled: true,
                    type: 'pre',
                    performanceThreshold: 20
                }
            },
            {
                middleware: this.errorHandlingMiddleware,
                config: {
                    id: 'error-handler',
                    name: 'Global Error Handling Middleware',
                    priority: 200,
                    enabled: true,
                    type: 'error',
                    performanceThreshold: 100
                }
            }
        ];

        standardMiddlewares.forEach(({ middleware, config }) => {
            this.registerMiddleware(config, middleware);
        });
    }

    public registerMiddleware(
        config: MiddlewareConfig, 
        middleware: Function
    ) {
        // Generate unique ID if not provided
        if (!config.id) {
            config.id = uuidv4();
        }

        // Validate middleware
        if (typeof middleware !== 'function') {
            throw new Error(`Invalid middleware: ${config.name}`);
        }

        this.middlewares.set(config.id, middleware);
        this.middlewareConfigs.set(config.id, config);
        this.executionHistory.set(config.id, []);

        this.emit('middleware-registered', config);
    }

    private async authMiddleware(context: MiddlewareExecutionContext) {
        // Comprehensive authentication logic
        const startTime = performance.now();
        
        try {
            // Token validation
            const token = context.metadata.token;
            if (!token) {
                throw new Error('No authentication token provided');
            }

            // Validate token (placeholder for actual validation)
            const isValid = this.validateToken(token);
            if (!isValid) {
                throw new Error('Invalid authentication token');
            }

            const endTime = performance.now();
            this.trackPerformance('auth', endTime - startTime);
        } catch (error) {
            this.emit('auth-error', error);
            throw error;
        }
    }

    private async loggingMiddleware(context: MiddlewareExecutionContext) {
        // Comprehensive request logging
        const startTime = performance.now();
        
        try {
            const logEntry = {
                requestId: context.requestId,
                timestamp: context.timestamp,
                method: context.metadata.method,
                path: context.metadata.path,
                ipAddress: context.metadata.ipAddress
            };

            // Log to console and potentially to a logging service
            console.log(JSON.stringify(logEntry));

            const endTime = performance.now();
            this.trackPerformance('logging', endTime - startTime);
        } catch (error) {
            this.emit('logging-error', error);
        }
    }

    private async securityHeadersMiddleware(context: MiddlewareExecutionContext) {
        // Add security headers
        const startTime = performance.now();
        
        try {
            const securityHeaders = {
                'X-Content-Type-Options': 'nosniff',
                'X-Frame-Options': 'DENY',
                'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
                'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
                'Referrer-Policy': 'strict-origin-when-cross-origin',
                'X-XSS-Protection': '1; mode=block'
            };

            // In a real implementation, you'd actually set these headers
            context.metadata.securityHeaders = securityHeaders;

            const endTime = performance.now();
            this.trackPerformance('security-headers', endTime - startTime);
        } catch (error) {
            this.emit('security-headers-error', error);
        }
    }

    private async errorHandlingMiddleware(error: Error, context: MiddlewareExecutionContext) {
        // Comprehensive error handling and reporting
        const startTime = performance.now();
        
        try {
            const errorLog = {
                requestId: context.requestId,
                timestamp: new Date().toISOString(),
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                },
                context: context.metadata
            };

            // Log error
            console.error(JSON.stringify(errorLog));

            // Potentially send to error tracking service
            this.reportErrorToService(errorLog);

            const endTime = performance.now();
            this.trackPerformance('error-handler', endTime - startTime);
        } catch (handlingError) {
            console.error('Error in error handling middleware', handlingError);
        }
    }

    private trackPerformance(middlewareId: string, duration: number) {
        const history = this.executionHistory.get(middlewareId) || [];
        history.push(duration);
        
        // Keep only last 100 execution times
        if (history.length > 100) {
            history.shift();
        }
        this.executionHistory.set(middlewareId, history);

        // Check performance threshold
        const config = this.middlewareConfigs.get(middlewareId);
        if (config && duration > (config.performanceThreshold || 50)) {
            this.emit('performance-warning', {
                middlewareId,
                duration,
                threshold: config.performanceThreshold
            });
        }
    }

    private validateToken(token: string): boolean {
        // Placeholder for token validation
        // In a real implementation, this would verify the token's validity
        return token.length > 10;
    }

    private reportErrorToService(errorLog: any) {
        // Placeholder for error reporting
        // In a real implementation, this would send to an error tracking service
        console.log('Reporting error:', errorLog);
    }

    public async executeMiddleware(
        type: 'pre' | 'post' | 'error', 
        context: MiddlewareExecutionContext
    ) {
        const middlewaresToExecute = Array.from(this.middlewareConfigs.values())
            .filter(config => config.type === type && config.enabled)
            .sort((a, b) => a.priority - b.priority);

        for (const config of middlewaresToExecute) {
            const middleware = this.middlewares.get(config.id);
            if (middleware) {
                try {
                    await middleware(context);
                } catch (error) {
                    // If it's an error middleware, pass the error
                    if (type === 'error') {
                        throw error;
                    }
                    // For other middleware types, log and continue
                    this.emit('middleware-error', { middlewareId: config.id, error });
                }
            }
        }
    }

    public generateMiddlewareReport() {
        const report: any = {
            totalMiddlewares: this.middlewares.size,
            middlewarePerformance: {}
        };

        this.middlewares.forEach((_, middlewareId) => {
            const config = this.middlewareConfigs.get(middlewareId);
            const executionTimes = this.executionHistory.get(middlewareId) || [];

            report.middlewarePerformance[middlewareId] = {
                config,
                performanceStats: {
                    averageExecutionTime: executionTimes.length > 0
                        ? executionTimes.reduce((a, b) => a + b, 0) / executionTimes.length
                        : 0,
                    maxExecutionTime: executionTimes.length > 0
                        ? Math.max(...executionTimes)
                        : 0,
                    executionCount: executionTimes.length
                }
            };
        });

        return report;
    }
}

export default new MiddlewareManager(); 