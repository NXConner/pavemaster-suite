import React, { useState, useEffect, useRef } from 'react';
import { 
  Plug, Database, Cloud, Server, Zap, Settings, CheckCircle, 
  XCircle, AlertTriangle, RefreshCw, Download, Upload, Link,
  DollarSign, Calendar, Users, Building, Truck, Camera,
  Shield, Lock, Key, Globe, Wifi, Radio, Satellite
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Integration {
  id: string;
  name: string;
  type: 'payroll' | 'accounting' | 'erp' | 'crm' | 'iot' | 'security' | 'communication' | 'weather' | 'mapping';
  status: 'connected' | 'disconnected' | 'error' | 'syncing' | 'pending';
  provider: string;
  version: string;
  last_sync: string;
  sync_frequency: string;
  data_points: number;
  error_count: number;
  uptime: number;
  description: string;
  api_endpoint?: string;
  auth_type: 'oauth' | 'api_key' | 'basic' | 'certificate';
  features: string[];
}

interface SyncJob {
  id: string;
  integration_id: string;
  status: 'running' | 'completed' | 'failed' | 'queued';
  started_at: string;
  completed_at?: string;
  records_processed: number;
  records_total: number;
  error_message?: string;
}

interface APIEndpoint {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  auth_required: boolean;
  rate_limit: number;
  last_called: string;
  success_rate: number;
  avg_response_time: number;
}

const EnterpriseIntegrations: React.FC = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(300); // 5 minutes
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [systemHealth, setSystemHealth] = useState({
    overall_health: 95,
    active_connections: 12,
    failed_connections: 1,
    sync_success_rate: 97.3,
    avg_response_time: 245
  });

  const syncInterval_ref = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }
      
      setUserRole(data?.role);
    };

    checkUserRole();
  }, [user]);

  useEffect(() => {
    if (userRole && ['super_admin', 'admin'].includes(userRole)) {
      loadIntegrations();
      loadSyncJobs();
      loadApiEndpoints();
      
      if (autoSync) {
        startAutoSync();
      }
    }

    return () => {
      if (syncInterval_ref.current) {
        clearInterval(syncInterval_ref.current);
      }
    };
  }, [userRole, autoSync, syncInterval]);

  const loadIntegrations = async () => {
    const integrationsData: Integration[] = [
      {
        id: 'payroll_adp',
        name: 'ADP Workforce Now',
        type: 'payroll',
        status: 'connected',
        provider: 'ADP',
        version: '2.1.0',
        last_sync: new Date().toISOString(),
        sync_frequency: 'Daily',
        data_points: 15420,
        error_count: 2,
        uptime: 99.2,
        description: 'Automated payroll processing and employee data synchronization',
        api_endpoint: 'https://api.adp.com/hr/v2/',
        auth_type: 'oauth',
        features: ['Employee Data', 'Payroll Processing', 'Time Tracking', 'Benefits']
      },
      {
        id: 'accounting_qb',
        name: 'QuickBooks Enterprise',
        type: 'accounting',
        status: 'connected',
        provider: 'Intuit',
        version: '3.0.2',
        last_sync: new Date().toISOString(),
        sync_frequency: 'Hourly',
        data_points: 8934,
        error_count: 0,
        uptime: 99.8,
        description: 'Financial data synchronization and expense management',
        api_endpoint: 'https://api.quickbooks.com/v3/',
        auth_type: 'oauth',
        features: ['Invoicing', 'Expense Tracking', 'Financial Reporting', 'Tax Management']
      },
      {
        id: 'iot_sensors',
        name: 'Equipment IoT Network',
        type: 'iot',
        status: 'syncing',
        provider: 'Industrial IoT Corp',
        version: '1.5.1',
        last_sync: new Date().toISOString(),
        sync_frequency: 'Real-time',
        data_points: 45678,
        error_count: 15,
        uptime: 96.5,
        description: 'Real-time equipment monitoring and predictive maintenance',
        api_endpoint: 'https://iot.industrial.com/api/v1/',
        auth_type: 'api_key',
        features: ['Temperature Monitoring', 'Vibration Analysis', 'Fuel Levels', 'Maintenance Alerts']
      },
      {
        id: 'security_system',
        name: 'Enterprise Security Hub',
        type: 'security',
        status: 'connected',
        provider: 'SecureWatch Pro',
        version: '4.2.1',
        last_sync: new Date().toISOString(),
        sync_frequency: 'Real-time',
        data_points: 23456,
        error_count: 3,
        uptime: 99.9,
        description: 'Integrated security monitoring and access control',
        api_endpoint: 'https://api.securewatch.com/v4/',
        auth_type: 'certificate',
        features: ['Access Control', 'Video Surveillance', 'Intrusion Detection', 'Incident Reporting']
      },
      {
        id: 'weather_api',
        name: 'Professional Weather Service',
        type: 'weather',
        status: 'connected',
        provider: 'WeatherTech Solutions',
        version: '2.3.0',
        last_sync: new Date().toISOString(),
        sync_frequency: 'Every 15 minutes',
        data_points: 1234,
        error_count: 1,
        uptime: 99.5,
        description: 'Comprehensive weather data for operational planning',
        api_endpoint: 'https://api.weathertech.com/v2/',
        auth_type: 'api_key',
        features: ['Current Conditions', 'Forecasting', 'Severe Weather Alerts', 'Historical Data']
      },
      {
        id: 'fleet_management',
        name: 'Fleet Tracking Pro',
        type: 'iot',
        status: 'error',
        provider: 'FleetOps',
        version: '3.1.2',
        last_sync: new Date(Date.now() - 3600000).toISOString(),
        sync_frequency: 'Real-time',
        data_points: 8765,
        error_count: 23,
        uptime: 92.1,
        description: 'Vehicle tracking and fleet management integration',
        api_endpoint: 'https://api.fleetops.com/v3/',
        auth_type: 'oauth',
        features: ['GPS Tracking', 'Fuel Monitoring', 'Driver Behavior', 'Maintenance Scheduling']
      },
      {
        id: 'communication_teams',
        name: 'Microsoft Teams Integration',
        type: 'communication',
        status: 'connected',
        provider: 'Microsoft',
        version: '1.6.0',
        last_sync: new Date().toISOString(),
        sync_frequency: 'Real-time',
        data_points: 5432,
        error_count: 1,
        uptime: 99.7,
        description: 'Team collaboration and communication integration',
        api_endpoint: 'https://graph.microsoft.com/v1.0/',
        auth_type: 'oauth',
        features: ['Chat Integration', 'Meeting Scheduling', 'File Sharing', 'Notifications']
      },
      {
        id: 'erp_sap',
        name: 'SAP Business One',
        type: 'erp',
        status: 'pending',
        provider: 'SAP',
        version: '10.0',
        last_sync: '',
        sync_frequency: 'Daily',
        data_points: 0,
        error_count: 0,
        uptime: 0,
        description: 'Enterprise resource planning integration',
        api_endpoint: 'https://api.sap.com/business-one/v1/',
        auth_type: 'oauth',
        features: ['Resource Planning', 'Supply Chain', 'Financial Management', 'Analytics']
      }
    ];

    setIntegrations(integrationsData);
  };

  const loadSyncJobs = async () => {
    const syncJobsData: SyncJob[] = [
      {
        id: 'sync_001',
        integration_id: 'payroll_adp',
        status: 'completed',
        started_at: new Date(Date.now() - 1800000).toISOString(),
        completed_at: new Date(Date.now() - 1200000).toISOString(),
        records_processed: 145,
        records_total: 145
      },
      {
        id: 'sync_002',
        integration_id: 'iot_sensors',
        status: 'running',
        started_at: new Date(Date.now() - 300000).toISOString(),
        records_processed: 8234,
        records_total: 12000
      },
      {
        id: 'sync_003',
        integration_id: 'fleet_management',
        status: 'failed',
        started_at: new Date(Date.now() - 900000).toISOString(),
        completed_at: new Date(Date.now() - 600000).toISOString(),
        records_processed: 45,
        records_total: 120,
        error_message: 'Authentication failed - API key expired'
      }
    ];

    setSyncJobs(syncJobsData);
  };

  const loadApiEndpoints = async () => {
    const apiData: APIEndpoint[] = [
      {
        id: 'endpoint_001',
        name: 'Employee Data Sync',
        url: '/api/v1/employees/sync',
        method: 'POST',
        auth_required: true,
        rate_limit: 100,
        last_called: new Date().toISOString(),
        success_rate: 99.2,
        avg_response_time: 245
      },
      {
        id: 'endpoint_002',
        name: 'Real-time Location Updates',
        url: '/api/v1/locations/update',
        method: 'PUT',
        auth_required: true,
        rate_limit: 1000,
        last_called: new Date().toISOString(),
        success_rate: 97.8,
        avg_response_time: 120
      },
      {
        id: 'endpoint_003',
        name: 'Financial Data Import',
        url: '/api/v1/financial/import',
        method: 'POST',
        auth_required: true,
        rate_limit: 50,
        last_called: new Date().toISOString(),
        success_rate: 98.5,
        avg_response_time: 890
      }
    ];

    setApiEndpoints(apiData);
  };

  const startAutoSync = () => {
    if (syncInterval_ref.current) {
      clearInterval(syncInterval_ref.current);
    }

    syncInterval_ref.current = setInterval(() => {
      triggerSync('all');
    }, syncInterval * 1000);
  };

  const triggerSync = async (integrationId: string) => {
    if (integrationId === 'all') {
      // Trigger sync for all active integrations
      const activeIntegrations = integrations.filter(i => i.status === 'connected');
      
      for (const integration of activeIntegrations) {
        const newSyncJob: SyncJob = {
          id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          integration_id: integration.id,
          status: 'running',
          started_at: new Date().toISOString(),
          records_processed: 0,
          records_total: Math.floor(Math.random() * 1000) + 100
        };

        setSyncJobs(prev => [newSyncJob, ...prev.slice(0, 9)]);

        // Simulate sync completion
        setTimeout(() => {
          setSyncJobs(prev => prev.map(job => 
            job.id === newSyncJob.id 
              ? { 
                  ...job, 
                  status: Math.random() > 0.1 ? 'completed' : 'failed',
                  completed_at: new Date().toISOString(),
                  records_processed: job.records_total,
                  error_message: Math.random() > 0.1 ? undefined : 'Connection timeout'
                }
              : job
          ));
        }, Math.random() * 10000 + 2000);
      }
    } else {
      // Trigger sync for specific integration
      const integration = integrations.find(i => i.id === integrationId);
      if (!integration) return;

      const newSyncJob: SyncJob = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        integration_id: integrationId,
        status: 'running',
        started_at: new Date().toISOString(),
        records_processed: 0,
        records_total: Math.floor(Math.random() * 1000) + 100
      };

      setSyncJobs(prev => [newSyncJob, ...prev.slice(0, 9)]);
    }

    toast({
      title: "Sync Initiated",
      description: `Data synchronization started for ${integrationId === 'all' ? 'all integrations' : 'selected integration'}`
    });
  };

  const connectIntegration = async (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'connected', last_sync: new Date().toISOString() }
        : integration
    ));

    toast({
      title: "Integration Connected",
      description: "Successfully established connection"
    });
  };

  const disconnectIntegration = async (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { ...integration, status: 'disconnected' }
        : integration
    ));

    toast({
      title: "Integration Disconnected",
      description: "Connection has been terminated"
    });
  };

  const testConnection = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    toast({
      title: "Testing Connection",
      description: `Testing connection to ${integration.name}...`
    });

    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.2;
      
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? `${integration.name} is responding correctly`
          : "Unable to establish connection. Please check configuration.",
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'syncing': return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'pending': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <XCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payroll': return <DollarSign className="h-5 w-5" />;
      case 'accounting': return <Building className="h-5 w-5" />;
      case 'iot': return <Zap className="h-5 w-5" />;
      case 'security': return <Shield className="h-5 w-5" />;
      case 'weather': return <Cloud className="h-5 w-5" />;
      case 'communication': return <Radio className="h-5 w-5" />;
      case 'erp': return <Database className="h-5 w-5" />;
      case 'crm': return <Users className="h-5 w-5" />;
      case 'mapping': return <Globe className="h-5 w-5" />;
      default: return <Plug className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'syncing': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredIntegrations = selectedCategory === 'all' 
    ? integrations 
    : integrations.filter(i => i.type === selectedCategory);

  if (!userRole || !['super_admin', 'admin'].includes(userRole)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8 text-center">
          <Plug className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">Integration Access Restricted</h2>
          <p className="text-muted-foreground">
            Administrative access required for Enterprise Integrations
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Plug className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Enterprise Integrations</h1>
          </div>
          <Badge variant="outline" className="animate-pulse">
            {integrations.filter(i => i.status === 'connected').length} Active
          </Badge>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={setAutoSync}
            />
            <Label htmlFor="auto-sync" className="text-sm">Auto Sync</Label>
          </div>

          <Button onClick={() => triggerSync('all')}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
        </div>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-2xl font-bold">{systemHealth.overall_health}%</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${systemHealth.overall_health > 95 ? 'bg-green-500' : systemHealth.overall_health > 85 ? 'bg-yellow-500' : 'bg-red-500'} animate-pulse`}></div>
            </div>
            <Progress value={systemHealth.overall_health} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Connections</p>
                <p className="text-2xl font-bold">{systemHealth.active_connections}</p>
              </div>
              <Link className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Failed Connections</p>
                <p className="text-2xl font-bold">{systemHealth.failed_connections}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sync Success Rate</p>
                <p className="text-2xl font-bold">{systemHealth.sync_success_rate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-2xl font-bold">{systemHealth.avg_response_time}ms</p>
              </div>
              <Zap className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="sync-jobs">Sync Jobs</TabsTrigger>
          <TabsTrigger value="api-endpoints">API Endpoints</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Active Integrations</h3>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="accounting">Accounting</SelectItem>
                <SelectItem value="iot">IoT & Sensors</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="weather">Weather</SelectItem>
                <SelectItem value="communication">Communication</SelectItem>
                <SelectItem value="erp">ERP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredIntegrations.map(integration => (
              <Card key={integration.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(integration.type)}
                      <CardTitle className="text-sm font-medium">{integration.name}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(integration.status)}
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(integration.status)}`}></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span>Provider:</span>
                      <span className="font-medium">{integration.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span className="font-medium">{integration.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uptime:</span>
                      <span className="font-medium">{integration.uptime}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Points:</span>
                      <span className="font-medium">{integration.data_points.toLocaleString()}</span>
                    </div>
                    {integration.error_count > 0 && (
                      <div className="flex justify-between">
                        <span>Errors:</span>
                        <span className="font-medium text-red-500">{integration.error_count}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <h5 className="text-xs font-medium">Features:</h5>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {integration.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{integration.features.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    {integration.status === 'connected' ? (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => triggerSync(integration.id)}
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => testConnection(integration.id)}
                        >
                          Test
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => disconnectIntegration(integration.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => connectIntegration(integration.id)}
                      >
                        <Plug className="h-3 w-3 mr-1" />
                        Connect
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sync Jobs Tab */}
        <TabsContent value="sync-jobs" className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Sync Jobs</h3>
          
          <div className="space-y-3">
            {syncJobs.map(job => {
              const integration = integrations.find(i => i.id === job.integration_id);
              const progress = job.records_total > 0 ? (job.records_processed / job.records_total) * 100 : 0;
              
              return (
                <Card key={job.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        {integration && getTypeIcon(integration.type)}
                        <div>
                          <h4 className="font-medium">{integration?.name || 'Unknown Integration'}</h4>
                          <p className="text-sm text-muted-foreground">
                            Started: {new Date(job.started_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <Badge variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'running' ? 'secondary' :
                        job.status === 'failed' ? 'destructive' : 'outline'
                      }>
                        {job.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress: {job.records_processed.toLocaleString()} / {job.records_total.toLocaleString()}</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      
                      {job.error_message && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                          Error: {job.error_message}
                        </div>
                      )}
                      
                      {job.completed_at && (
                        <div className="text-sm text-muted-foreground">
                          Completed: {new Date(job.completed_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* API Endpoints Tab */}
        <TabsContent value="api-endpoints" className="space-y-4">
          <h3 className="text-lg font-semibold">API Endpoints</h3>
          
          <div className="space-y-3">
            {apiEndpoints.map(endpoint => (
              <Card key={endpoint.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{endpoint.name}</h4>
                      <p className="text-sm text-muted-foreground font-mono">{endpoint.method} {endpoint.url}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">{endpoint.success_rate}% Success</div>
                      <div className="text-xs text-muted-foreground">{endpoint.avg_response_time}ms avg</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Rate Limit:</span>
                      <div className="font-medium">{endpoint.rate_limit}/min</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Auth Required:</span>
                      <div className="font-medium">{endpoint.auth_required ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Called:</span>
                      <div className="font-medium">{new Date(endpoint.last_called).toLocaleTimeString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate:</span>
                      <div className="font-medium">{endpoint.success_rate}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <h3 className="text-lg font-semibold">Integration Settings</h3>
          
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Automatic Synchronization</Label>
                    <p className="text-sm text-muted-foreground">Enable automatic data sync for all connected integrations</p>
                  </div>
                  <Switch checked={autoSync} onCheckedChange={setAutoSync} />
                </div>
                
                <div className="space-y-2">
                  <Label>Sync Interval: {syncInterval} seconds</Label>
                  <div className="flex items-center space-x-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSyncInterval(60)}
                      className={syncInterval === 60 ? 'bg-primary text-primary-foreground' : ''}
                    >
                      1 min
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSyncInterval(300)}
                      className={syncInterval === 300 ? 'bg-primary text-primary-foreground' : ''}
                    >
                      5 min
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSyncInterval(900)}
                      className={syncInterval === 900 ? 'bg-primary text-primary-foreground' : ''}
                    >
                      15 min
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSyncInterval(3600)}
                      className={syncInterval === 3600 ? 'bg-primary text-primary-foreground' : ''}
                    >
                      1 hour
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseIntegrations;