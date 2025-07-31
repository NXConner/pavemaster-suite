import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Building, 
  Users, 
  Globe, 
  Shield, 
  Zap,
  BarChart3,
  Settings,
  Crown,
  Lock,
  Server,
  Database,
  Cloud,
  Gauge
} from 'lucide-react';

interface TenantInfo {
  id: string;
  name: string;
  domain: string;
  users: number;
  maxUsers: number;
  status: 'active' | 'suspended' | 'trial';
  plan: 'starter' | 'professional' | 'enterprise';
  createdAt: Date;
  features: string[];
}

interface SystemMetric {
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
  icon: any;
}

export default function EnterpriseHub() {
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching enterprise data
    const mockTenants: TenantInfo[] = [
      {
        id: '1',
        name: 'PaveMaster Corporate',
        domain: 'pavemaster.com',
        users: 25,
        maxUsers: 50,
        status: 'active',
        plan: 'enterprise',
        createdAt: new Date('2023-01-15'),
        features: ['Advanced Analytics', 'Multi-tenant', 'API Access', 'Custom Branding', 'SSO']
      },
      {
        id: '2',
        name: 'Regional Operations',
        domain: 'regional.pavemaster.com',
        users: 12,
        maxUsers: 25,
        status: 'active',
        plan: 'professional',
        createdAt: new Date('2023-03-20'),
        features: ['Team Management', 'Advanced Reporting', 'API Access', 'Priority Support']
      },
      {
        id: '3',
        name: 'Field Services Division',
        domain: 'field.pavemaster.com',
        users: 8,
        maxUsers: 15,
        status: 'trial',
        plan: 'starter',
        createdAt: new Date('2024-01-10'),
        features: ['Basic Reporting', 'Standard Support', 'Mobile Access']
      }
    ];

    const mockMetrics: SystemMetric[] = [
      {
        name: 'System Performance',
        value: '99.8%',
        status: 'healthy',
        description: 'Overall system uptime and availability',
        icon: Gauge
      },
      {
        name: 'Database Health',
        value: 'Optimal',
        status: 'healthy',
        description: 'Database performance and connectivity',
        icon: Database
      },
      {
        name: 'API Response Time',
        value: '125ms',
        status: 'warning',
        description: 'Average API response time',
        icon: Zap
      },
      {
        name: 'Storage Usage',
        value: '76%',
        status: 'warning',
        description: 'Cloud storage utilization',
        icon: Cloud
      },
      {
        name: 'Security Status',
        value: 'Secure',
        status: 'healthy',
        description: 'Security monitoring and compliance',
        icon: Shield
      },
      {
        name: 'Active Users',
        value: '142',
        status: 'healthy',
        description: 'Currently active users across all tenants',
        icon: Users
      }
    ];

    setTenants(mockTenants);
    setMetrics(mockMetrics);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'trial':
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'suspended':
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'text-purple-600 bg-purple-50';
      case 'professional':
        return 'text-blue-600 bg-blue-50';
      case 'starter':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Crown className="h-4 w-4" />;
      case 'professional':
        return <Building className="h-4 w-4" />;
      case 'starter':
        return <Users className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading enterprise data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Management</h1>
          <p className="text-muted-foreground">
            Multi-tenant management and enterprise features
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            System Config
          </Button>
          <Button className="gap-2">
            <Building className="h-4 w-4" />
            New Tenant
          </Button>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.name}</p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <IconComponent className="h-8 w-8 text-muted-foreground" />
                    <Badge className={`mt-2 text-xs ${getStatusColor(metric.status)}`}>
                      {metric.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tenant Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Tenant Organizations
          </CardTitle>
          <CardDescription>
            Manage multi-tenant organizations and their configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Building className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{tenant.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        {tenant.domain}
                        <span>•</span>
                        <span>Created {tenant.createdAt.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPlanColor(tenant.plan)}>
                      {getPlanIcon(tenant.plan)}
                      <span className="ml-1 capitalize">{tenant.plan}</span>
                    </Badge>
                    <Badge className={getStatusColor(tenant.status)}>
                      {tenant.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {tenant.users} / {tenant.maxUsers} users
                    </span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${(tenant.users / tenant.maxUsers) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {tenant.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3 mr-1" />
                    Configure
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    Analytics
                  </Button>
                  <Button size="sm" variant="outline">
                    <Users className="h-3 w-3 mr-1" />
                    Users
                  </Button>
                  <Button size="sm" variant="outline">
                    <Lock className="h-3 w-3 mr-1" />
                    Security
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enterprise Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Compliance
            </CardTitle>
            <CardDescription>
              Enterprise-grade security features and compliance monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Single Sign-On (SSO)</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Multi-Factor Authentication</span>
                <Badge variant="default">Enforced</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Role-Based Access Control</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Audit Logging</span>
                <Badge variant="default">Comprehensive</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Data Encryption</span>
                <Badge variant="default">AES-256</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Compliance (SOC2)</span>
                <Badge variant="default">Certified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Infrastructure & Scaling
            </CardTitle>
            <CardDescription>
              System performance and scalability management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Auto-Scaling</span>
                <Badge variant="default">Enabled</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Load Balancing</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>CDN Distribution</span>
                <Badge variant="default">Global</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Database Clustering</span>
                <Badge variant="default">Master/Slave</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Backup Strategy</span>
                <Badge variant="default">3-2-1 Rule</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Disaster Recovery</span>
                <Badge variant="default">RTO: 1hr</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}