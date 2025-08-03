import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { toast } from 'sonner';
import { AlertTriangle, CheckCircle, XCircle, Plus, Search, Users, ClipboardCheck, TrendingUp } from 'lucide-react';

type ComplianceRule = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  severity: string;
  point_deduction: number;
  auto_enforce: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

type EmployeeViolation = {
  id: string;
  employee_id: string;
  rule_id: string | null;
  violation_date: string | null;
  points_deducted: number;
  description: string | null;
  auto_generated: boolean | null;
  resolved: boolean | null;
  resolved_at: string | null;
  created_at: string | null;
};

type ComplianceScore = {
  id: string;
  employee_id: string | null;
  score: number;
  period_start: string;
  period_end: string;
  grade: string | null;
  created_at: string | null;
};

export default function ComplianceManagement() {
  const [rules, setRules] = useState<ComplianceRule[]>([]);
  const [violations, setViolations] = useState<EmployeeViolation[]>([]);
  const [scores, setScores] = useState<ComplianceScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesRes, violationsRes, scoresRes] = await Promise.all([
        supabase.from('compliance_rules').select('*').order('name'),
        supabase.from('employee_violations').select('*').order('violation_date', { ascending: false }),
        supabase.from('employee_compliance_scores').select('*').order('period_start', { ascending: false })
      ]);

      if (rulesRes.error) throw rulesRes.error;
      if (violationsRes.error) throw violationsRes.error;
      if (scoresRes.error) throw scoresRes.error;

      setRules(rulesRes.data || []);
      setViolations(violationsRes.data || []);
      setScores(scoresRes.data || []);
    } catch (error: any) {
      toast.error('Error fetching compliance data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resolveViolation = async (violationId: string) => {
    try {
      const { error } = await supabase
        .from('employee_violations')
        .update({ 
          resolved: true, 
          resolved_at: new Date().toISOString() 
        })
        .eq('id', violationId);

      if (error) throw error;

      setViolations(prev => 
        prev.map(v => 
          v.id === violationId 
            ? { ...v, resolved: true, resolved_at: new Date().toISOString() }
            : v
        )
      );
      
      toast.success('Violation resolved successfully');
    } catch (error: any) {
      toast.error('Error resolving violation: ' + error.message);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 90) return 'default';
    if (score >= 80) return 'secondary';
    if (score >= 70) return 'outline';
    return 'destructive';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'major':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'minor':
        return <CheckCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || rule.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(rules.map(rule => rule.category))];

  const complianceStats = {
    totalRules: rules.length,
    activeViolations: violations.filter(v => !v.resolved).length,
    totalViolations: violations.length,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance Management</h1>
            <p className="text-muted-foreground">
              Monitor employee compliance, manage violations, and track safety scores
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Violation
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{complianceStats.totalRules}</p>
                  <p className="text-xs text-muted-foreground">Compliance Rules</p>
                </div>
                <ClipboardCheck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{complianceStats.activeViolations}</p>
                  <p className="text-xs text-muted-foreground">Active Violations</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{complianceStats.totalViolations}</p>
                  <p className="text-xs text-muted-foreground">Total Violations</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-2xl font-bold ${getScoreColor(complianceStats.averageScore)}`}>
                    {complianceStats.averageScore}%
                  </p>
                  <p className="text-xs text-muted-foreground">Average Score</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">Compliance Rules</TabsTrigger>
            <TabsTrigger value="violations">Violations</TabsTrigger>
            <TabsTrigger value="scores">Compliance Scores</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4">
              {filteredRules.map((rule) => (
                <Card key={rule.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getSeverityIcon(rule.severity)}
                          <h3 className="font-semibold">{rule.name}</h3>
                          <Badge variant="outline">{rule.category}</Badge>
                          <Badge variant={rule.severity === 'critical' ? 'destructive' : 'secondary'}>
                            {rule.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {rule.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Point Deduction: <strong>{rule.point_deduction}</strong></span>
                          <span>Auto Enforce: <strong>{rule.auto_enforce ? 'Yes' : 'No'}</strong></span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="violations" className="space-y-4">
            <div className="grid gap-4">
              {violations.map((violation) => (
                <Card key={violation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">Violation #{violation.id.slice(-8)}</h3>
                          <Badge variant={violation.resolved ? 'default' : 'destructive'}>
                            {violation.resolved ? 'Resolved' : 'Active'}
                          </Badge>
                          {violation.auto_generated && (
                            <Badge variant="outline">Auto-Generated</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {violation.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>Points Deducted: <strong>{violation.points_deducted}</strong></span>
                          <span>Date: <strong>{violation.violation_date ? new Date(violation.violation_date).toLocaleDateString() : 'N/A'}</strong></span>
                          {violation.resolved_at && (
                            <span>Resolved: <strong>{new Date(violation.resolved_at).toLocaleDateString()}</strong></span>
                          )}
                        </div>
                      </div>
                      {!violation.resolved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveViolation(violation.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="scores" className="space-y-4">
            <div className="grid gap-4">
              {scores.map((score) => (
                <Card key={score.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">
                            Period: {new Date(score.period_start).toLocaleDateString()} - {new Date(score.period_end).toLocaleDateString()}
                          </h3>
                          <Badge variant={getScoreBadgeVariant(score.score)}>
                            Score: {score.score}%
                          </Badge>
                          {score.grade && (
                            <Badge variant="outline">Grade: {score.grade}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Employee compliance score for the specified period
                        </p>
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(score.score)}`}>
                        {score.score}%
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}