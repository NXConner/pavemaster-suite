import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Link, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Settings,
  ExternalLink,
  Zap,
  Database,
  Map,
  DollarSign,
  Truck,
  Users,
  Cloud
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'accounting' | 'mapping' | 'equipment' | 'weather' | 'crm' | 'storage';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  icon: any;
  lastSync?: Date;
  apiCalls?: number;
  features: string[];
}

interface APIEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  status: 'active' | 'inactive' | 'maintenance';
  responseTime: number;
  successRate: number;
}

export default function IntegrationHub() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<APIEndpoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching integrations
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'QuickBooks Online',
        description: 'Sync financial data and invoicing',
        category: 'accounting',
        status: 'connected',
        icon: DollarSign,
        lastSync: new Date(Date.now() - 1800000), // 30 minutes ago
        apiCalls: 1247,
        features: ['Invoicing', 'Expense Tracking', 'Tax Reporting', 'Customer Management']
      },
      {
        id: '2',
        name: 'Google Maps API',
        description: 'Mapping and geolocation services',
        category: 'mapping',
        status: 'connected',
        icon: Map,
        lastSync: new Date(Date.now() - 300000), // 5 minutes ago
        apiCalls: 856,
        features: ['Route Optimization', 'Geocoding', 'Distance Calculation', 'Real-time Traffic']
      },
      {
        id: '3',
        name: 'Fleet Telematics',
        description: 'Vehicle tracking and diagnostics',
        category: 'equipment',
        status: 'pending',
        icon: Truck,
        features: ['GPS Tracking', 'Fuel Monitoring', 'Maintenance Alerts', 'Driver Behavior']
      },
      {
        id: '4',
        name: 'Weather API',
        description: 'Real-time weather data and forecasts',
        category: 'weather',
        status: 'connected',
        icon: Cloud,
        lastSync: new Date(Date.now() - 900000), // 15 minutes ago
        apiCalls: 432,
        features: ['Current Conditions', 'Hourly Forecasts', 'Weather Alerts', 'Historical Data']
      },
      {
        id: '5',
        name: 'CRM Integration',
        description: 'Customer relationship management sync',
        category: 'crm',
        status: 'error',
        icon: Users,
        features: ['Contact Sync', 'Lead Management', 'Communication History', 'Sales Pipeline']
      },
      {
        id: '6',
        name: 'AWS S3 Storage',
        description: 'Cloud file storage and backup',
        category: 'storage',
        status: 'connected',
        icon: Database,
        lastSync: new Date(Date.now() - 600000), // 10 minutes ago
        apiCalls: 2156,
        features: ['File Backup', 'Image Storage', 'Document Management', 'CDN Delivery']
      }
    ];

    const mockApiEndpoints: APIEndpoint[] = [
      {
        id: '1',
        name: 'Projects API',
        method: 'GET',
        endpoint: '/api/v1/projects',
        status: 'active',
        responseTime: 145,
        successRate: 99.8
      },
      {
        id: '2',
        name: 'Equipment API',
        method: 'POST',
        endpoint: '/api/v1/equipment',
        status: 'active',
        responseTime: 89,
        successRate: 99.5
      },
      {
        id: '3',
        name: 'Analytics API',
        method: 'GET',
        endpoint: '/api/v1/analytics',
        status: 'maintenance',
        responseTime: 0,
        successRate: 0
      },
      {
        id: '4',
        name: 'Weather Sync',
        method: 'PUT',
        endpoint: '/api/v1/weather/sync',
        status: 'active',
        responseTime: 234,
        successRate: 97.2
      }
    ];

    setIntegrations(mockIntegrations);
    setApiEndpoints(mockApiEndpoints);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'disconnected':
      case 'inactive':
        return 'text-gray-600 bg-gray-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      case 'maintenance':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-orange-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };


  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading integrations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">
            Manage third-party integrations and API connections
          </p>
        </div>
        <Button className="gap-2">
          <Link className="h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {/* Integration Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Connected</p>
                <p className="text-2xl font-bold text-green-600">
                  {integrations.filter(i => i.status === 'connected').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {integrations.filter(i => i.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {integrations.filter(i => i.status === 'error').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API Calls</p>
                <p className="text-2xl font-bold">
                  {integrations.reduce((sum, i) => sum + (i.apiCalls || 0), 0).toLocaleString()}
                </p>
              </div>
              <Zap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => {
          const IconComponent = integration.icon;
          return (
            <Card key={integration.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <Badge variant="outline" className={getStatusColor(integration.status)}>
                        {getStatusIcon(integration.status)}
                        <span className="ml-1">{integration.status}</span>
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription>{integration.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integration.lastSync && (
                    <div className="text-sm text-muted-foreground">
                      Last sync: {integration.lastSync.toLocaleString()}
                    </div>
                  )}
                  
                  {integration.apiCalls && (
                    <div className="text-sm text-muted-foreground">
                      API calls: {integration.apiCalls.toLocaleString()}
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
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

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Docs
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Monitor API performance and availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {apiEndpoints.map((endpoint) => (
              <div key={endpoint.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="font-mono">
                    {endpoint.method}
                  </Badge>
                  <div>
                    <p className="font-medium font-mono">{endpoint.endpoint}</p>
                    <p className="text-sm text-muted-foreground">{endpoint.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{endpoint.responseTime}ms</p>
                    <p className="text-xs text-muted-foreground">Response time</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{endpoint.successRate}%</p>
                    <p className="text-xs text-muted-foreground">Success rate</p>
                  </div>
                  <Badge className={getStatusColor(endpoint.status)}>
                    {getStatusIcon(endpoint.status)}
                    <span className="ml-1">{endpoint.status}</span>
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}