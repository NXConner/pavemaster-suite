import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface Employee {
  id: string;
  name: string;
  position: string;
  department: string;
  hireDate: Date;
  managerId?: string;
  active: boolean;
}

export interface ComplianceRule {
  id: string;
  name: string;
  category: string;
  description: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  pointsDeducted: number;
  requiredFrequency?: string; // 'daily', 'weekly', 'monthly'
  enabled: boolean;
  autoTrack: boolean;
}

export interface ComplianceEvent {
  id: string;
  employeeId: string;
  ruleId: string;
  eventType: 'violation' | 'achievement' | 'completion';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  pointsImpact: number; // positive for achievements, negative for violations
  description: string;
  timestamp: Date;
  cost?: number; // financial impact
  metadata: Record<string, any>;
  autoTracked: boolean;
  verified: boolean;
}

export interface EmployeeGrade {
  employeeId: string;
  currentScore: number;
  letterGrade: string;
  gradePoints: number;
  trend: 'improving' | 'declining' | 'stable';
  lastUpdated: Date;
  categories: Record<string, number>; // Category scores
}

export interface ComplianceAction {
  id: string;
  employeeId: string;
  actionType: 'verbal_warning' | 'written_warning' | 'write_up' | 'counseling' | 'training' | 'probation' | 'suspension' | 'termination';
  reason: string;
  timestamp: Date;
  issuedBy: string;
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  cost?: number;
  automated: boolean;
  acknowledged: boolean;
}

export interface CostImpact {
  employeeId: string;
  totalCost: number;
  positiveImpact: number;
  negativeImpact: number;
  netImpact: number;
  categories: Record<string, number>;
  lastCalculated: Date;
}

class EmployeeComplianceSystem extends EventEmitter {
  private employees: Map<string, Employee> = new Map();
  private complianceRules: Map<string, ComplianceRule> = new Map();
  private complianceEvents: ComplianceEvent[] = [];
  private employeeGrades: Map<string, EmployeeGrade> = new Map();
  private complianceActions: ComplianceAction[] = [];
  private costImpacts: Map<string, CostImpact> = new Map();

  constructor() {
    super();
    this.initializeDefaultRules();
    this.startComplianceMonitoring();
  }

  private initializeDefaultRules() {
    const defaultRules: ComplianceRule[] = [
      // Safety Compliance
      {
        id: 'safety-ppe-required',
        name: 'Personal Protective Equipment Required',
        category: 'Safety',
        description: 'Must wear required PPE at all times in designated areas',
        severity: 'major',
        pointsDeducted: 15,
        enabled: true,
        autoTrack: true
      },
      {
        id: 'safety-incident-reporting',
        name: 'Safety Incident Reporting',
        category: 'Safety',
        description: 'Must report all safety incidents immediately',
        severity: 'critical',
        pointsDeducted: 25,
        enabled: true,
        autoTrack: true
      },
      // Attendance
      {
        id: 'attendance-punctuality',
        name: 'Punctuality',
        category: 'Attendance',
        description: 'Must arrive on time for scheduled shifts',
        severity: 'minor',
        pointsDeducted: 5,
        requiredFrequency: 'daily',
        enabled: true,
        autoTrack: true
      },
      {
        id: 'attendance-unauthorized-absence',
        name: 'Unauthorized Absence',
        category: 'Attendance',
        description: 'Absence without prior approval',
        severity: 'major',
        pointsDeducted: 20,
        enabled: true,
        autoTrack: true
      },
      // Quality Control
      {
        id: 'quality-workmanship',
        name: 'Quality Workmanship Standards',
        category: 'Quality',
        description: 'Work must meet established quality standards',
        severity: 'moderate',
        pointsDeducted: 10,
        enabled: true,
        autoTrack: false
      },
      {
        id: 'quality-rework-required',
        name: 'Rework Required',
        category: 'Quality',
        description: 'Work requires rework due to quality issues',
        severity: 'moderate',
        pointsDeducted: 12,
        enabled: true,
        autoTrack: true
      },
      // Equipment and Tools
      {
        id: 'equipment-damage',
        name: 'Equipment Damage',
        category: 'Equipment',
        description: 'Damage to company equipment due to negligence',
        severity: 'major',
        pointsDeducted: 18,
        enabled: true,
        autoTrack: true
      },
      {
        id: 'equipment-maintenance',
        name: 'Equipment Maintenance',
        category: 'Equipment',
        description: 'Failure to perform required equipment maintenance',
        severity: 'moderate',
        pointsDeducted: 8,
        enabled: true,
        autoTrack: true
      },
      // Training and Development
      {
        id: 'training-completion',
        name: 'Training Completion',
        category: 'Training',
        description: 'Complete required training within specified timeframe',
        severity: 'moderate',
        pointsDeducted: 10,
        enabled: true,
        autoTrack: true
      },
      // Customer Service
      {
        id: 'customer-complaint',
        name: 'Customer Complaint',
        category: 'Customer Service',
        description: 'Customer complaint due to employee behavior or work quality',
        severity: 'major',
        pointsDeducted: 15,
        enabled: true,
        autoTrack: true
      }
    ];

    defaultRules.forEach(rule => {
      this.complianceRules.set(rule.id, rule);
    });
  }

  public addEmployee(employee: Employee) {
    this.employees.set(employee.id, employee);
    
    // Initialize employee grade
    const initialGrade: EmployeeGrade = {
      employeeId: employee.id,
      currentScore: 100, // Start with perfect score
      letterGrade: 'A+',
      gradePoints: 4.0,
      trend: 'stable',
      lastUpdated: new Date(),
      categories: {}
    };
    
    this.employeeGrades.set(employee.id, initialGrade);
    
    // Initialize cost impact tracking
    const initialCost: CostImpact = {
      employeeId: employee.id,
      totalCost: 0,
      positiveImpact: 0,
      negativeImpact: 0,
      netImpact: 0,
      categories: {},
      lastCalculated: new Date()
    };
    
    this.costImpacts.set(employee.id, initialCost);
    
    this.emit('employee_added', employee);
  }

  public recordComplianceEvent(event: Omit<ComplianceEvent, 'id' | 'timestamp'>) {
    const complianceEvent: ComplianceEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date()
    };

    this.complianceEvents.push(complianceEvent);
    this.updateEmployeeGrade(event.employeeId);
    this.updateCostImpact(event.employeeId, event.cost || 0, event.pointsImpact > 0 ? 'positive' : 'negative');
    
    // Check for automatic actions
    this.checkForAutomaticActions(event.employeeId, complianceEvent);
    
    this.emit('compliance_event_recorded', complianceEvent);
    
    return complianceEvent;
  }

  private updateEmployeeGrade(employeeId: string) {
    const grade = this.employeeGrades.get(employeeId);
    if (!grade) return;

    const events = this.complianceEvents.filter(e => e.employeeId === employeeId);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => e.timestamp >= last30Days);

    // Calculate score based on recent events
    const totalImpact = recentEvents.reduce((sum, event) => sum + event.pointsImpact, 0);
    const newScore = Math.max(0, Math.min(100, grade.currentScore + totalImpact));

    // Calculate category scores
    const categoryScores: Record<string, number> = {};
    const ruleCategories = Array.from(this.complianceRules.values())
      .reduce((acc, rule) => {
        acc[rule.id] = rule.category;
        return acc;
      }, {} as Record<string, string>);

    recentEvents.forEach(event => {
      const rule = this.complianceRules.get(event.ruleId);
      if (rule) {
        categoryScores[rule.category] = (categoryScores[rule.category] || 100) + event.pointsImpact;
      }
    });

    // Determine trend
    const previousScore = grade.currentScore;
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (newScore > previousScore + 2) trend = 'improving';
    else if (newScore < previousScore - 2) trend = 'declining';

    // Update grade
    grade.currentScore = newScore;
    grade.letterGrade = this.calculateLetterGrade(newScore);
    grade.gradePoints = this.calculateGradePoints(newScore);
    grade.trend = trend;
    grade.lastUpdated = new Date();
    grade.categories = categoryScores;

    this.emit('employee_grade_updated', grade);
  }

  private calculateLetterGrade(score: number): string {
    if (score >= 100) return 'A+';
    if (score >= 94) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 84) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 74) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 64) return 'D';
    if (score >= 60) return 'D-';
    return 'F';
  }

  private calculateGradePoints(score: number): number {
    if (score >= 100) return 4.0;
    if (score >= 94) return 4.0;
    if (score >= 90) return 3.7;
    if (score >= 87) return 3.3;
    if (score >= 84) return 3.0;
    if (score >= 80) return 2.7;
    if (score >= 77) return 2.3;
    if (score >= 74) return 2.0;
    if (score >= 70) return 1.7;
    if (score >= 67) return 1.3;
    if (score >= 64) return 1.0;
    if (score >= 60) return 0.7;
    return 0.0;
  }

  private updateCostImpact(employeeId: string, cost: number, type: 'positive' | 'negative') {
    const impact = this.costImpacts.get(employeeId);
    if (!impact) return;

    if (type === 'positive') {
      impact.positiveImpact += cost;
    } else {
      impact.negativeImpact += cost;
    }

    impact.totalCost = impact.positiveImpact + impact.negativeImpact;
    impact.netImpact = impact.positiveImpact - impact.negativeImpact;
    impact.lastCalculated = new Date();

    this.emit('cost_impact_updated', impact);
  }

  private checkForAutomaticActions(employeeId: string, event: ComplianceEvent) {
    const grade = this.employeeGrades.get(employeeId);
    if (!grade) return;

    const recentActions = this.complianceActions.filter(a => 
      a.employeeId === employeeId && 
      a.timestamp >= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    );

    // Critical violations lead to immediate termination consideration
    if (event.severity === 'critical') {
      this.issueAutomaticAction(employeeId, 'termination', 'Critical compliance violation', event.severity);
      return;
    }

    // Score-based automatic actions
    if (grade.currentScore < 60) {
      const terminationActions = recentActions.filter(a => a.actionType === 'termination');
      if (terminationActions.length === 0) {
        this.issueAutomaticAction(employeeId, 'termination', 'Compliance score below acceptable threshold', 'critical');
        return;
      }
    }

    if (grade.currentScore < 70) {
      const probationActions = recentActions.filter(a => a.actionType === 'probation');
      if (probationActions.length === 0) {
        this.issueAutomaticAction(employeeId, 'probation', 'Poor compliance performance', 'major');
        return;
      }
    }

    // Progressive discipline based on recent violations
    const violations = recentActions.filter(a => ['verbal_warning', 'written_warning', 'write_up'].includes(a.actionType));
    
    if (event.severity === 'major' || violations.length >= 3) {
      const writeUps = recentActions.filter(a => a.actionType === 'write_up');
      if (writeUps.length < 2) {
        this.issueAutomaticAction(employeeId, 'write_up', 'Repeated compliance violations', event.severity);
      } else {
        this.issueAutomaticAction(employeeId, 'counseling', 'Multiple compliance violations requiring intervention', 'major');
      }
    } else if (event.severity === 'moderate') {
      const warnings = recentActions.filter(a => a.actionType === 'written_warning');
      if (warnings.length === 0) {
        this.issueAutomaticAction(employeeId, 'written_warning', 'Compliance violation', event.severity);
      }
    } else if (event.severity === 'minor') {
      const verbalWarnings = recentActions.filter(a => a.actionType === 'verbal_warning');
      if (verbalWarnings.length === 0 && violations.length === 0) {
        this.issueAutomaticAction(employeeId, 'verbal_warning', 'Minor compliance issue', event.severity);
      }
    }
  }

  private issueAutomaticAction(employeeId: string, actionType: ComplianceAction['actionType'], reason: string, severity: ComplianceAction['severity']) {
    const action: ComplianceAction = {
      id: uuidv4(),
      employeeId,
      actionType,
      reason,
      timestamp: new Date(),
      issuedBy: 'SYSTEM_AUTO',
      severity,
      cost: this.calculateActionCost(actionType),
      automated: true,
      acknowledged: false
    };

    this.complianceActions.push(action);
    this.updateCostImpact(employeeId, action.cost || 0, 'negative');
    
    this.emit('automatic_action_issued', action);
    this.notifyAdministrators(action);
  }

  private calculateActionCost(actionType: ComplianceAction['actionType']): number {
    const costMap: Record<ComplianceAction['actionType'], number> = {
      'verbal_warning': 50,        // HR time
      'written_warning': 150,      // Documentation and HR time
      'write_up': 300,            // Formal documentation, HR time
      'counseling': 500,          // Counseling session, HR time
      'training': 800,            // Training materials and time
      'probation': 1200,          // Monitoring costs, reduced productivity
      'suspension': 2000,         // Lost productivity, coverage costs
      'termination': 5000         // Replacement costs, training new employee
    };

    return costMap[actionType] || 0;
  }

  private notifyAdministrators(action: ComplianceAction) {
    this.emit('admin_notification', {
      type: 'compliance_action',
      priority: action.severity === 'critical' ? 'high' : action.severity === 'major' ? 'medium' : 'low',
      message: `Automatic ${action.actionType} issued for employee ${action.employeeId}`,
      action,
      timestamp: new Date()
    });
  }

  public autoTrackEvent(employeeId: string, eventType: string, data: any) {
    // Map common events to compliance rules
    const eventMappings: Record<string, { ruleId: string; pointsImpact: number; cost?: number }> = {
      'late_arrival': { ruleId: 'attendance-punctuality', pointsImpact: -5, cost: 25 },
      'equipment_damage': { ruleId: 'equipment-damage', pointsImpact: -18, cost: data.repairCost || 500 },
      'safety_violation': { ruleId: 'safety-ppe-required', pointsImpact: -15, cost: 200 },
      'customer_complaint': { ruleId: 'customer-complaint', pointsImpact: -15, cost: 300 },
      'quality_issue': { ruleId: 'quality-rework-required', pointsImpact: -12, cost: data.reworkCost || 400 },
      'training_completed': { ruleId: 'training-completion', pointsImpact: 5, cost: -100 }, // Positive impact
      'safety_achievement': { ruleId: 'safety-incident-reporting', pointsImpact: 10, cost: -50 }
    };

    const mapping = eventMappings[eventType];
    if (!mapping) return;

    const rule = this.complianceRules.get(mapping.ruleId);
    if (!rule || !rule.autoTrack) return;

    this.recordComplianceEvent({
      employeeId,
      ruleId: mapping.ruleId,
      eventType: mapping.pointsImpact > 0 ? 'achievement' : 'violation',
      severity: rule.severity,
      pointsImpact: mapping.pointsImpact,
      description: `Auto-tracked: ${eventType}`,
      cost: mapping.cost,
      metadata: data,
      autoTracked: true,
      verified: false
    });
  }

  public getEmployeeCompliance(employeeId: string) {
    const employee = this.employees.get(employeeId);
    const grade = this.employeeGrades.get(employeeId);
    const costImpact = this.costImpacts.get(employeeId);
    const events = this.complianceEvents.filter(e => e.employeeId === employeeId);
    const actions = this.complianceActions.filter(a => a.employeeId === employeeId);

    return {
      employee,
      grade,
      costImpact,
      recentEvents: events.slice(-10),
      recentActions: actions.slice(-5),
      violationsByCategory: this.getViolationsByCategory(employeeId),
      complianceHistory: this.getComplianceHistory(employeeId)
    };
  }

  private getViolationsByCategory(employeeId: string): Record<string, number> {
    const events = this.complianceEvents.filter(e => 
      e.employeeId === employeeId && e.eventType === 'violation'
    );

    return events.reduce((acc, event) => {
      const rule = this.complianceRules.get(event.ruleId);
      if (rule) {
        acc[rule.category] = (acc[rule.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }

  private getComplianceHistory(employeeId: string): Array<{ date: string; score: number; grade: string }> {
    // Simplified history - in real implementation, you'd store historical snapshots
    const events = this.complianceEvents.filter(e => e.employeeId === employeeId);
    const history: Array<{ date: string; score: number; grade: string }> = [];
    
    let currentScore = 100;
    events.forEach(event => {
      currentScore += event.pointsImpact;
      history.push({
        date: event.timestamp.toISOString().split('T')[0],
        score: Math.max(0, Math.min(100, currentScore)),
        grade: this.calculateLetterGrade(currentScore)
      });
    });

    return history.slice(-30); // Last 30 entries
  }

  public getComplianceReport(period?: { start: Date; end: Date }) {
    let events = this.complianceEvents;
    
    if (period) {
      events = events.filter(e => 
        e.timestamp >= period.start && e.timestamp <= period.end
      );
    }

    const totalViolations = events.filter(e => e.eventType === 'violation').length;
    const totalAchievements = events.filter(e => e.eventType === 'achievement').length;
    const totalCost = events.reduce((sum, e) => sum + (e.cost || 0), 0);

    const employeeRankings = Array.from(this.employeeGrades.values())
      .sort((a, b) => b.currentScore - a.currentScore);

    const riskEmployees = employeeRankings.filter(e => e.currentScore < 70);

    return {
      totalEvents: events.length,
      totalViolations,
      totalAchievements,
      totalCost,
      averageScore: employeeRankings.reduce((sum, e) => sum + e.currentScore, 0) / employeeRankings.length,
      employeeRankings,
      riskEmployees,
      categoryBreakdown: this.getCategoryBreakdown(events),
      costByEmployee: Array.from(this.costImpacts.values())
        .sort((a, b) => b.negativeImpact - a.negativeImpact)
    };
  }

  private getCategoryBreakdown(events: ComplianceEvent[]): Record<string, { violations: number; achievements: number; cost: number }> {
    return events.reduce((acc, event) => {
      const rule = this.complianceRules.get(event.ruleId);
      if (rule) {
        if (!acc[rule.category]) {
          acc[rule.category] = { violations: 0, achievements: 0, cost: 0 };
        }
        
        if (event.eventType === 'violation') {
          acc[rule.category].violations++;
        } else if (event.eventType === 'achievement') {
          acc[rule.category].achievements++;
        }
        
        acc[rule.category].cost += event.cost || 0;
      }
      return acc;
    }, {} as Record<string, { violations: number; achievements: number; cost: number }>);
  }

  private startComplianceMonitoring() {
    // Start background monitoring
    setInterval(() => {
      this.performPeriodicComplianceChecks();
    }, 300000); // Every 5 minutes
  }

  private performPeriodicComplianceChecks() {
    // Check for missed training deadlines, overdue certifications, etc.
    this.emit('periodic_compliance_check_completed');
  }
}

export default new EmployeeComplianceSystem();