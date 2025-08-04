import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ScrollArea } from '../ui/scroll-area';
import {
  Globe,
  Link,
  Zap,
  Activity,
  Users,
  MessageSquare,
  Cloud,
  Database,
  Code,
  Webhook,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  BarChart3,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  Monitor,
  Wifi,
  WifiOff,
  Lock,
  Key,
} from 'lucide-react';

// Connectivity Interfaces
interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  version: string;
  status: 'active' | 'deprecated' | 'beta' | 'maintenance';
  authentication: 'none' | 'api_key' | 'oauth' | 'jwt';
  rateLimit: {
    requests: number;
    window: string;
  };
  usage: {
    totalRequests: number;
    successRate: number;
    avgResponseTime: number;
    lastUsed?: Date;
  };
  schema: {
    request?: any;
    response?: any;
  };
}

interface Integration {
  id: string;
  name: string;
  provider: string;
  category: 'accounting' | 'crm' | 'project_management' | 'communication' | 'analytics' | 'storage' | 'maps';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  config: Record<string, any>;
  features: string[];
  lastSync?: Date;
  syncFrequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'manual';
  dataFlow: 'bidirectional' | 'inbound' | 'outbound';
  webhooks: Webhook[];
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  status: 'active' | 'inactive' | 'failed';
  lastTriggered?: Date;
  deliveryAttempts: number;
  successRate: number;
}

interface RealtimeConnection {
  id: string;
  userId: string;
  type: 'websocket' | 'sse' | 'webrtc';
  status: 'connected' | 'disconnected' | 'reconnecting';
  connectedAt: Date;
  lastActivity: Date;
  channels: string[];
  metadata: Record<string, any>;
}

interface CollaborationSession {
  id: string;
  name: string;
  type: 'document' | 'project' | 'meeting' | 'design';
  participants: {
    userId: string;
    name: string;
    role: string;
    joinedAt: Date;
    cursor?: { x: number; y: number };
    isActive: boolean;
  }[];
  document?: {
    id: string;
    version: number;
    content: any;
    lastModified: Date;
  };
  createdAt: Date;
  lastActivity: Date;
  status: 'active' | 'paused' | 'ended';
}

interface DataSyncJob {
  id: string;
  integrationId: string;
  type: 'full' | 'incremental' | 'delta';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  recordsProcessed: number;
  recordsTotal: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  details: {
    source: string;
    destination: string;
    filters?: Record<string, any>;
    mapping?: Record<string, string>;
  };
}

// Connectivity Hub Engine
class ConnectivityHubEngine {
  private apiEndpoints: Map<string, APIEndpoint> = new Map();
  private integrations: Map<string, Integration> = new Map();
  private realtimeConnections: Map<string, RealtimeConnection> = new Map();
  private collaborationSessions: Map<string, CollaborationSession> = new Map();
  private syncJobs: Map<string, DataSyncJob> = new Map();
  private websockets: Map<string, WebSocket> = new Map();

  constructor() {
    this.initializeEngine();
  }

  private initializeEngine() {
    this.setupAPIEndpoints();
    this.setupIntegrations();
    this.startRealtimeServices();
  }

  private setupAPIEndpoints() {
    const endpoints: APIEndpoint[] = [
      {
        id: 'projects_list',
        name: 'List Projects',
        method: 'GET',
        path: '/api/v1/projects',
        description: 'Retrieve all projects with optional filtering',
        version: '1.2.0',
        status: 'active',
        authentication: 'jwt',
        rateLimit: { requests: 1000, window: '1h' },
        usage: {
          totalRequests: 15420,
          successRate: 99.2,
          avgResponseTime: 45,
          lastUsed: new Date(),
        },
        schema: {
          request: { query: { status: 'string', limit: 'number' } },
          response: { projects: 'array', total: 'number', page: 'number' },
        },
      },
      {
        id: 'projects_create',
        name: 'Create Project',
        method: 'POST',
        path: '/api/v1/projects',
        description: 'Create a new project',
        version: '1.2.0',
        status: 'active',
        authentication: 'jwt',
        rateLimit: { requests: 100, window: '1h' },
        usage: {
          totalRequests: 892,
          successRate: 97.8,
          avgResponseTime: 125,
          lastUsed: new Date(Date.now() - 3600000),
        },
        schema: {
          request: { name: 'string', description: 'string', budget: 'number' },
          response: { id: 'string', status: 'string', createdAt: 'date' },
        },
      },
      {
        id: 'analytics_data',
        name: 'Analytics Data',
        method: 'GET',
        path: '/api/v1/analytics',
        description: 'Retrieve analytics and reporting data',
        version: '2.0.0',
        status: 'beta',
        authentication: 'api_key',
        rateLimit: { requests: 500, window: '1h' },
        usage: {
          totalRequests: 3240,
          successRate: 98.5,
          avgResponseTime: 78,
          lastUsed: new Date(Date.now() - 1800000),
        },
        schema: {
          request: { dateRange: 'object', metrics: 'array' },
          response: { data: 'array', summary: 'object' },
        },
      },
    ];

    endpoints.forEach(endpoint => {
      this.apiEndpoints.set(endpoint.id, endpoint);
    });
  }

  private setupIntegrations() {
    const integrations: Integration[] = [
      {
        id: 'quickbooks_integration',
        name: 'QuickBooks Online',
        provider: 'Intuit',
        category: 'accounting',
        status: 'connected',
        config: {
          companyId: 'comp_123456',
          sandbox: false,
          syncAccounts: true,
          syncInvoices: true,
        },
        features: ['Sync Invoices', 'Expense Tracking', 'Financial Reporting'],
        lastSync: new Date(Date.now() - 1800000),
        syncFrequency: 'daily',
        dataFlow: 'bidirectional',
        webhooks: [
          {
            id: 'qb_invoice_webhook',
            name: 'Invoice Updates',
            url: 'https://api.pavemaster.com/webhooks/quickbooks/invoices',
            events: ['invoice.created', 'invoice.updated', 'invoice.paid'],
            status: 'active',
            lastTriggered: new Date(Date.now() - 3600000),
            deliveryAttempts: 1247,
            successRate: 99.1,
          },
        ],
      },
      {
        id: 'salesforce_integration',
        name: 'Salesforce CRM',
        provider: 'Salesforce',
        category: 'crm',
        status: 'connected',
        config: {
          instanceUrl: 'https://company.salesforce.com',
          apiVersion: '58.0',
          syncContacts: true,
          syncOpportunities: true,
        },
        features: ['Lead Management', 'Opportunity Tracking', 'Contact Sync'],
        lastSync: new Date(Date.now() - 900000),
        syncFrequency: 'hourly',
        dataFlow: 'bidirectional',
        webhooks: [
          {
            id: 'sf_opportunity_webhook',
            name: 'Opportunity Updates',
            url: 'https://api.pavemaster.com/webhooks/salesforce/opportunities',
            events: ['opportunity.created', 'opportunity.updated', 'opportunity.closed'],
            status: 'active',
            lastTriggered: new Date(Date.now() - 1800000),
            deliveryAttempts: 2156,
            successRate: 98.7,
          },
        ],
      },
      {
        id: 'slack_integration',
        name: 'Slack Workspace',
        provider: 'Slack',
        category: 'communication',
        status: 'connected',
        config: {
          workspaceId: 'T123456789',
          botToken: 'xoxb-***',
          defaultChannel: '#general',
          notificationChannels: ['#projects', '#alerts'],
        },
        features: ['Project Notifications', 'Status Updates', 'Team Communication'],
        lastSync: new Date(),
        syncFrequency: 'real_time',
        dataFlow: 'outbound',
        webhooks: [],
      },
      {
        id: 'google_drive_integration',
        name: 'Google Drive',
        provider: 'Google',
        category: 'storage',
        status: 'error',
        config: {
          folderId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          autoSync: true,
          fileTypes: ['pdf', 'docx', 'xlsx', 'jpg', 'png'],
        },
        features: ['Document Storage', 'File Sync', 'Shared Access'],
        lastSync: new Date(Date.now() - 86400000),
        syncFrequency: 'hourly',
        dataFlow: 'bidirectional',
        webhooks: [],
      },
    ];

    integrations.forEach(integration => {
      this.integrations.set(integration.id, integration);
    });
  }

  private startRealtimeServices() {
    // Simulate WebSocket connections
    const connections: RealtimeConnection[] = [
      {
        id: 'ws_user_001',
        userId: 'user_001',
        type: 'websocket',
        status: 'connected',
        connectedAt: new Date(Date.now() - 3600000),
        lastActivity: new Date(),
        channels: ['projects', 'notifications', 'chat'],
        metadata: { browser: 'Chrome', location: 'US-East' },
      },
      {
        id: 'ws_user_002',
        userId: 'user_002',
        type: 'websocket',
        status: 'connected',
        connectedAt: new Date(Date.now() - 1800000),
        lastActivity: new Date(Date.now() - 300000),
        channels: ['projects', 'equipment'],
        metadata: { browser: 'Firefox', location: 'US-West' },
      },
    ];

    connections.forEach(connection => {
      this.realtimeConnections.set(connection.id, connection);
    });
  }

  async createAPIEndpoint(endpoint: Omit<APIEndpoint, 'id' | 'usage'>): Promise<APIEndpoint> {
    const newEndpoint: APIEndpoint = {
      ...endpoint,
      id: `endpoint_${Date.now()}`,
      usage: {
        totalRequests: 0,
        successRate: 100,
        avgResponseTime: 0,
      },
    };

    this.apiEndpoints.set(newEndpoint.id, newEndpoint);
    return newEndpoint;
  }

  async testAPIEndpoint(endpointId: string): Promise<{ success: boolean; responseTime: number; error?: string }> {
    const endpoint = this.apiEndpoints.get(endpointId);
    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    const success = Math.random() > 0.1; // 90% success rate
    const responseTime = 50 + Math.random() * 200;

    // Update usage statistics
    endpoint.usage.totalRequests++;
    endpoint.usage.avgResponseTime = 
      (endpoint.usage.avgResponseTime * (endpoint.usage.totalRequests - 1) + responseTime) / 
      endpoint.usage.totalRequests;
    
    if (success) {
      endpoint.usage.successRate = 
        (endpoint.usage.successRate * (endpoint.usage.totalRequests - 1) + 100) / 
        endpoint.usage.totalRequests;
    } else {
      endpoint.usage.successRate = 
        (endpoint.usage.successRate * (endpoint.usage.totalRequests - 1)) / 
        endpoint.usage.totalRequests;
    }

    endpoint.usage.lastUsed = new Date();

    return {
      success,
      responseTime,
      error: success ? undefined : 'Connection timeout',
    };
  }

  async setupIntegration(integrationConfig: Omit<Integration, 'id' | 'lastSync'>): Promise<Integration> {
    const integration: Integration = {
      ...integrationConfig,
      id: `integration_${Date.now()}`,
      lastSync: new Date(),
    };

    this.integrations.set(integration.id, integration);
    return integration;
  }

  async testIntegration(integrationId: string): Promise<{ success: boolean; message: string }> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    // Simulate integration test
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const success = Math.random() > 0.2; // 80% success rate
    
    integration.status = success ? 'connected' : 'error';
    if (success) {
      integration.lastSync = new Date();
    }

    return {
      success,
      message: success ? 'Integration test successful' : 'Authentication failed',
    };
  }

  async startSyncJob(integrationId: string, type: 'full' | 'incremental' = 'incremental'): Promise<DataSyncJob> {
    const integration = this.integrations.get(integrationId);
    if (!integration) {
      throw new Error('Integration not found');
    }

    const job: DataSyncJob = {
      id: `sync_${Date.now()}`,
      integrationId,
      type,
      status: 'pending',
      progress: 0,
      recordsProcessed: 0,
      recordsTotal: type === 'full' ? 1000 + Math.random() * 5000 : 50 + Math.random() * 200,
      details: {
        source: integration.name,
        destination: 'PaveMaster Database',
      },
    };

    this.syncJobs.set(job.id, job);
    
    // Simulate job execution
    this.simulateSyncJob(job);
    
    return job;
  }

  private async simulateSyncJob(job: DataSyncJob) {
    job.status = 'running';
    job.startedAt = new Date();

    const totalTime = 5000 + Math.random() * 10000; // 5-15 seconds
    const interval = setInterval(() => {
      job.progress += 5 + Math.random() * 15;
      job.recordsProcessed = Math.floor((job.progress / 100) * job.recordsTotal);

      if (job.progress >= 100) {
        job.progress = 100;
        job.recordsProcessed = job.recordsTotal;
        job.status = Math.random() > 0.1 ? 'completed' : 'failed';
        job.completedAt = new Date();
        
        if (job.status === 'failed') {
          job.error = 'Network timeout during sync operation';
        } else {
          const integration = this.integrations.get(job.integrationId);
          if (integration) {
            integration.lastSync = new Date();
          }
        }
        
        clearInterval(interval);
      }
    }, 500);
  }

  async createCollaborationSession(name: string, type: CollaborationSession['type']): Promise<CollaborationSession> {
    const session: CollaborationSession = {
      id: `session_${Date.now()}`,
      name,
      type,
      participants: [],
      createdAt: new Date(),
      lastActivity: new Date(),
      status: 'active',
    };

    this.collaborationSessions.set(session.id, session);
    return session;
  }

  async joinCollaborationSession(sessionId: string, user: { userId: string; name: string; role: string }): Promise<void> {
    const session = this.collaborationSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const participant = {
      ...user,
      joinedAt: new Date(),
      isActive: true,
    };

    session.participants.push(participant);
    session.lastActivity = new Date();
  }

  getAPIAnalytics(): any {
    const endpoints = Array.from(this.apiEndpoints.values());
    
    return {
      totalEndpoints: endpoints.length,
      totalRequests: endpoints.reduce((sum, ep) => sum + ep.usage.totalRequests, 0),
      averageResponseTime: endpoints.reduce((sum, ep) => sum + ep.usage.avgResponseTime, 0) / endpoints.length,
      overallSuccessRate: endpoints.reduce((sum, ep) => sum + ep.usage.successRate, 0) / endpoints.length,
      byStatus: this.groupBy(endpoints, 'status'),
      byMethod: this.groupBy(endpoints, 'method'),
      topEndpoints: endpoints.sort((a, b) => b.usage.totalRequests - a.usage.totalRequests).slice(0, 5),
    };
  }

  getIntegrationAnalytics(): any {
    const integrations = Array.from(this.integrations.values());
    
    return {
      totalIntegrations: integrations.length,
      connectedIntegrations: integrations.filter(i => i.status === 'connected').length,
      byCategory: this.groupBy(integrations, 'category'),
      byStatus: this.groupBy(integrations, 'status'),
      recentSyncs: integrations
        .filter(i => i.lastSync)
        .sort((a, b) => b.lastSync!.getTime() - a.lastSync!.getTime())
        .slice(0, 5),
    };
  }

  getRealtimeAnalytics(): any {
    const connections = Array.from(this.realtimeConnections.values());
    const sessions = Array.from(this.collaborationSessions.values());
    
    return {
      activeConnections: connections.filter(c => c.status === 'connected').length,
      totalConnections: connections.length,
      activeSessions: sessions.filter(s => s.status === 'active').length,
      totalParticipants: sessions.reduce((sum, s) => sum + s.participants.length, 0),
      connectionTypes: this.groupBy(connections, 'type'),
      sessionTypes: this.groupBy(sessions, 'type'),
    };
  }

  private groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = (groups[value] || 0) + 1;
      return groups;
    }, {});
  }
}

export const ConnectivityHub: React.FC = () => {
  const [engine] = useState(() => new ConnectivityHubEngine());
  const [activeTab, setActiveTab] = useState('api');
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncJobs, setSyncJobs] = useState<DataSyncJob[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isTestingEndpoint, setIsTestingEndpoint] = useState(false);
  const [isTestingIntegration, setIsTestingIntegration] = useState(false);
  const [apiAnalytics, setApiAnalytics] = useState<any>(null);
  const [integrationAnalytics, setIntegrationAnalytics] = useState<any>(null);
  const [realtimeAnalytics, setRealtimeAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    setApiEndpoints(Array.from(engine['apiEndpoints'].values()));
    setIntegrations(Array.from(engine['integrations'].values()));
    setSyncJobs(Array.from(engine['syncJobs'].values()));
    setApiAnalytics(engine.getAPIAnalytics());
    setIntegrationAnalytics(engine.getIntegrationAnalytics());
    setRealtimeAnalytics(engine.getRealtimeAnalytics());
  };

  const handleTestEndpoint = async (endpointId: string) => {
    setIsTestingEndpoint(true);
    try {
      const result = await engine.testAPIEndpoint(endpointId);
      loadData(); // Refresh data to show updated statistics
      
      // Show result notification (in a real app, this would be a toast)
      console.log('Endpoint test result:', result);
    } catch (error) {
      console.error('Endpoint test failed:', error);
    } finally {
      setIsTestingEndpoint(false);
    }
  };

  const handleTestIntegration = async (integrationId: string) => {
    setIsTestingIntegration(true);
    try {
      const result = await engine.testIntegration(integrationId);
      loadData(); // Refresh data
      console.log('Integration test result:', result);
    } catch (error) {
      console.error('Integration test failed:', error);
    } finally {
      setIsTestingIntegration(false);
    }
  };

  const handleStartSync = async (integrationId: string) => {
    try {
      await engine.startSyncJob(integrationId);
      loadData();
    } catch (error) {
      console.error('Failed to start sync:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'completed':
        return 'default';
      case 'error':
      case 'failed':
        return 'destructive';
      case 'pending':
      case 'running':
        return 'secondary';
      case 'beta':
      case 'disconnected':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'default';
      case 'POST': return 'secondary';
      case 'PUT': return 'outline';
      case 'DELETE': return 'destructive';
      case 'PATCH': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-blue-600" />
              <CardTitle>Connectivity Hub</CardTitle>
              <Badge variant="secondary">Phase 3</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">
                <Wifi className="h-3 w-3 mr-1" />
                {realtimeAnalytics?.activeConnections || 0} Active
              </Badge>
              <Badge variant="outline">
                <Link className="h-3 w-3 mr-1" />
                {integrationAnalytics?.connectedIntegrations || 0} Connected
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="api">
                <Code className="h-4 w-4 mr-2" />
                API Gateway
              </TabsTrigger>
              <TabsTrigger value="integrations">
                <Link className="h-4 w-4 mr-2" />
                Integrations
              </TabsTrigger>
              <TabsTrigger value="realtime">
                <Activity className="h-4 w-4 mr-2" />
                Real-time
              </TabsTrigger>
              <TabsTrigger value="sync">
                <RefreshCw className="h-4 w-4 mr-2" />
                Data Sync
              </TabsTrigger>
              <TabsTrigger value="analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="api" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">API Endpoints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {apiEndpoints.length > 0 ? (
                        <div className="space-y-3">
                          {apiEndpoints.map((endpoint) => (
                            <div
                              key={endpoint.id}
                              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                              onClick={() => setSelectedEndpoint(endpoint)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Badge variant={getMethodColor(endpoint.method) as any}>
                                    {endpoint.method}
                                  </Badge>
                                  <Badge variant={getStatusColor(endpoint.status) as any}>
                                    {endpoint.status}
                                  </Badge>
                                </div>
                                <span className="text-xs text-gray-500">v{endpoint.version}</span>
                              </div>
                              <h4 className="font-medium text-sm mb-1">{endpoint.name}</h4>
                              <p className="text-xs text-gray-600 mb-2">{endpoint.path}</p>
                              <div className="flex items-center justify-between text-xs">
                                <span>{endpoint.usage.totalRequests.toLocaleString()} requests</span>
                                <span>{Math.round(endpoint.usage.successRate)}% success</span>
                                <span>{Math.round(endpoint.usage.avgResponseTime)}ms avg</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No API endpoints configured
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Endpoint Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedEndpoint ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getMethodColor(selectedEndpoint.method) as any}>
                            {selectedEndpoint.method}
                          </Badge>
                          <Badge variant={getStatusColor(selectedEndpoint.status) as any}>
                            {selectedEndpoint.status}
                          </Badge>
                          <Badge variant="outline">v{selectedEndpoint.version}</Badge>
                        </div>

                        <div>
                          <h4 className="font-semibold">{selectedEndpoint.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{selectedEndpoint.description}</p>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded mt-2 block">
                            {selectedEndpoint.path}
                          </code>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Authentication</Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <Lock className="h-4 w-4" />
                            <span className="text-sm capitalize">{selectedEndpoint.authentication.replace('_', ' ')}</span>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Rate Limit</Label>
                          <p className="text-sm">{selectedEndpoint.rateLimit.requests} requests per {selectedEndpoint.rateLimit.window}</p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Usage Statistics</Label>
                          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Requests:</span>
                              <span>{selectedEndpoint.usage.totalRequests.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Success Rate:</span>
                              <span>{Math.round(selectedEndpoint.usage.successRate)}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Avg Response:</span>
                              <span>{Math.round(selectedEndpoint.usage.avgResponseTime)}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Used:</span>
                              <span>{selectedEndpoint.usage.lastUsed?.toLocaleTimeString() || 'Never'}</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          onClick={() => handleTestEndpoint(selectedEndpoint.id)}
                          disabled={isTestingEndpoint}
                          className="w-full"
                        >
                          {isTestingEndpoint ? (
                            <>
                              <Activity className="h-4 w-4 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Test Endpoint
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select an endpoint to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Active Integrations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      {integrations.length > 0 ? (
                        <div className="space-y-3">
                          {integrations.map((integration) => (
                            <div
                              key={integration.id}
                              className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                              onClick={() => setSelectedIntegration(integration)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Badge variant={getStatusColor(integration.status) as any}>
                                    {integration.status}
                                  </Badge>
                                  <Badge variant="outline">{integration.category}</Badge>
                                </div>
                                <span className="text-xs text-gray-500">{integration.provider}</span>
                              </div>
                              <h4 className="font-medium text-sm mb-1">{integration.name}</h4>
                              <p className="text-xs text-gray-600 mb-2">
                                Sync: {integration.syncFrequency} | Flow: {integration.dataFlow}
                              </p>
                              <div className="flex items-center justify-between text-xs">
                                <span>{integration.features.length} features</span>
                                <span>
                                  Last sync: {integration.lastSync ? 
                                    new Date(integration.lastSync).toLocaleString() : 'Never'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No integrations configured
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Integration Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedIntegration ? (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(selectedIntegration.status) as any}>
                            {selectedIntegration.status}
                          </Badge>
                          <Badge variant="outline">{selectedIntegration.category}</Badge>
                          <Badge variant="secondary">{selectedIntegration.provider}</Badge>
                        </div>

                        <div>
                          <h4 className="font-semibold">{selectedIntegration.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Data Flow: {selectedIntegration.dataFlow} | 
                            Sync: {selectedIntegration.syncFrequency}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Features</Label>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedIntegration.features.map((feature, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Configuration</Label>
                          <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                            <pre>{JSON.stringify(selectedIntegration.config, null, 2)}</pre>
                          </div>
                        </div>

                        {selectedIntegration.webhooks.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Webhooks</Label>
                            <div className="space-y-2 mt-2">
                              {selectedIntegration.webhooks.map((webhook) => (
                                <div key={webhook.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-medium">{webhook.name}</span>
                                    <Badge variant={getStatusColor(webhook.status) as any} className="text-xs">
                                      {webhook.status}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-gray-600">{webhook.url}</p>
                                  <div className="flex items-center justify-between mt-1 text-xs">
                                    <span>{webhook.events.length} events</span>
                                    <span>{Math.round(webhook.successRate)}% success rate</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleTestIntegration(selectedIntegration.id)}
                            disabled={isTestingIntegration}
                            className="flex-1"
                          >
                            {isTestingIntegration ? (
                              <>
                                <Activity className="h-4 w-4 mr-2 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Test
                              </>
                            )}
                          </Button>
                          <Button
                            onClick={() => handleStartSync(selectedIntegration.id)}
                            variant="outline"
                            className="flex-1"
                          >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Sync Now
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        Select an integration to view details
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="realtime" className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Wifi className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{realtimeAnalytics?.activeConnections || 0}</p>
                    <p className="text-sm text-gray-600">Active Connections</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{realtimeAnalytics?.activeSessions || 0}</p>
                    <p className="text-sm text-gray-600">Active Sessions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">{realtimeAnalytics?.totalParticipants || 0}</p>
                    <p className="text-sm text-gray-600">Total Participants</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold">99.8%</p>
                    <p className="text-sm text-gray-600">Uptime</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Real-time Collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">WebSocket Server</span>
                      </div>
                      <Badge variant="default">Online</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Real-time Sync</span>
                      </div>
                      <Badge variant="default">Active</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Document Collaboration</span>
                      </div>
                      <Badge variant="default">Available</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Live Notifications</span>
                      </div>
                      <Badge variant="default">Enabled</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sync" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Synchronization Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {syncJobs.length > 0 ? (
                      <div className="space-y-3">
                        {syncJobs.map((job) => (
                          <div key={job.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant={getStatusColor(job.status) as any}>
                                  {job.status}
                                </Badge>
                                <Badge variant="outline">{job.type}</Badge>
                              </div>
                              <span className="text-xs text-gray-500">
                                {job.startedAt ? job.startedAt.toLocaleTimeString() : 'Not started'}
                              </span>
                            </div>
                            <h4 className="font-medium text-sm mb-1">
                              {job.details.source} → {job.details.destination}
                            </h4>
                            <div className="space-y-2">
                              <Progress value={job.progress} className="w-full" />
                              <div className="flex items-center justify-between text-xs">
                                <span>{job.recordsProcessed.toLocaleString()} / {job.recordsTotal.toLocaleString()} records</span>
                                <span>{Math.round(job.progress)}% complete</span>
                              </div>
                            </div>
                            {job.error && (
                              <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600">
                                {job.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No sync jobs running
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {apiAnalytics && integrationAnalytics && realtimeAnalytics ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Code className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{apiAnalytics.totalEndpoints}</p>
                        <p className="text-sm text-gray-600">API Endpoints</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Link className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{integrationAnalytics.totalIntegrations}</p>
                        <p className="text-sm text-gray-600">Integrations</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{Math.round(apiAnalytics.overallSuccessRate)}%</p>
                        <p className="text-sm text-gray-600">Success Rate</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold">{Math.round(apiAnalytics.averageResponseTime)}ms</p>
                        <p className="text-sm text-gray-600">Avg Response</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">API Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Total Requests</Label>
                            <p className="text-2xl font-bold">{apiAnalytics.totalRequests.toLocaleString()}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">Top Endpoints</Label>
                            <div className="space-y-2 mt-2">
                              {apiAnalytics.topEndpoints.map((endpoint: any, index: number) => (
                                <div key={endpoint.id} className="flex items-center justify-between text-sm">
                                  <span>{endpoint.name}</span>
                                  <span>{endpoint.usage.totalRequests.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Integration Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium">Connected Integrations</Label>
                            <p className="text-2xl font-bold">{integrationAnalytics.connectedIntegrations}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium">By Category</Label>
                            <div className="space-y-2 mt-2">
                              {Object.entries(integrationAnalytics.byCategory).map(([category, count]) => (
                                <div key={category} className="flex items-center justify-between text-sm">
                                  <span className="capitalize">{category.replace('_', ' ')}</span>
                                  <span>{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Loading analytics data...</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export { ConnectivityHubEngine };
export type { APIEndpoint, Integration, RealtimeConnection, CollaborationSession, DataSyncJob };