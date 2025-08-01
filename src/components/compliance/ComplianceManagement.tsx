import { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Trophy, AlertTriangle, DollarSign, Users, Target } from 'lucide-react';
import { toast } from 'sonner';

// Enhanced interfaces for the compliance system
interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  severity: 'minor' | 'major' | 'critical';
  point_deduction: number;
  auto_enforce: boolean;
}

interface EmployeeViolation {
  id: string;
  employee_id: string;
  rule_id?: string;
  description: string;
  violation_date: string;
  points_deducted: number;
  resolved: boolean;
  auto_generated: boolean;
  compliance_rules?: ComplianceRule;
  employees?: { first_name: string; last_name: string };
}

interface EmployeeCostRecord {
  id: string;
  employee_id: string;
  type: 'positive' | 'negative';
  category: string;
  amount: number;
  description: string;
  date_recorded: string;
  project_id?: string;
  employees?: { first_name: string; last_name: string };
}

interface ComplianceScore {
  id: string;
  employee_id: string;
  score: number;
  grade: string;
  period_start: string;
  period_end: string;
  employees?: { first_name: string; last_name: string };
}

interface CostTracking {
  id: string;
  employee_id: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  period_start: string;
  period_end: string;
  operational_cost: number;
  project_cost: number;
  positive_cost: number;
  negative_cost: number;
  total_cost: number;
  employees?: { first_name: string; last_name: string };
}

interface DisciplinaryAction {
  id: string;
  employee_id: string;
  violation_id?: string;
  action_type: 'warning' | 'written_warning' | 'suspension' | 'termination';
  description: string;
  effective_date: string;
  auto_generated: boolean;
  employees?: { first_name: string; last_name: string };
}

export default function ComplianceManagement() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for all compliance data
  const [, setRules] = useState<ComplianceRule[]>([]);
  const [violations, setViolations] = useState<EmployeeViolation[]>([]);
  const [complianceScores, setComplianceScores] = useState<ComplianceScore[]>([]);
  const [costRecords, setCostRecords] = useState<EmployeeCostRecord[]>([]);
  const [costTracking, setCostTracking] = useState<CostTracking[]>([]);
  const [disciplinaryActions, setDisciplinaryActions] = useState<DisciplinaryAction[]>([]);

  useEffect(() => {
    loadAllComplianceData();
  }, []);

  const loadAllComplianceData = async () => {
    try {
      const [rulesData, violationsData, scoresData, costsData, trackingData, actionsData] = await Promise.all([
        supabase.from('compliance_rules').select('*'),
        supabase.from('employee_violations').select(`
          *,
          compliance_rules(name, category, severity),
          employees(first_name, last_name)
        `),
        supabase.from('employee_compliance_scores').select(`
          *,
          employees(first_name, last_name)
        `),
        supabase.from('employee_costs').select(`
          *,
          employees(first_name, last_name)
        `),
        supabase.from('cost_tracking').select(`
          *,
          employees(first_name, last_name)
        `),
        supabase.from('disciplinary_actions').select(`
          *,
          employees(first_name, last_name)
        `)
      ]);

      if (rulesData.error) throw rulesData.error;
      if (violationsData.error) throw violationsData.error;
      if (scoresData.error) throw scoresData.error;
      if (costsData.error) throw costsData.error;
      if (trackingData.error) throw trackingData.error;
      if (actionsData.error) throw actionsData.error;

      setRules(rulesData.data || []);
      setViolations(violationsData.data || []);
      setComplianceScores(scoresData.data || []);
      setCostRecords(costsData.data || []);
      setCostTracking(trackingData.data || []);
      setDisciplinaryActions(actionsData.data || []);
    } catch (error) {
      console.error('Error loading compliance data:', error);
      toast.error('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  // const addCostRecord = async (employeeId: string, type: 'positive' | 'negative', category: string, amount: number, description: string) => {
  //   try {
  //     const { error } = await supabase.from('employee_costs').insert({
  //       employee_id: employeeId,
  //       type,
  //       category,
  //       amount,
  //       description
  //     });

  //     if (error) throw error;
  //     toast.success(`${type === 'positive' ? 'Bonus' : 'Cost'} recorded successfully`);
  //     loadAllComplianceData();
  //   } catch (error) {
  //     console.error('Error adding cost record:', error);
  //     toast.error('Failed to record cost');
  //   }
  // };

  const resolveViolation = async (violationId: string) => {
    try {
      const { error } = await supabase
        .from('employee_violations')
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq('id', violationId);

      if (error) throw error;
      toast.success('Violation resolved successfully');
      loadAllComplianceData();
    } catch (error) {
      console.error('Error resolving violation:', error);
      toast.error('Failed to resolve violation');
    }
  };

  // Calculate metrics
  const getOverallComplianceScore = () => {
    if (complianceScores.length === 0) return 0;
    const total = complianceScores.reduce((sum, score) => sum + score.score, 0);
    return Math.round(total / complianceScores.length);
  };

  const getActiveViolations = () => violations.filter(v => !v.resolved);
  
  const getTotalCostsByPeriod = (period: string) => {
    const periodData = costTracking.filter(ct => ct.period_type === period);
    return periodData.reduce((sum, ct) => sum + ct.total_cost, 0);
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'bg-green-500';
      case 'B': return 'bg-blue-500';
      case 'C': return 'bg-yellow-500';
      case 'D': return 'bg-orange-500';
      case 'F': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Employee Compliance & Performance</h1>
          <p className="text-muted-foreground">
            Comprehensive employee compliance tracking with auto-enforcement and cost analysis
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="costs">Cost Tracking</TabsTrigger>
          <TabsTrigger value="actions">Disciplinary</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getOverallComplianceScore()}%</div>
                <Progress value={getOverallComplianceScore()} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{getActiveViolations().length}</div>
                <p className="text-xs text-muted-foreground">
                  Requiring immediate attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Costs</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${getTotalCostsByPeriod('monthly').toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current month impact
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disciplinary Actions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{disciplinaryActions.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total actions taken
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getActiveViolations().slice(0, 5).map((violation) => (
                    <div key={violation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">
                          {violation.employees?.first_name} {violation.employees?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{violation.description}</p>
                        <p className="text-xs text-red-600">-{violation.points_deducted} points</p>
                      </div>
                      <Button size="sm" onClick={() => resolveViolation(violation.id)}>
                        Resolve
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown (This Month)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Operational Costs</span>
                    <span className="font-medium">
                      ${costTracking.filter(ct => ct.period_type === 'monthly')
                        .reduce((sum, ct) => sum + ct.operational_cost, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Project Costs</span>
                    <span className="font-medium">
                      ${costTracking.filter(ct => ct.period_type === 'monthly')
                        .reduce((sum, ct) => sum + ct.project_cost, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-green-600">Positive Impact</span>
                    <span className="font-medium text-green-600">
                      +${costTracking.filter(ct => ct.period_type === 'monthly')
                        .reduce((sum, ct) => sum + ct.positive_cost, 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-red-600">Negative Impact</span>
                    <span className="font-medium text-red-600">
                      -${costTracking.filter(ct => ct.period_type === 'monthly')
                        .reduce((sum, ct) => sum + ct.negative_cost, 0).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center font-bold">
                    <span>Net Impact</span>
                    <span>${getTotalCostsByPeriod('monthly').toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Compliance Scores</CardTitle>
              <p className="text-sm text-muted-foreground">
                Graded performance with automatic scoring and achievement tracking
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {complianceScores.map((score) => (
                  <div key={score.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getGradeColor(score.grade)}`}>
                        {score.grade}
                      </div>
                      <div>
                        <p className="font-medium">
                          {score.employees?.first_name} {score.employees?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(score.period_start).toLocaleDateString()} - {new Date(score.period_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">{score.score}%</p>
                      <Progress value={score.score} className="w-32 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="violations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee Violations</CardTitle>
              <p className="text-sm text-muted-foreground">
                Auto-tracked violations with disciplinary action recommendations
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {violations.map((violation) => (
                  <div key={violation.id} className={`p-4 border rounded-lg ${violation.resolved ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {violation.employees?.first_name} {violation.employees?.last_name}
                          </p>
                          <Badge variant={violation.resolved ? "default" : "destructive"}>
                            {violation.resolved ? 'Resolved' : 'Active'}
                          </Badge>
                          {violation.auto_generated && (
                            <Badge variant="outline">Auto-Generated</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{violation.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          <span>Points: -{violation.points_deducted}</span>
                          <span>Date: {new Date(violation.violation_date).toLocaleDateString()}</span>
                          {violation.compliance_rules && (
                            <span>Category: {violation.compliance_rules.category}</span>
                          )}
                        </div>
                      </div>
                      {!violation.resolved && (
                        <Button onClick={() => resolveViolation(violation.id)}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Cost Tracking</CardTitle>
              <p className="text-sm text-muted-foreground">
                Daily, weekly, monthly, quarterly, and yearly cost analysis
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Daily</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${getTotalCostsByPeriod('daily').toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Weekly</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${getTotalCostsByPeriod('weekly').toLocaleString()}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Monthly</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">${getTotalCostsByPeriod('monthly').toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Recent Cost Records</h3>
                {costRecords.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">
                        {record.employees?.first_name} {record.employees?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{record.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {record.category} • {new Date(record.date_recorded).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${record.type === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                        {record.type === 'positive' ? '+' : '-'}${record.amount.toLocaleString()}
                      </p>
                      <Badge variant={record.type === 'positive' ? "default" : "destructive"}>
                        {record.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Disciplinary Actions</CardTitle>
              <p className="text-sm text-muted-foreground">
                Auto-generated and manual disciplinary actions based on compliance scores
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disciplinaryActions.map((action) => (
                  <div key={action.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">
                            {action.employees?.first_name} {action.employees?.last_name}
                          </p>
                          <Badge variant={
                            action.action_type === 'warning' ? 'outline' :
                            action.action_type === 'written_warning' ? 'secondary' :
                            action.action_type === 'suspension' ? 'destructive' :
                            'default'
                          }>
                            {action.action_type.replace('_', ' ')}
                          </Badge>
                          {action.auto_generated && (
                            <Badge variant="outline">Auto-Generated</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Effective: {new Date(action.effective_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span>Employee Performance Leaderboard</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Competitive ranking based on compliance scores and achievements
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceScores
                  .sort((a, b) => b.score - a.score)
                  .map((score, index) => (
                    <div key={score.id} className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0 ? 'bg-yellow-50 border-yellow-200' :
                      index === 1 ? 'bg-gray-50 border-gray-200' :
                      index === 2 ? 'bg-orange-50 border-orange-200' :
                      'border'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-500' :
                          index === 2 ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}>
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {score.employees?.first_name} {score.employees?.last_name}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge className={getGradeColor(score.grade)}>
                              Grade {score.grade}
                            </Badge>
                            {index < 3 && (
                              <Trophy className={`h-4 w-4 ${
                                index === 0 ? 'text-yellow-500' :
                                index === 1 ? 'text-gray-500' :
                                'text-orange-500'
                              }`} />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{score.score}%</p>
                        <Progress value={score.score} className="w-32 mt-1" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}