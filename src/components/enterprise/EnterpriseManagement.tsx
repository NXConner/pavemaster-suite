import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { 
  Shield, 
  Users, 
  Building, 
  Settings,
  Crown,
  Key,
  Globe,
  Database,
  Server,
  Lock,
  UserCheck,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface EnterpriseFeature {
  id: string;
  name: string;
  description: string;
  category: 'security' | 'compliance' | 'integration' | 'analytics' | 'scalability';
  status: 'available' | 'configured' | 'pending' | 'disabled';
  tier: 'professional' | 'enterprise' | 'ultimate';
}

interface OrganizationUnit {
  id: string;
  name: string;
  type: 'department' | 'team' | 'project';
  members: number;
  permissions: string[];
  status: 'active' | 'inactive';
}

const ENTERPRISE_FEATURES: EnterpriseFeature[] = [
  {
    id: '1',
    name: 'Advanced Role-Based Access Control',
    description: 'Granular permissions and role hierarchies with custom access policies',
    category: 'security',
    status: 'configured',
    tier: 'enterprise'
  },
  {
    id: '2',
    name: 'Single Sign-On (SSO)',
    description: 'SAML and OAuth integration with enterprise identity providers',
    category: 'security',
    status: 'available',
    tier: 'enterprise'
  },
  {
    id: '3',
    name: 'Audit Logging & Compliance',
    description: 'Comprehensive audit trails and compliance reporting for SOX, GDPR',
    category: 'compliance',
    status: 'configured',
    tier: 'professional'
  },
  {
    id: '4',
    name: 'Multi-Tenant Architecture',
    description: 'Isolated tenant environments with shared infrastructure',
    category: 'scalability',
    status: 'configured',
    tier: 'ultimate'
  },
  {
    id: '5',
    name: 'Enterprise API Gateway',
    description: 'Rate limiting, authentication, and monitoring for external integrations',
    category: 'integration',
    status: 'pending',
    tier: 'enterprise'
  },
  {
    id: '6',
    name: 'Advanced Analytics & BI',
    description: 'Custom dashboards, data warehousing, and predictive analytics',
    category: 'analytics',
    status: 'available',
    tier: 'ultimate'
  }
];

const ORGANIZATION_UNITS: OrganizationUnit[] = [
  {
    id: '1',
    name: 'Operations Department',
    type: 'department',
    members: 12,
    permissions: ['project_management', 'equipment_access', 'scheduling'],
    status: 'active'
  },
  {
    id: '2',
    name: 'Field Crew Alpha',
    type: 'team',
    members: 4,
    permissions: ['mobile_access', 'data_collection', 'safety_reports'],
    status: 'active'
  },
  {
    id: '3',
    name: 'Church Renovation Project',
    type: 'project',
    members: 8,
    permissions: ['project_specific', 'client_communication', 'progress_reporting'],
    status: 'active'
  }
];

export function EnterpriseManagement() {
  const [features] = useState<EnterpriseFeature[]>(ENTERPRISE_FEATURES);
  const [orgUnits] = useState<OrganizationUnit[]>(ORGANIZATION_UNITS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="h-4 w-4 text-red-500" />;
      case 'compliance': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'integration': return <Globe className="h-4 w-4 text-blue-500" />;
      case 'analytics': return <Activity className="h-4 w-4 text-purple-500" />;
      case 'scalability': return <Server className="h-4 w-4 text-orange-500" />;
      default: return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'configured': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'available': return <Settings className="h-4 w-4 text-blue-500" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'disabled': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'ultimate': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'enterprise': return <Building className="h-4 w-4 text-blue-500" />;
      case 'professional': return <Users className="h-4 w-4 text-green-500" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'department': return <Building className="h-4 w-4 text-blue-500" />;
      case 'team': return <Users className="h-4 w-4 text-green-500" />;
      case 'project': return <Activity className="h-4 w-4 text-purple-500" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'configured': return 'default';
      case 'available': return 'secondary';
      case 'pending': return 'outline';
      case 'disabled': return 'destructive';
      default: return 'outline';
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'ultimate': return 'bg-yellow-500/10 text-yellow-700 border-yellow-500/30';
      case 'enterprise': return 'bg-blue-500/10 text-blue-700 border-blue-500/30';
      case 'professional': return 'bg-green-500/10 text-green-700 border-green-500/30';
      default: return 'bg-card0/10 text-gray-700 border-gray-500/30';
    }
  };

  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Enterprise Management
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white ml-2">
              Ultimate Tier
            </Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Enterprise Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Active Users</div>
                <div className="text-2xl font-bold">247</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Building className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Departments</div>
                <div className="text-2xl font-bold">8</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Shield className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Security Score</div>
                <div className="text-2xl font-bold">96%</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Data Volume</div>
                <div className="text-2xl font-bold">1.2TB</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {['all', 'security', 'compliance', 'integration', 'analytics', 'scalability'].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {category !== 'all' && getCategoryIcon(category)}
            <span className="ml-1">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
          </Button>
        ))}
      </div>

      {/* Enterprise Features & Organization Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enterprise Features */}
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Enterprise Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {filteredFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className="p-4 rounded-lg border border/50 bg-surface/30"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(feature.category)}
                        <span className="font-medium text-sm">{feature.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(feature.status)}
                        <Badge variant={getStatusColor(feature.status)} className="text-xs">
                          {feature.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">
                      {feature.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTierIcon(feature.tier)}
                        <Badge className={`text-xs ${getTierColor(feature.tier)}`}>
                          {feature.tier}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {feature.status === 'available' && (
                          <Button size="sm" variant="outline">
                            Configure
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Organization Units */}
        <Card className="border/50 bg-surface/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Organization Units
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              {orgUnits.map((unit) => (
                <div
                  key={unit.id}
                  className="p-4 rounded-lg border border/50 bg-surface/30"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(unit.type)}
                      <span className="font-medium text-sm">{unit.name}</span>
                    </div>
                    <Badge variant={unit.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {unit.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{unit.members} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Key className="h-3 w-3" />
                      <span>{unit.permissions.length} permissions</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {unit.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission.replace('_', ' ')}
                      </Badge>
                    ))}
                    {unit.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{unit.permissions.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <UserCheck className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Lock className="h-3 w-3 mr-1" />
                      Permissions
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="w-full" variant="outline">
              <Building className="h-4 w-4 mr-2" />
              Add Organization Unit
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Security & Compliance Dashboard */}
      <Card className="border/50 bg-surface/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Security & Compliance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Security Metrics</h4>
              <div className="space-y-2">
                {[
                  { name: 'Password Policy', score: 95, status: 'good' },
                  { name: 'Access Control', score: 88, status: 'good' },
                  { name: 'Data Encryption', score: 100, status: 'good' },
                  { name: 'Audit Coverage', score: 92, status: 'good' }
                ].map((metric) => (
                  <div key={metric.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{metric.name}</span>
                      <span>{metric.score}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          metric.score > 90 ? 'bg-green-500' :
                          metric.score > 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${metric.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Compliance Status</h4>
              <div className="space-y-2">
                {[
                  { standard: 'GDPR', status: 'compliant', lastAudit: '2024-10-15' },
                  { standard: 'SOX', status: 'compliant', lastAudit: '2024-09-30' },
                  { standard: 'ISO 27001', status: 'in-progress', lastAudit: '2024-11-01' },
                  { standard: 'HIPAA', status: 'not-applicable', lastAudit: 'N/A' }
                ].map((item) => (
                  <div key={item.standard} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium text-sm">{item.standard}</div>
                      <div className="text-xs text-muted-foreground">
                        Last audit: {item.lastAudit}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        item.status === 'compliant' ? 'default' :
                        item.status === 'in-progress' ? 'secondary' : 'outline'
                      }
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Recent Activity</h4>
              <div className="space-y-2">
                {[
                  { action: 'User role updated', time: '2 hours ago', type: 'info' },
                  { action: 'Security scan completed', time: '4 hours ago', type: 'success' },
                  { action: 'Failed login attempt', time: '6 hours ago', type: 'warning' },
                  { action: 'Data backup completed', time: '1 day ago', type: 'info' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                    }`} />
                    <div className="flex-1">
                      <div className="text-sm">{activity.action}</div>
                      <div className="text-xs text-muted-foreground">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}