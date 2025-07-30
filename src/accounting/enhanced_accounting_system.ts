import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface AutoTrackingConfig {
  id: string;
  name: string;
  sourceModule: string;
  trackingRules: TrackingRule[];
  enabled: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

export interface TrackingRule {
  id: string;
  name: string;
  trigger: string; // Event or condition that triggers tracking
  accountCode: string;
  category: string;
  multiplier?: number;
  conditions?: Record<string, any>;
}

export interface FinancialEvent {
  id: string;
  sourceModule: string;
  eventType: string;
  amount: number;
  currency: string;
  category: string;
  subcategory?: string;
  accountCode: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: Date;
  projectId?: string;
  employeeId?: string;
  customerId?: string;
  autoTracked: boolean;
}

export interface AccountingIntegration {
  module: string;
  trackingPoints: string[];
  revenueMapping: Record<string, string>;
  expenseMapping: Record<string, string>;
  enabled: boolean;
}

class EnhancedAccountingSystem extends EventEmitter {
  private trackingConfigs: Map<string, AutoTrackingConfig> = new Map();
  private financialEvents: FinancialEvent[] = [];
  private integrations: Map<string, AccountingIntegration> = new Map();
  private isTracking: boolean = true;

  constructor() {
    super();
    this.initializeDefaultIntegrations();
    this.startAutoTracking();
  }

  private initializeDefaultIntegrations() {
    const defaultIntegrations: AccountingIntegration[] = [
      {
        module: 'projects',
        trackingPoints: ['project_created', 'project_completed', 'milestone_reached', 'invoice_generated'],
        revenueMapping: {
          'project_completed': '4000_REVENUE',
          'invoice_paid': '4001_INVOICE_REVENUE',
          'milestone_payment': '4002_MILESTONE_REVENUE'
        },
        expenseMapping: {
          'material_purchased': '5000_MATERIALS',
          'labor_cost': '5001_LABOR',
          'equipment_rental': '5002_EQUIPMENT'
        },
        enabled: true
      },
      {
        module: 'equipment',
        trackingPoints: ['equipment_purchased', 'equipment_rented', 'maintenance_performed', 'fuel_purchased'],
        revenueMapping: {
          'equipment_rental_income': '4003_EQUIPMENT_RENTAL'
        },
        expenseMapping: {
          'equipment_purchased': '5100_EQUIPMENT_PURCHASE',
          'maintenance_performed': '5101_MAINTENANCE',
          'fuel_purchased': '5102_FUEL',
          'equipment_depreciation': '5103_DEPRECIATION'
        },
        enabled: true
      },
      {
        module: 'team',
        trackingPoints: ['salary_paid', 'overtime_paid', 'bonus_paid', 'training_cost', 'benefits_cost'],
        revenueMapping: {},
        expenseMapping: {
          'salary_paid': '5200_SALARIES',
          'overtime_paid': '5201_OVERTIME',
          'bonus_paid': '5202_BONUSES',
          'training_cost': '5203_TRAINING',
          'benefits_cost': '5204_BENEFITS'
        },
        enabled: true
      },
      {
        module: 'fleet',
        trackingPoints: ['vehicle_purchased', 'vehicle_maintenance', 'fuel_cost', 'insurance_cost'],
        revenueMapping: {},
        expenseMapping: {
          'vehicle_purchased': '5300_VEHICLE_PURCHASE',
          'vehicle_maintenance': '5301_VEHICLE_MAINTENANCE',
          'fuel_cost': '5302_FUEL',
          'insurance_cost': '5303_INSURANCE'
        },
        enabled: true
      },
      {
        module: 'safety',
        trackingPoints: ['safety_training', 'incident_cost', 'safety_equipment', 'compliance_audit'],
        revenueMapping: {},
        expenseMapping: {
          'safety_training': '5400_SAFETY_TRAINING',
          'incident_cost': '5401_INCIDENT_COSTS',
          'safety_equipment': '5402_SAFETY_EQUIPMENT',
          'compliance_audit': '5403_COMPLIANCE_COSTS'
        },
        enabled: true
      }
    ];

    defaultIntegrations.forEach(integration => {
      this.integrations.set(integration.module, integration);
    });
  }

  public trackFinancialEvent(event: Omit<FinancialEvent, 'id' | 'timestamp' | 'autoTracked'>) {
    const financialEvent: FinancialEvent = {
      ...event,
      id: uuidv4(),
      timestamp: new Date(),
      autoTracked: true
    };

    this.financialEvents.push(financialEvent);
    this.emit('financial_event_tracked', financialEvent);

    // Check for automated compliance triggers
    this.checkComplianceImpact(financialEvent);

    return financialEvent;
  }

  private checkComplianceImpact(event: FinancialEvent) {
    // Auto-track events that might impact employee compliance
    if (event.employeeId) {
      this.emit('employee_financial_impact', {
        employeeId: event.employeeId,
        amount: event.amount,
        category: event.category,
        impact: event.category.includes('cost') ? 'negative' : 'positive',
        timestamp: event.timestamp
      });
    }
  }

  public async autoTrackFromModule(module: string, eventType: string, data: any) {
    const integration = this.integrations.get(module);
    if (!integration || !integration.enabled) {
      return;
    }

    if (!integration.trackingPoints.includes(eventType)) {
      return;
    }

    let accountCode = '';
    let category = '';
    let amount = 0;

    // Determine if this is revenue or expense
    if (integration.revenueMapping[eventType]) {
      accountCode = integration.revenueMapping[eventType];
      category = 'revenue';
      amount = Math.abs(data.amount || 0);
    } else if (integration.expenseMapping[eventType]) {
      accountCode = integration.expenseMapping[eventType];
      category = 'expense';
      amount = Math.abs(data.amount || 0);
    }

    if (accountCode && amount > 0) {
      this.trackFinancialEvent({
        sourceModule: module,
        eventType,
        amount,
        currency: 'USD',
        category,
        accountCode,
        description: `Auto-tracked ${eventType} from ${module}`,
        metadata: data,
        projectId: data.projectId,
        employeeId: data.employeeId,
        customerId: data.customerId
      });
    }
  }

  public getFinancialSummary(period?: { start: Date; end: Date }) {
    let events = this.financialEvents;
    
    if (period) {
      events = events.filter(e => 
        e.timestamp >= period.start && e.timestamp <= period.end
      );
    }

    const revenue = events
      .filter(e => e.category === 'revenue')
      .reduce((sum, e) => sum + e.amount, 0);

    const expenses = events
      .filter(e => e.category === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);

    const categoryBreakdown = events.reduce((acc, event) => {
      const key = `${event.category}_${event.subcategory || 'other'}`;
      acc[key] = (acc[key] || 0) + event.amount;
      return acc;
    }, {} as Record<string, number>);

    const projectBreakdown = events
      .filter(e => e.projectId)
      .reduce((acc, event) => {
        acc[event.projectId!] = (acc[event.projectId!] || 0) + event.amount;
        return acc;
      }, {} as Record<string, number>);

    const employeeImpact = events
      .filter(e => e.employeeId)
      .reduce((acc, event) => {
        if (!acc[event.employeeId!]) {
          acc[event.employeeId!] = { revenue: 0, expense: 0, net: 0 };
        }
        
        if (event.category === 'revenue') {
          acc[event.employeeId!].revenue += event.amount;
        } else {
          acc[event.employeeId!].expense += event.amount;
        }
        
        acc[event.employeeId!].net = acc[event.employeeId!].revenue - acc[event.employeeId!].expense;
        return acc;
      }, {} as Record<string, { revenue: number; expense: number; net: number }>);

    return {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit: revenue - expenses,
      profitMargin: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0,
      categoryBreakdown,
      projectBreakdown,
      employeeImpact,
      eventCount: events.length,
      period: period || { start: new Date(0), end: new Date() }
    };
  }

  public enableModuleTracking(module: string, enabled: boolean = true) {
    const integration = this.integrations.get(module);
    if (integration) {
      integration.enabled = enabled;
      this.emit('module_tracking_changed', { module, enabled });
    }
  }

  public addCustomTrackingPoint(module: string, eventType: string, mapping: { accountCode: string; category: 'revenue' | 'expense' }) {
    const integration = this.integrations.get(module);
    if (integration) {
      integration.trackingPoints.push(eventType);
      if (mapping.category === 'revenue') {
        integration.revenueMapping[eventType] = mapping.accountCode;
      } else {
        integration.expenseMapping[eventType] = mapping.accountCode;
      }
    }
  }

  private startAutoTracking() {
    // Start background processes for auto-tracking
    setInterval(() => {
      this.performPeriodicTrackingTasks();
    }, 60000); // Every minute
  }

  private performPeriodicTrackingTasks() {
    // Auto-track recurring expenses (rent, insurance, etc.)
    // Auto-calculate depreciation
    // Auto-track time-based costs
    this.emit('periodic_tracking_completed');
  }

  public getTrackingMetrics() {
    return {
      totalEvents: this.financialEvents.length,
      enabledModules: Array.from(this.integrations.values()).filter(i => i.enabled).length,
      trackingAccuracy: this.calculateTrackingAccuracy(),
      lastTrackedEvent: this.financialEvents[this.financialEvents.length - 1]?.timestamp,
      moduleBreakdown: Array.from(this.integrations.entries()).map(([module, integration]) => ({
        module,
        enabled: integration.enabled,
        eventCount: this.financialEvents.filter(e => e.sourceModule === module).length
      }))
    };
  }

  private calculateTrackingAccuracy(): number {
    // Calculate accuracy based on auto-tracked vs manual entries
    const autoTracked = this.financialEvents.filter(e => e.autoTracked).length;
    const total = this.financialEvents.length;
    return total > 0 ? (autoTracked / total) * 100 : 0;
  }

  public exportFinancialData(format: 'json' | 'csv' | 'xml' = 'json') {
    const data = {
      summary: this.getFinancialSummary(),
      events: this.financialEvents,
      integrations: Array.from(this.integrations.values()),
      exportDate: new Date().toISOString()
    };

    switch (format) {
      case 'csv':
        return this.convertToCSV(data);
      case 'xml':
        return this.convertToXML(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  private convertToCSV(data: any): string {
    // Convert financial events to CSV format
    const headers = ['ID', 'Source Module', 'Event Type', 'Amount', 'Category', 'Account Code', 'Description', 'Timestamp'];
    const rows = data.events.map((event: FinancialEvent) => [
      event.id,
      event.sourceModule,
      event.eventType,
      event.amount,
      event.category,
      event.accountCode,
      event.description,
      event.timestamp.toISOString()
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private convertToXML(data: any): string {
    // Basic XML conversion for financial data
    return `<?xml version="1.0" encoding="UTF-8"?>
<financial_data>
  <summary>
    <total_revenue>${data.summary.totalRevenue}</total_revenue>
    <total_expenses>${data.summary.totalExpenses}</total_expenses>
    <net_profit>${data.summary.netProfit}</net_profit>
  </summary>
  <events>
    ${data.events.map((event: FinancialEvent) => `
    <event id="${event.id}">
      <source_module>${event.sourceModule}</source_module>
      <event_type>${event.eventType}</event_type>
      <amount>${event.amount}</amount>
      <category>${event.category}</category>
      <timestamp>${event.timestamp.toISOString()}</timestamp>
    </event>`).join('')}
  </events>
</financial_data>`;
  }
}

export default new EnhancedAccountingSystem();