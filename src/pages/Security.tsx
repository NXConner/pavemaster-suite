import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Progress } from '../components/ui/progress';
import { 
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Globe,
  Database,
  FileText,
  Settings,
  Zap,
  Activity,
  UserCheck,
  Fingerprint,
  Smartphone
} from 'lucide-react';

export default function Security() {
  const [activeTab, setActiveTab] = useState('overview');
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');

  const securityMetrics = {
    overall_score: 94,
    compliance_score: 98,
    vulnerability_count: 2,
    last_audit: '2024-01-10T00:00:00Z',
    incidents_this_month: 0,
    failed_logins: 3
  };

  const securityEvents = [
    {
      id: 'SE001',
      type: 'login_success',
      user: 'john.mitchell@pavemaster.com',
      timestamp: '2024-01-16T10:30:00Z',
      ip: '192.168.1.100',
      location: 'Richmond, VA',
      severity: 'info'
    },
    {
      id: 'SE002',
      type: 'failed_login',
      user: 'unknown@email.com',
      timestamp: '2024-01-16T09:45:00Z',
      ip: '203.45.67.89',
      location: 'Unknown',
      severity: 'warning'
    },
    {
      id: 'SE003',
      type: 'permission_change',
      user: 'admin@pavemaster.com',
      timestamp: '2024-01-16T08:15:00Z',
      ip: '192.168.1.101',
      location: 'Richmond, VA',
      severity: 'medium'
    }
  ];

  const complianceStatus = [
    { name: 'SOC 2 Type II', status: 'compliant', lastReview: '2024-01-01', nextReview: '2024-07-01' },
    { name: 'GDPR', status: 'compliant', lastReview: '2023-12-15', nextReview: '2024-06-15' },
    { name: 'HIPAA', status: 'not_applicable', lastReview: null, nextReview: null },
    { name: 'PCI DSS', status: 'in_progress', lastReview: '2024-01-05', nextReview: '2024-04-05' },
    { name: 'ISO 27001', status: 'pending', lastReview: null, nextReview: '2024-03-01' }
  ];

  const accessControls = [
    { name: 'Multi-Factor Authentication', enabled: true, users: 8, coverage: 100 },
    { name: 'Single Sign-On (SSO)', enabled: false, users: 0, coverage: 0 },
    { name: 'Role-Based Access Control', enabled: true, users: 8, coverage: 100 },
    { name: 'Session Management', enabled: true, users: 8, coverage: 100 },
    { name: 'IP Whitelisting', enabled: false, users: 0, coverage: 0 },
    { name: 'Device Trust', enabled: true, users: 6, coverage: 75 }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'default';
      case 'warning': return 'secondary';
      case 'medium': return 'outline';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600';
      case 'in_progress': return 'text-yellow-600';
      case 'pending': return 'text-blue-600';
      case 'not_applicable': return 'text-gray-600';
      default: return 'text-red-600';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      case 'not_applicable': return <XCircle className="h-4 w-4 text-gray-600" />;
      default: return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const triggerZapier = async (securityData: any) => {
    if (!webhookUrl) return;
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify({
          event: 'security_alert',
          data: securityData,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Zapier webhook failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security & Compliance</h1>
          <p className="text-muted-foreground">Advanced security monitoring and compliance management</p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Security Audit
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="zapier">Zapier</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityMetrics.overall_score}%</div>
                <Progress value={securityMetrics.overall_score} className="mt-2 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityMetrics.compliance_score}%</div>
                <p className="text-xs text-muted-foreground">SOC 2 Type II</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Vulnerabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityMetrics.vulnerability_count}</div>
                <p className="text-xs text-muted-foreground">Low severity</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityMetrics.incidents_this_month}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">SSL/TLS Encryption</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Data Encryption at Rest</span>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Intrusion Detection</span>
                  </div>
                  <Badge variant="secondary">Monitoring</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Multi-Factor Authentication</span>
                  <Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Single Sign-On</span>
                  <Switch checked={ssoEnabled} onCheckedChange={setSsoEnabled} />
                </div>
                <div className="p-3 border rounded-lg">
                  <p className="font-medium">Password Policy</p>
                  <p className="text-sm text-muted-foreground">
                    Min 12 chars, special chars required, 90-day expiry
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          {accessControls.map((control, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {control.name.includes('MFA') && <Fingerprint className="h-5 w-5 text-blue-600" />}
                    {control.name.includes('SSO') && <Key className="h-5 w-5 text-purple-600" />}
                    {control.name.includes('Role') && <UserCheck className="h-5 w-5 text-green-600" />}
                    {control.name.includes('Session') && <Clock className="h-5 w-5 text-orange-600" />}
                    {control.name.includes('IP') && <Globe className="h-5 w-5 text-red-600" />}
                    {control.name.includes('Device') && <Smartphone className="h-5 w-5 text-cyan-600" />}
                    <div>
                      <h3 className="font-medium">{control.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {control.users} users • {control.coverage}% coverage
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={control.enabled} />
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Progress value={control.coverage} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
                <CardDescription>Live security event detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">Current user sessions</p>
                    </div>
                    <span className="text-2xl font-bold">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Failed Login Attempts</p>
                      <p className="text-sm text-muted-foreground">Last 24 hours</p>
                    </div>
                    <span className="text-2xl font-bold text-yellow-600">3</span>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Blocked IP Addresses</p>
                      <p className="text-sm text-muted-foreground">Automatically blocked</p>
                    </div>
                    <span className="text-2xl font-bold text-red-600">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Threat Intelligence</CardTitle>
                <CardDescription>AI-powered threat detection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium">No Active Threats</span>
                    </div>
                    <p className="text-sm text-muted-foreground">All systems secure</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Anomaly Detection</p>
                    <p className="text-sm text-muted-foreground">
                      Monitoring for unusual access patterns
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">Vulnerability Scanning</p>
                    <p className="text-sm text-muted-foreground">
                      Next scan: Tomorrow at 2:00 AM
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          {complianceStatus.map((compliance, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getComplianceIcon(compliance.status)}
                    <div>
                      <h3 className="font-medium">{compliance.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {compliance.status === 'not_applicable' 
                          ? 'Not applicable to current operations'
                          : compliance.lastReview 
                          ? `Last review: ${new Date(compliance.lastReview).toLocaleDateString()}`
                          : 'No review completed'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={compliance.status === 'compliant' ? 'default' : 'secondary'}
                      className={getComplianceColor(compliance.status)}
                    >
                      {compliance.status.replace('_', ' ')}
                    </Badge>
                    {compliance.nextReview && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Next: {new Date(compliance.nextReview).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          {securityEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">
                          {event.type.replace('_', ' ').split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                          }
                        </h3>
                        <Badge variant={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.user}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.ip} • {event.location} • {new Date(event.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="zapier" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Security Zapier Integration
              </CardTitle>
              <CardDescription>Automate security alerts and compliance workflows</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Zapier Webhook URL</Label>
                <Input
                  id="webhook-url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
              </div>
              <Button 
                className="w-full"
                onClick={() => triggerZapier({ 
                  metrics: securityMetrics,
                  events: securityEvents.slice(0, 3),
                  compliance: complianceStatus 
                })}
                disabled={!webhookUrl}
              >
                <Zap className="h-4 w-4 mr-2" />
                Test Integration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}