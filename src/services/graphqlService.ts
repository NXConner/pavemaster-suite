// PHASE 12: GraphQL API Ecosystem Service
// Comprehensive GraphQL implementation with real-time subscriptions and enterprise features
import { multiTenantService } from './multiTenantService';
import { rbacService } from './rbacService';

// PHASE 12: GraphQL Schema Types
export interface GraphQLSchema {
  types: GraphQLType[];
  queries: GraphQLQuery[];
  mutations: GraphQLMutation[];
  subscriptions: GraphQLSubscription[];
  directives: GraphQLDirective[];
}

export interface GraphQLType {
  name: string;
  kind: 'OBJECT' | 'INPUT' | 'ENUM' | 'INTERFACE' | 'UNION' | 'SCALAR';
  description?: string;
  fields: GraphQLField[];
  interfaces?: string[];
  possibleTypes?: string[];
  enumValues?: GraphQLEnumValue[];
}

export interface GraphQLField {
  name: string;
  type: string;
  description?: string;
  args: GraphQLArgument[];
  isRequired: boolean;
  isList: boolean;
  deprecationReason?: string;
}

export interface GraphQLArgument {
  name: string;
  type: string;
  description?: string;
  defaultValue?: any;
  isRequired: boolean;
}

export interface GraphQLQuery {
  name: string;
  description?: string;
  type: string;
  args: GraphQLArgument[];
  resolver: GraphQLResolver;
  permissions: string[];
  rateLimit?: RateLimit;
  complexity?: number;
}

export interface GraphQLMutation {
  name: string;
  description?: string;
  type: string;
  args: GraphQLArgument[];
  resolver: GraphQLResolver;
  permissions: string[];
  audit: boolean;
  rateLimit?: RateLimit;
}

export interface GraphQLSubscription {
  name: string;
  description?: string;
  type: string;
  args: GraphQLArgument[];
  resolver: GraphQLResolver;
  permissions: string[];
  trigger: string;
}

export interface GraphQLDirective {
  name: string;
  description?: string;
  locations: string[];
  args: GraphQLArgument[];
  processor: (context: any, args: any) => any;
}

export interface GraphQLEnumValue {
  name: string;
  value: any;
  description?: string;
  deprecationReason?: string;
}

export interface GraphQLResolver {
  handler: (parent: any, args: any, context: GraphQLContext) => any;
  middleware?: GraphQLMiddleware[];
}

export interface GraphQLContext {
  user?: any;
  tenant?: any;
  permissions?: string[];
  request: any;
  response: any;
  dataSources: any;
  pubsub: any;
}

export interface GraphQLMiddleware {
  name: string;
  handler: (context: GraphQLContext, next: () => any) => any;
}

export interface RateLimit {
  max: number;
  window: number; // milliseconds
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface APIMetrics {
  totalQueries: number;
  totalMutations: number;
  totalSubscriptions: number;
  totalErrors: number;
  averageResponseTime: number;
  activeConnections: number;
  rateLimitHits: number;
  topQueries: QueryMetric[];
}

export interface QueryMetric {
  query: string;
  count: number;
  averageTime: number;
  errorRate: number;
}

export interface APIEndpoint {
  id: string;
  name: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  version: string;
  isPublic: boolean;
  permissions: string[];
  rateLimit?: RateLimit;
  authentication: 'none' | 'api_key' | 'bearer' | 'oauth';
  responseFormat: 'json' | 'xml' | 'csv';
  documentation: string;
  examples: APIExample[];
}

export interface APIExample {
  name: string;
  description: string;
  request: any;
  response: any;
  httpStatus: number;
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  tenantId: string;
  userId: string;
  permissions: string[];
  rateLimit?: RateLimit;
  isActive: boolean;
  expiresAt?: string;
  lastUsed?: string;
  usage: APIKeyUsage;
  createdAt: string;
}

export interface APIKeyUsage {
  requests: number;
  errors: number;
  rateLimitHits: number;
  lastReset: string;
}

// PHASE 12: GraphQL Service Class
export class GraphQLService {
  private schema: GraphQLSchema | null = null;
  private resolvers: Map<string, GraphQLResolver> = new Map();
  private subscriptions: Map<string, Set<any>> = new Map();
  private rateLimits: Map<string, any> = new Map();
  private apiKeys: Map<string, APIKey> = new Map();
  private metrics: APIMetrics = {
    totalQueries: 0,
    totalMutations: 0,
    totalSubscriptions: 0,
    totalErrors: 0,
    averageResponseTime: 0,
    activeConnections: 0,
    rateLimitHits: 0,
    topQueries: []
  };
  private isInitialized: boolean = false;

  constructor() {
    this.initializeService();
  }

  // PHASE 12: Service Initialization
  private async initializeService(): Promise<void> {
    try {
      console.log('🔗 Initializing GraphQL API Service...');
      
      // Build GraphQL schema
      this.schema = await this.buildSchema();
      
      // Setup resolvers
      await this.setupResolvers();
      
      // Initialize API management
      await this.initializeAPIManagement();
      
      this.isInitialized = true;
      console.log('✅ GraphQL API Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize GraphQL service:', error);
      throw error;
    }
  }

  // PHASE 12: Schema Building
  private async buildSchema(): Promise<GraphQLSchema> {
    const schema: GraphQLSchema = {
      types: this.defineTypes(),
      queries: this.defineQueries(),
      mutations: this.defineMutations(),
      subscriptions: this.defineSubscriptions(),
      directives: this.defineDirectives()
    };

    return schema;
  }

  private defineTypes(): GraphQLType[] {
    return [
      // User Type
      {
        name: 'User',
        kind: 'OBJECT',
        description: 'A user in the system',
        fields: [
          { name: 'id', type: 'ID', args: [], isRequired: true, isList: false },
          { name: 'email', type: 'String', args: [], isRequired: true, isList: false },
          { name: 'firstName', type: 'String', args: [], isRequired: true, isList: false },
          { name: 'lastName', type: 'String', args: [], isRequired: true, isList: false },
          { name: 'roles', type: 'Role', args: [], isRequired: false, isList: true },
          { name: 'tenant', type: 'Tenant', args: [], isRequired: true, isList: false },
          { name: 'createdAt', type: 'DateTime', args: [], isRequired: true, isList: false },
          { name: 'lastLoginAt', type: 'DateTime', args: [], isRequired: false, isList: false }
        ]
      },
      
      // Project Type
      {
        name: 'Project',
        kind: 'OBJECT',
        description: 'A pavement project',
        fields: [
          { name: 'id', type: 'ID', args: [], isRequired: true, isList: false },
          { name: 'name', type: 'String', args: [], isRequired: true, isList: false },
          { name: 'description', type: 'String', args: [], isRequired: false, isList: false },
          { name: 'status', type: 'ProjectStatus', args: [], isRequired: true, isList: false },
          { name: 'location', type: 'Location', args: [], isRequired: true, isList: false },
          { name: 'area', type: 'Float', args: [], isRequired: true, isList: false },
          { name: 'owner', type: 'User', args: [], isRequired: true, isList: false },
          { name: 'team', type: 'User', args: [], isRequired: false, isList: true },
          { name: 'measurements', type: 'Measurement', args: [], isRequired: false, isList: true },
          { name: 'reports', type: 'Report', args: [], isRequired: false, isList: true },
          { name: 'createdAt', type: 'DateTime', args: [], isRequired: true, isList: false },
          { name: 'updatedAt', type: 'DateTime', args: [], isRequired: true, isList: false }
        ]
      },

      // Measurement Type
      {
        name: 'Measurement',
        kind: 'OBJECT',
        description: 'A pavement measurement',
        fields: [
          { name: 'id', type: 'ID', args: [], isRequired: true, isList: false },
          { name: 'type', type: 'MeasurementType', args: [], isRequired: true, isList: false },
          { name: 'value', type: 'Float', args: [], isRequired: true, isList: false },
          { name: 'unit', type: 'String', args: [], isRequired: true, isList: false },
          { name: 'location', type: 'Location', args: [], isRequired: true, isList: false },
          { name: 'project', type: 'Project', args: [], isRequired: true, isList: false },
          { name: 'measuredBy', type: 'User', args: [], isRequired: true, isList: false },
          { name: 'equipment', type: 'String', args: [], isRequired: false, isList: false },
          { name: 'weather', type: 'WeatherCondition', args: [], isRequired: false, isList: false },
          { name: 'notes', type: 'String', args: [], isRequired: false, isList: false },
          { name: 'createdAt', type: 'DateTime', args: [], isRequired: true, isList: false }
        ]
      },

      // Analysis Type
      {
        name: 'Analysis',
        kind: 'OBJECT',
        description: 'AI analysis results',
        fields: [
          { name: 'id', type: 'ID', args: [], isRequired: true, isList: false },
          { name: 'type', type: 'AnalysisType', args: [], isRequired: true, isList: false },
          { name: 'project', type: 'Project', args: [], isRequired: true, isList: false },
          { name: 'results', type: 'JSON', args: [], isRequired: true, isList: false },
          { name: 'confidence', type: 'Float', args: [], isRequired: true, isList: false },
          { name: 'model', type: 'String', args: [], isRequired: true, isList: false },
          { name: 'version', type: 'String', args: [], isRequired: true, isList: false },
          { name: 'createdBy', type: 'User', args: [], isRequired: true, isList: false },
          { name: 'createdAt', type: 'DateTime', args: [], isRequired: true, isList: false }
        ]
      },

      // Enums
      {
        name: 'ProjectStatus',
        kind: 'ENUM',
        description: 'Project status values',
        fields: [],
        enumValues: [
          { name: 'PLANNING', value: 'planning', description: 'Project in planning phase' },
          { name: 'IN_PROGRESS', value: 'in_progress', description: 'Project actively being worked on' },
          { name: 'COMPLETED', value: 'completed', description: 'Project completed' },
          { name: 'ON_HOLD', value: 'on_hold', description: 'Project temporarily paused' },
          { name: 'CANCELLED', value: 'cancelled', description: 'Project cancelled' }
        ]
      },

      {
        name: 'MeasurementType',
        kind: 'ENUM',
        description: 'Types of measurements',
        fields: [],
        enumValues: [
          { name: 'ROUGHNESS', value: 'roughness', description: 'Surface roughness measurement' },
          { name: 'DEFLECTION', value: 'deflection', description: 'Pavement deflection measurement' },
          { name: 'THICKNESS', value: 'thickness', description: 'Pavement thickness measurement' },
          { name: 'DENSITY', value: 'density', description: 'Material density measurement' },
          { name: 'MOISTURE', value: 'moisture', description: 'Moisture content measurement' }
        ]
      }
    ];
  }

  private defineQueries(): GraphQLQuery[] {
    return [
      {
        name: 'me',
        description: 'Get current user information',
        type: 'User',
        args: [],
        resolver: {
          handler: async (parent, args, context) => {
            return context.user;
          }
        },
        permissions: ['profile:read'],
        complexity: 1
      },

      {
        name: 'projects',
        description: 'Get list of projects',
        type: 'Project',
        args: [
          { name: 'limit', type: 'Int', defaultValue: 20, isRequired: false },
          { name: 'offset', type: 'Int', defaultValue: 0, isRequired: false },
          { name: 'status', type: 'ProjectStatus', isRequired: false },
          { name: 'search', type: 'String', isRequired: false }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.getProjects(args, context);
          }
        },
        permissions: ['projects:read'],
        complexity: 5,
        rateLimit: { max: 100, window: 60000 }
      },

      {
        name: 'project',
        description: 'Get a specific project by ID',
        type: 'Project',
        args: [
          { name: 'id', type: 'ID', isRequired: true }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.getProject(args.id, context);
          }
        },
        permissions: ['projects:read'],
        complexity: 3
      },

      {
        name: 'measurements',
        description: 'Get measurements for a project',
        type: 'Measurement',
        args: [
          { name: 'projectId', type: 'ID', isRequired: true },
          { name: 'type', type: 'MeasurementType', isRequired: false },
          { name: 'limit', type: 'Int', defaultValue: 50, isRequired: false },
          { name: 'offset', type: 'Int', defaultValue: 0, isRequired: false }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.getMeasurements(args, context);
          }
        },
        permissions: ['measurements:read'],
        complexity: 4
      },

      {
        name: 'analyses',
        description: 'Get AI analyses for a project',
        type: 'Analysis',
        args: [
          { name: 'projectId', type: 'ID', isRequired: true },
          { name: 'type', type: 'AnalysisType', isRequired: false }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.getAnalyses(args, context);
          }
        },
        permissions: ['analysis:read'],
        complexity: 6
      }
    ];
  }

  private defineMutations(): GraphQLMutation[] {
    return [
      {
        name: 'createProject',
        description: 'Create a new project',
        type: 'Project',
        args: [
          { name: 'input', type: 'CreateProjectInput', isRequired: true }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.createProject(args.input, context);
          }
        },
        permissions: ['projects:create'],
        audit: true,
        rateLimit: { max: 10, window: 60000 }
      },

      {
        name: 'updateProject',
        description: 'Update an existing project',
        type: 'Project',
        args: [
          { name: 'id', type: 'ID', isRequired: true },
          { name: 'input', type: 'UpdateProjectInput', isRequired: true }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.updateProject(args.id, args.input, context);
          }
        },
        permissions: ['projects:update'],
        audit: true
      },

      {
        name: 'addMeasurement',
        description: 'Add a new measurement to a project',
        type: 'Measurement',
        args: [
          { name: 'input', type: 'AddMeasurementInput', isRequired: true }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.addMeasurement(args.input, context);
          }
        },
        permissions: ['measurements:create'],
        audit: true,
        rateLimit: { max: 50, window: 60000 }
      },

      {
        name: 'runAnalysis',
        description: 'Run AI analysis on a project',
        type: 'Analysis',
        args: [
          { name: 'projectId', type: 'ID', isRequired: true },
          { name: 'type', type: 'AnalysisType', isRequired: true }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.runAnalysis(args.projectId, args.type, context);
          }
        },
        permissions: ['analysis:create'],
        audit: true,
        rateLimit: { max: 5, window: 60000 }
      }
    ];
  }

  private defineSubscriptions(): GraphQLSubscription[] {
    return [
      {
        name: 'projectUpdated',
        description: 'Subscribe to project updates',
        type: 'Project',
        args: [
          { name: 'projectId', type: 'ID', isRequired: true }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.subscribeToProject(args.projectId, context);
          }
        },
        permissions: ['projects:read'],
        trigger: 'PROJECT_UPDATED'
      },

      {
        name: 'measurementAdded',
        description: 'Subscribe to new measurements',
        type: 'Measurement',
        args: [
          { name: 'projectId', type: 'ID', isRequired: true }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.subscribeToMeasurements(args.projectId, context);
          }
        },
        permissions: ['measurements:read'],
        trigger: 'MEASUREMENT_ADDED'
      },

      {
        name: 'analysisCompleted',
        description: 'Subscribe to analysis completion',
        type: 'Analysis',
        args: [
          { name: 'projectId', type: 'ID', isRequired: false }
        ],
        resolver: {
          handler: async (parent, args, context) => {
            return this.subscribeToAnalyses(args.projectId, context);
          }
        },
        permissions: ['analysis:read'],
        trigger: 'ANALYSIS_COMPLETED'
      }
    ];
  }

  private defineDirectives(): GraphQLDirective[] {
    return [
      {
        name: 'auth',
        description: 'Require authentication',
        locations: ['FIELD_DEFINITION'],
        args: [
          { name: 'requires', type: 'String', isRequired: false }
        ],
        processor: (context, args) => {
          if (!context.user) {
            throw new Error('Authentication required');
          }
          if (args.requires && !context.permissions?.includes(args.requires)) {
            throw new Error('Insufficient permissions');
          }
        }
      },

      {
        name: 'rateLimit',
        description: 'Apply rate limiting',
        locations: ['FIELD_DEFINITION'],
        args: [
          { name: 'max', type: 'Int', isRequired: true },
          { name: 'window', type: 'Int', isRequired: true }
        ],
        processor: (context, args) => {
          return this.applyRateLimit(context, args);
        }
      },

      {
        name: 'deprecated',
        description: 'Mark field as deprecated',
        locations: ['FIELD_DEFINITION'],
        args: [
          { name: 'reason', type: 'String', isRequired: false }
        ],
        processor: (context, args) => {
          console.warn(`Deprecated field accessed: ${args.reason || 'No reason provided'}`);
        }
      }
    ];
  }

  // PHASE 12: Resolver Setup
  private async setupResolvers(): Promise<void> {
    // Register all resolvers
    this.schema?.queries.forEach(query => {
      this.resolvers.set(`Query.${query.name}`, query.resolver);
    });

    this.schema?.mutations.forEach(mutation => {
      this.resolvers.set(`Mutation.${mutation.name}`, mutation.resolver);
    });

    this.schema?.subscriptions.forEach(subscription => {
      this.resolvers.set(`Subscription.${subscription.name}`, subscription.resolver);
    });

    console.log(`🔗 Registered ${this.resolvers.size} GraphQL resolvers`);
  }

  // PHASE 12: Query Resolvers
  private async getProjects(args: any, context: GraphQLContext): Promise<any[]> {
    // Mock implementation - would query database
    const mockProjects = [
      {
        id: '1',
        name: 'Main Street Resurfacing',
        description: 'Resurface main thoroughfare',
        status: 'in_progress',
        location: { lat: 40.7128, lng: -74.0060 },
        area: 15000,
        owner: context.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Church Parking Lot',
        description: 'New asphalt parking lot for church',
        status: 'planning',
        location: { lat: 40.7580, lng: -73.9855 },
        area: 8500,
        owner: context.user,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Apply filters
    let filtered = mockProjects;
    if (args.status) {
      filtered = filtered.filter(p => p.status === args.status);
    }
    if (args.search) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(args.search.toLowerCase()) ||
        p.description.toLowerCase().includes(args.search.toLowerCase())
      );
    }

    // Apply pagination
    const start = args.offset || 0;
    const end = start + (args.limit || 20);
    return filtered.slice(start, end);
  }

  private async getProject(id: string, context: GraphQLContext): Promise<any> {
    // Mock implementation
    return {
      id,
      name: 'Main Street Resurfacing',
      description: 'Resurface main thoroughfare',
      status: 'in_progress',
      location: { lat: 40.7128, lng: -74.0060 },
      area: 15000,
      owner: context.user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private async getMeasurements(args: any, context: GraphQLContext): Promise<any[]> {
    // Mock implementation
    return [
      {
        id: '1',
        type: 'roughness',
        value: 2.5,
        unit: 'IRI',
        location: { lat: 40.7128, lng: -74.0060 },
        project: { id: args.projectId },
        measuredBy: context.user,
        createdAt: new Date().toISOString()
      }
    ];
  }

  private async getAnalyses(args: any, context: GraphQLContext): Promise<any[]> {
    // Mock implementation
    return [
      {
        id: '1',
        type: 'crack_detection',
        project: { id: args.projectId },
        results: { defects: [], score: 85.5 },
        confidence: 0.92,
        model: 'CrackDetectionCNN',
        version: '2.1.0',
        createdBy: context.user,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // PHASE 12: Mutation Resolvers
  private async createProject(input: any, context: GraphQLContext): Promise<any> {
    // Mock implementation
    const project = {
      id: this.generateId(),
      ...input,
      owner: context.user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Publish subscription
    this.publishToSubscription('PROJECT_CREATED', project);

    return project;
  }

  private async updateProject(id: string, input: any, context: GraphQLContext): Promise<any> {
    // Mock implementation
    const project = {
      id,
      ...input,
      updatedAt: new Date().toISOString()
    };

    // Publish subscription
    this.publishToSubscription('PROJECT_UPDATED', project);

    return project;
  }

  private async addMeasurement(input: any, context: GraphQLContext): Promise<any> {
    // Mock implementation
    const measurement = {
      id: this.generateId(),
      ...input,
      measuredBy: context.user,
      createdAt: new Date().toISOString()
    };

    // Publish subscription
    this.publishToSubscription('MEASUREMENT_ADDED', measurement);

    return measurement;
  }

  private async runAnalysis(projectId: string, type: string, context: GraphQLContext): Promise<any> {
    // Mock implementation
    const analysis = {
      id: this.generateId(),
      type,
      project: { id: projectId },
      results: { status: 'processing' },
      confidence: 0,
      model: 'MockAnalysisModel',
      version: '1.0.0',
      createdBy: context.user,
      createdAt: new Date().toISOString()
    };

    // Simulate async processing
    setTimeout(() => {
      analysis.results = { status: 'completed', score: 87.3 };
      analysis.confidence = 0.89;
      this.publishToSubscription('ANALYSIS_COMPLETED', analysis);
    }, 5000);

    return analysis;
  }

  // PHASE 12: Subscription Management
  private async subscribeToProject(projectId: string, context: GraphQLContext): Promise<any> {
    const subscriptionKey = `PROJECT_UPDATED:${projectId}`;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
    }
    
    this.subscriptions.get(subscriptionKey)!.add(context);
    
    return {
      subscribe: () => ({
        [Symbol.asyncIterator]: async function* () {
          // Mock async iterator
          yield { projectUpdated: { id: projectId, status: 'updated' } };
        }
      })
    };
  }

  private async subscribeToMeasurements(projectId: string, context: GraphQLContext): Promise<any> {
    const subscriptionKey = `MEASUREMENT_ADDED:${projectId}`;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
    }
    
    this.subscriptions.get(subscriptionKey)!.add(context);
    
    return {
      subscribe: () => ({
        [Symbol.asyncIterator]: async function* () {
          // Mock async iterator
          yield { measurementAdded: { id: '123', projectId, type: 'roughness' } };
        }
      })
    };
  }

  private async subscribeToAnalyses(projectId: string | undefined, context: GraphQLContext): Promise<any> {
    const subscriptionKey = projectId ? `ANALYSIS_COMPLETED:${projectId}` : 'ANALYSIS_COMPLETED:*';
    
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
    }
    
    this.subscriptions.get(subscriptionKey)!.add(context);
    
    return {
      subscribe: () => ({
        [Symbol.asyncIterator]: async function* () {
          // Mock async iterator
          yield { analysisCompleted: { id: '456', projectId, type: 'crack_detection' } };
        }
      })
    };
  }

  private publishToSubscription(event: string, data: any): void {
    // Find all relevant subscriptions
    for (const [key, subscribers] of this.subscriptions) {
      if (key.startsWith(event) || key.endsWith('*')) {
        subscribers.forEach(subscriber => {
          // In a real implementation, this would send data to the subscriber
          console.log(`📡 Publishing ${event} to subscription ${key}`);
        });
      }
    }
  }

  // PHASE 12: Rate Limiting
  private applyRateLimit(context: GraphQLContext, args: any): boolean {
    const key = `${context.user?.id || 'anonymous'}:${context.request.operationName}`;
    const now = Date.now();
    
    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, { requests: [], window: args.window });
    }
    
    const limit = this.rateLimits.get(key);
    
    // Remove expired requests
    limit.requests = limit.requests.filter((time: number) => now - time < args.window);
    
    // Check if limit exceeded
    if (limit.requests.length >= args.max) {
      this.metrics.rateLimitHits++;
      throw new Error('Rate limit exceeded');
    }
    
    // Add current request
    limit.requests.push(now);
    
    return true;
  }

  // PHASE 12: API Management
  private async initializeAPIManagement(): Promise<void> {
    // Setup API endpoints
    await this.setupRESTEndpoints();
    
    // Initialize API keys
    await this.initializeAPIKeys();
    
    console.log('🔑 API Management initialized');
  }

  private async setupRESTEndpoints(): Promise<void> {
    const endpoints: APIEndpoint[] = [
      {
        id: 'projects-list',
        name: 'List Projects',
        path: '/api/v1/projects',
        method: 'GET',
        description: 'Get a list of projects',
        version: '1.0',
        isPublic: false,
        permissions: ['projects:read'],
        authentication: 'bearer',
        responseFormat: 'json',
        documentation: 'Returns a paginated list of projects accessible to the authenticated user.',
        examples: [
          {
            name: 'Basic Request',
            description: 'Get first 20 projects',
            request: { query: { limit: 20, offset: 0 } },
            response: { data: [], total: 0, hasMore: false },
            httpStatus: 200
          }
        ]
      },
      {
        id: 'projects-create',
        name: 'Create Project',
        path: '/api/v1/projects',
        method: 'POST',
        description: 'Create a new project',
        version: '1.0',
        isPublic: false,
        permissions: ['projects:create'],
        authentication: 'bearer',
        responseFormat: 'json',
        documentation: 'Creates a new project and returns the created project data.',
        examples: [
          {
            name: 'Create Project',
            description: 'Create a new pavement project',
            request: {
              body: {
                name: 'New Project',
                description: 'Project description',
                location: { lat: 40.7128, lng: -74.0060 },
                area: 10000
              }
            },
            response: { id: '123', name: 'New Project', status: 'planning' },
            httpStatus: 201
          }
        ]
      }
    ];

    console.log(`🛠️ Setup ${endpoints.length} REST API endpoints`);
  }

  private async initializeAPIKeys(): Promise<void> {
    // Initialize with sample API key for demonstration
    const sampleKey: APIKey = {
      id: 'key_sample_123',
      name: 'Sample API Key',
      key: 'pk_live_' + Math.random().toString(36).substr(2, 32),
      tenantId: 'tenant_demo_456',
      userId: 'user_123',
      permissions: ['projects:read', 'measurements:read'],
      isActive: true,
      usage: {
        requests: 0,
        errors: 0,
        rateLimitHits: 0,
        lastReset: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    this.apiKeys.set(sampleKey.key, sampleKey);
    console.log(`🔑 Initialized API key management with ${this.apiKeys.size} keys`);
  }

  // PHASE 12: API Key Management
  async createAPIKey(
    tenantId: string,
    userId: string,
    name: string,
    permissions: string[],
    options?: { expiresAt?: string; rateLimit?: RateLimit }
  ): Promise<APIKey> {
    const apiKey: APIKey = {
      id: this.generateId(),
      name,
      key: 'pk_live_' + Math.random().toString(36).substr(2, 32),
      tenantId,
      userId,
      permissions,
      isActive: true,
      expiresAt: options?.expiresAt,
      rateLimit: options?.rateLimit,
      usage: {
        requests: 0,
        errors: 0,
        rateLimitHits: 0,
        lastReset: new Date().toISOString()
      },
      createdAt: new Date().toISOString()
    };

    this.apiKeys.set(apiKey.key, apiKey);
    console.log(`🔑 Created API key: ${name} for tenant ${tenantId}`);
    
    return apiKey;
  }

  async validateAPIKey(key: string): Promise<APIKey | null> {
    const apiKey = this.apiKeys.get(key);
    
    if (!apiKey || !apiKey.isActive) {
      return null;
    }
    
    // Check expiration
    if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
      return null;
    }
    
    // Update usage
    apiKey.usage.requests++;
    apiKey.lastUsed = new Date().toISOString();
    
    return apiKey;
  }

  // PHASE 12: Metrics and Analytics
  updateMetrics(operation: string, duration: number, isError: boolean = false): void {
    this.metrics.totalQueries++;
    
    if (operation.includes('mutation')) {
      this.metrics.totalMutations++;
    } else if (operation.includes('subscription')) {
      this.metrics.totalSubscriptions++;
    }
    
    if (isError) {
      this.metrics.totalErrors++;
    }
    
    // Update average response time
    const totalRequests = this.metrics.totalQueries + this.metrics.totalMutations;
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime * (totalRequests - 1) + duration) / totalRequests;
    
    // Update top queries
    const existingQuery = this.metrics.topQueries.find(q => q.query === operation);
    if (existingQuery) {
      existingQuery.count++;
      existingQuery.averageTime = (existingQuery.averageTime + duration) / 2;
      if (isError) {
        existingQuery.errorRate = (existingQuery.errorRate + 1) / existingQuery.count;
      }
    } else {
      this.metrics.topQueries.push({
        query: operation,
        count: 1,
        averageTime: duration,
        errorRate: isError ? 1 : 0
      });
    }
    
    // Keep only top 10 queries
    this.metrics.topQueries.sort((a, b) => b.count - a.count);
    this.metrics.topQueries = this.metrics.topQueries.slice(0, 10);
  }

  // PHASE 12: Utility Methods
  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // PHASE 12: Public API Methods
  getSchema(): GraphQLSchema | null {
    return this.schema;
  }

  getMetrics(): APIMetrics {
    return { ...this.metrics };
  }

  getAPIKeys(tenantId: string): APIKey[] {
    return Array.from(this.apiKeys.values()).filter(key => key.tenantId === tenantId);
  }

  async revokeAPIKey(keyId: string): Promise<boolean> {
    for (const [key, apiKey] of this.apiKeys) {
      if (apiKey.id === keyId) {
        apiKey.isActive = false;
        console.log(`🔑 Revoked API key: ${apiKey.name}`);
        return true;
      }
    }
    return false;
  }

  // PHASE 12: GraphQL Execution
  async executeQuery(
    query: string,
    variables: any = {},
    context: Partial<GraphQLContext> = {}
  ): Promise<any> {
    const startTime = Date.now();
    let isError = false;
    
    try {
      // Mock GraphQL execution
      const result = {
        data: { mock: 'This would be the actual GraphQL execution result' },
        errors: []
      };
      
      return result;
    } catch (error) {
      isError = true;
      throw error;
    } finally {
      const duration = Date.now() - startTime;
      this.updateMetrics(query, duration, isError);
    }
  }

  // PHASE 12: Cleanup
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up GraphQL Service...');
    
    this.resolvers.clear();
    this.subscriptions.clear();
    this.rateLimits.clear();
    this.apiKeys.clear();
    
    console.log('✅ GraphQL Service cleanup completed');
  }
}

// PHASE 12: Export singleton instance
export const graphqlService = new GraphQLService();
export default graphqlService;