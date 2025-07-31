import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as jsonata from 'jsonata';

interface EnterpriseIntegrationConfig {
    id: string;
    name: string;
    type: 'api' | 'data-transformation' | 'service-orchestration' | 'webhook';
    enabled: boolean;
    performanceThreshold?: number;
}

interface APIIntegration {
    id: string;
    name: string;
    baseUrl: string;
    authMethod: 'none' | 'basic' | 'bearer' | 'oauth';
    credentials?: {
        username?: string;
        password?: string;
        token?: string;
    };
    endpoints: Array<{
        path: string;
        method: 'GET' | 'POST' | 'PUT' | 'DELETE';
        requiredParams?: string[];
    }>;
}

interface DataTransformationRule {
    id: string;
    name: string;
    sourceFormat: string;
    targetFormat: string;
    transformationExpression: string;
}

interface ServiceOrchestrationWorkflow {
    id: string;
    name: string;
    steps: Array<{
        id: string;
        type: 'api-call' | 'data-transform' | 'conditional';
        config: any;
    }>;
}

interface WebhookIntegration {
    id: string;
    name: string;
    url: string;
    method: 'POST' | 'GET';
    secret?: string;
    events: string[];
}

class EnterpriseIntegrationManager extends EventEmitter {
    private integrationModules: Map<string, Function> = new Map();
    private integrationConfigs: Map<string, EnterpriseIntegrationConfig> = new Map();
    
    // Integration registries
    private apiRegistry: Map<string, APIIntegration> = new Map();
    private transformationRules: Map<string, DataTransformationRule> = new Map();
    private serviceWorkflows: Map<string, ServiceOrchestrationWorkflow> = new Map();
    private webhookRegistry: Map<string, WebhookIntegration> = new Map();

    // Performance and error tracking
    private performanceLog: Map<string, number[]> = new Map();
    private errorLog: any[] = [];

    constructor() {
        super();
        this.initializeStandardIntegrationModules();
    }

    private initializeStandardIntegrationModules() {
        const standardModules: Array<{
            module: Function;
            config: EnterpriseIntegrationConfig;
        }> = [
            {
                module: this.apiIntegrationModule,
                config: {
                    id: 'api-integration',
                    name: 'API Integration Management',
                    type: 'api',
                    enabled: true,
                    performanceThreshold: 200
                }
            },
            {
                module: this.dataTransformationModule,
                config: {
                    id: 'data-transformation',
                    name: 'Advanced Data Transformation',
                    type: 'data-transformation',
                    enabled: true,
                    performanceThreshold: 150
                }
            },
            {
                module: this.serviceOrchestrationModule,
                config: {
                    id: 'service-orchestration',
                    name: 'Service Workflow Orchestration',
                    type: 'service-orchestration',
                    enabled: true,
                    performanceThreshold: 300
                }
            },
            {
                module: this.webhookIntegrationModule,
                config: {
                    id: 'webhook-integration',
                    name: 'Webhook Event Management',
                    type: 'webhook',
                    enabled: true,
                    performanceThreshold: 100
                }
            }
        ];

        standardModules.forEach(({ module, config }) => {
            this.registerIntegrationModule(config, module);
        });
    }

    public registerIntegrationModule(
        config: EnterpriseIntegrationConfig, 
        module: Function
    ) {
        // Generate unique ID if not provided
        if (!config.id) {
            config.id = uuidv4();
        }

        this.integrationModules.set(config.id, module);
        this.integrationConfigs.set(config.id, config);

        this.emit('integration-module-registered', config);
    }

    private async apiIntegrationModule(
        integrationId: string, 
        endpoint: string, 
        method: 'GET' | 'POST' | 'PUT' | 'DELETE', 
        data?: any
    ) {
        const startTime = performance.now();

        try {
            // Retrieve API integration configuration
            const apiIntegration = this.apiRegistry.get(integrationId);
            if (!apiIntegration) {
                throw new Error(`API Integration ${integrationId} not found`);
            }

            // Prepare request configuration
            const requestConfig = {
                method,
                url: `${apiIntegration.baseUrl}${endpoint}`,
                headers: this.prepareAuthHeaders(apiIntegration),
                data
            };

            // Execute API call
            const response = await axios(requestConfig);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Track performance
            this.trackPerformance(integrationId, duration);

            this.emit('api-integration-success', {
                integrationId,
                endpoint,
                method,
                responseStatus: response.status
            });

            return response.data;
        } catch (error) {
            this.logError('api-integration', error);
            this.emit('api-integration-error', error);
            throw error;
        }
    }

    private async dataTransformationModule(
        ruleId: string, 
        sourceData: any
    ) {
        const startTime = performance.now();

        try {
            // Retrieve transformation rule
            const transformationRule = this.transformationRules.get(ruleId);
            if (!transformationRule) {
                throw new Error(`Transformation Rule ${ruleId} not found`);
            }

            // Execute JSONata transformation
            const expression = jsonata(transformationRule.transformationExpression);
            const transformedData = await expression.evaluate(sourceData);

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Track performance
            this.trackPerformance(ruleId, duration);

            this.emit('data-transformation-success', {
                ruleId,
                sourceFormat: transformationRule.sourceFormat,
                targetFormat: transformationRule.targetFormat
            });

            return transformedData;
        } catch (error) {
            this.logError('data-transformation', error);
            this.emit('data-transformation-error', error);
            throw error;
        }
    }

    private async serviceOrchestrationModule(
        workflowId: string, 
        initialContext: any = {}
    ) {
        const startTime = performance.now();

        try {
            // Retrieve service workflow
            const workflow = this.serviceWorkflows.get(workflowId);
            if (!workflow) {
                throw new Error(`Service Workflow ${workflowId} not found`);
            }

            // Execute workflow steps sequentially
            let context = { ...initialContext };
            const workflowResults = [];

            for (const step of workflow.steps) {
                switch (step.type) {
                    case 'api-call':
                        context = await this.executeApiStep(step, context);
                        break;
                    case 'data-transform':
                        context = await this.executeTransformationStep(step, context);
                        break;
                    case 'conditional':
                        context = this.executeConditionalStep(step, context);
                        break;
                }
                workflowResults.push(context);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Track performance
            this.trackPerformance(workflowId, duration);

            this.emit('service-orchestration-success', {
                workflowId,
                steps: workflow.steps.length,
                duration
            });

            return {
                finalContext: context,
                workflowResults
            };
        } catch (error) {
            this.logError('service-orchestration', error);
            this.emit('service-orchestration-error', error);
            throw error;
        }
    }

    private async webhookIntegrationModule(
        webhookId: string, 
        eventData: any
    ) {
        const startTime = performance.now();

        try {
            // Retrieve webhook configuration
            const webhook = this.webhookRegistry.get(webhookId);
            if (!webhook) {
                throw new Error(`Webhook ${webhookId} not found`);
            }

            // Prepare webhook payload
            const payload = {
                event: eventData,
                timestamp: new Date().toISOString()
            };

            // Send webhook
            const response = await axios.post(webhook.url, payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Webhook-Secret': webhook.secret
                }
            });

            const endTime = performance.now();
            const duration = endTime - startTime;

            // Track performance
            this.trackPerformance(webhookId, duration);

            this.emit('webhook-integration-success', {
                webhookId,
                responseStatus: response.status
            });

            return response.data;
        } catch (error) {
            this.logError('webhook-integration', error);
            this.emit('webhook-integration-error', error);
            throw error;
        }
    }

    private prepareAuthHeaders(apiIntegration: APIIntegration) {
        const headers: Record<string, string> = {};

        switch (apiIntegration.authMethod) {
            case 'basic':
                headers['Authorization'] = `Basic ${Buffer.from(
                    `${apiIntegration.credentials?.username}:${apiIntegration.credentials?.password}`
                ).toString('base64')}`;
                break;
            case 'bearer':
                headers['Authorization'] = `Bearer ${apiIntegration.credentials?.token}`;
                break;
        }

        return headers;
    }

    private async executeApiStep(step: any, context: any) {
        const apiResult = await this.apiIntegrationModule(
            step.config.integrationId, 
            step.config.endpoint, 
            step.config.method, 
            context
        );
        return { ...context, [`${step.id}_result`]: apiResult };
    }

    private async executeTransformationStep(step: any, context: any) {
        const transformedData = await this.dataTransformationModule(
            step.config.ruleId, 
            context
        );
        return { ...context, [`${step.id}_result`]: transformedData };
    }

    private executeConditionalStep(step: any, context: any) {
        // Simple conditional logic
        const condition = step.config.condition;
        const trueResult = step.config.trueResult;
        const falseResult = step.config.falseResult;

        const result = condition(context) ? trueResult : falseResult;
        return { ...context, [`${step.id}_result`]: result };
    }

    private trackPerformance(integrationId: string, duration: number) {
        const performanceHistory = this.performanceLog.get(integrationId) || [];
        performanceHistory.push(duration);

        // Keep only last 100 performance measurements
        if (performanceHistory.length > 100) {
            performanceHistory.shift();
        }

        this.performanceLog.set(integrationId, performanceHistory);
    }

    private logError(type: string, error: any) {
        const errorEntry = {
            id: uuidv4(),
            type,
            timestamp: new Date(),
            error: {
                message: error.message,
                stack: error.stack
            }
        };

        this.errorLog.push(errorEntry);

        // Keep only last 1000 errors
        if (this.errorLog.length > 1000) {
            this.errorLog.shift();
        }
    }

    public registerAPIIntegration(integration: APIIntegration) {
        this.apiRegistry.set(integration.id, integration);
        this.emit('api-integration-registered', integration);
    }

    public registerTransformationRule(rule: DataTransformationRule) {
        this.transformationRules.set(rule.id, rule);
        this.emit('transformation-rule-registered', rule);
    }

    public registerServiceWorkflow(workflow: ServiceOrchestrationWorkflow) {
        this.serviceWorkflows.set(workflow.id, workflow);
        this.emit('service-workflow-registered', workflow);
    }

    public registerWebhook(webhook: WebhookIntegration) {
        this.webhookRegistry.set(webhook.id, webhook);
        this.emit('webhook-registered', webhook);
    }

    public async executeIntegrationModule(
        moduleId: string, 
        ...args: any[]
    ) {
        const module = this.integrationModules.get(moduleId);
        
        if (!module) {
            throw new Error(`Integration module ${moduleId} not found`);
        }

        try {
            return await module(...args);
        } catch (error) {
            this.emit('integration-module-error', { moduleId, error });
            throw error;
        }
    }

    public generateIntegrationReport() {
        return {
            apiIntegrations: Array.from(this.apiRegistry.values()),
            transformationRules: Array.from(this.transformationRules.values()),
            serviceWorkflows: Array.from(this.serviceWorkflows.values()),
            webhooks: Array.from(this.webhookRegistry.values()),
            performanceMetrics: Object.fromEntries(
                Array.from(this.performanceLog.entries()).map(([id, history]) => [
                    id, 
                    {
                        averageResponseTime: history.reduce((a, b) => a + b, 0) / history.length,
                        maxResponseTime: Math.max(...history),
                        minResponseTime: Math.min(...history)
                    }
                ])
            ),
            errorSummary: {
                totalErrors: this.errorLog.length,
                recentErrors: this.errorLog.slice(-10)
            }
        };
    }
}

export default new EnterpriseIntegrationManager(); 