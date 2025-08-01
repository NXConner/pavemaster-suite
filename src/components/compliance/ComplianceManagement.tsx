import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Gavel,
  Award
} from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';

interface ComplianceRule {
  id: string;
  name: string;
  description: string | null;
  category: string;
  severity: string;
  point_deduction: number;
  auto_enforce: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface EmployeeViolation {
  id: string;
  employee_id: string;
  rule_id: string | null;
  description: string | null;
  violation_date: string | null;
  points_deducted: number;
  auto_generated: boolean | null;
  resolved: boolean | null;
  resolved_at: string | null;
  created_at: string | null;
}

interface EmployeeCertification {
  id: string;
  employee_id: string | null;
  name: string | null;
  issuing_authority: string | null;
  certificate_number: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  status: string | null;
}

export const ComplianceManagement = () => {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [violations, setViolations] = useState<EmployeeViolation[]>([]);
  const [certifications, setCertifications] = useState<EmployeeCertification[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      const [rulesRes, violationsRes, certificationsRes] = await Promise.all([
        supabase.from('compliance_rules').select('*'),
        supabase.from('employee_violations').select('*'),
        supabase.from('employee_certifications').select('*')
      ]);

      if (rulesRes.data) setRules(rulesRes.data);
      if (violationsRes.data) setViolations(violationsRes.data);
      if (certificationsRes.data) setCertifications(certificationsRes.data);
    } catch (error) {
      console.error('Error loading compliance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceScore = () => {
    const totalViolations = violations.length;
    const resolvedViolations = violations.filter(v => v.resolved).length;
    return totalViolations > 0 ? Math.round((resolvedViolations / totalViolations) * 100) : 100;
  };

  const getExpiringCertifications = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return certifications.filter(cert => {
      if (!cert.expiry_date) return false;
      const expiryDate = new Date(cert.expiry_date);
      return expiryDate <= thirtyDaysFromNow && cert.status === 'active';
    });
  };

  const OverviewTab = () => {
    const complianceScore = getComplianceScore();
    const expiringCerts = getExpiringCertifications();
    const openViolations = violations.filter(v => !v.resolved).length;
    const activeCertifications = certifications.filter(c => c.status === 'active').length;

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold text-success">{complianceScore}%</p>
              </div>
              <Shield className="h-8 w-8 text-success" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Violations</p>
                <p className="text-2xl font-bold text-destructive">{openViolations}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Certifications</p>
                <p className="text-2xl font-bold">{activeCertifications}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                <p className="text-2xl font-bold text-warning">{expiringCerts.length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </Card>
        </div>

        {/* Compliance Score Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Compliance Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Compliance Score</span>
              <span className="text-sm text-muted-foreground">{complianceScore}%</span>
            </div>
            <Progress value={complianceScore} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{violations.filter(v => v.resolved).length}</p>
                <p className="text-sm text-muted-foreground">Resolved Violations</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">{openViolations}</p>
                <p className="text-sm text-muted-foreground">Pending Actions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{rules.length}</p>
                <p className="text-sm text-muted-foreground">Active Rules</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Alerts and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Expiring Certifications
            </h3>
            <div className="space-y-3">
              {expiringCerts.slice(0, 5).map((cert) => (
                <div key={cert.id} className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Expires: {cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-warning border-warning">
                    Expiring
                  </Badge>
                </div>
              ))}
              {expiringCerts.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No certifications expiring in the next 30 days
                </p>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Gavel className="h-5 w-5 text-destructive" />
              Recent Violations
            </h3>
            <div className="space-y-3">
              {violations.slice(0, 5).map((violation) => (
                <div key={violation.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                  <div>
                    <p className="font-medium">Violation #{violation.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {violation.violation_date ? new Date(violation.violation_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <Badge variant={violation.resolved ? 'secondary' : 'destructive'}>
                    {violation.resolved ? 'Resolved' : 'Open'}
                  </Badge>
                </div>
              ))}
              {violations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent violations
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const RulesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Compliance Rules</h3>
        <Button>Add New Rule</Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {rules.map((rule) => (
          <Card key={rule.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold">{rule.name}</h4>
                  <Badge variant={rule.severity === 'critical' ? 'destructive' : 
                                 rule.severity === 'major' ? 'secondary' : 'outline'}>
                    {rule.severity}
                  </Badge>
                  {rule.auto_enforce && (
                    <Badge variant="outline">Auto-Enforce</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{rule.description || 'No description'}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Category: {rule.category}</span>
                  <span>Point Deduction: {rule.point_deduction}</span>
                  <span>Updated: {rule.updated_at ? new Date(rule.updated_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Edit</Button>
                <Button variant="outline" size="sm">
                  {rule.auto_enforce ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const ViolationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Violation Management</h3>
        <Button>Report Violation</Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {violations.map((violation) => (
            <div key={violation.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  violation.resolved ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  {violation.resolved ? 
                    <CheckCircle className="h-5 w-5 text-success" /> :
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  }
                </div>
                <div>
                  <p className="font-medium">
                    {violation.description || `Violation #${violation.id.slice(0, 8)}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {violation.violation_date ? new Date(violation.violation_date).toLocaleDateString() : 'N/A'} • 
                    Points: {violation.points_deducted}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={violation.resolved ? 'secondary' : 'destructive'}>
                  {violation.resolved ? 'Resolved' : 'Open'}
                </Badge>
                {!violation.resolved && (
                  <Button variant="outline" size="sm">Resolve</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  const CertificationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Certification Management</h3>
        <Button>Add Certification</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certifications.map((cert) => (
          <Card key={cert.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {cert.issuing_authority}
                  </p>
                </div>
                <Badge variant={cert.status === 'active' ? 'secondary' : 
                               cert.status === 'expired' ? 'destructive' : 'outline'}>
                  {cert.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certificate #:</span>
                  <span>{cert.certificate_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Issue Date:</span>
                  <span>{cert.issue_date ? new Date(cert.issue_date).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expiry Date:</span>
                  <span>{cert.expiry_date ? new Date(cert.expiry_date).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">View</Button>
                <Button variant="outline" size="sm">Renew</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Management</h1>
          <p className="text-muted-foreground">
            Regulatory compliance tracking and violation management system
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab />
        </TabsContent>

        <TabsContent value="rules">
          <RulesTab />
        </TabsContent>

        <TabsContent value="violations">
          <ViolationsTab />
        </TabsContent>

        <TabsContent value="certifications">
          <CertificationsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};