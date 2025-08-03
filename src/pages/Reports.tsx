import { DashboardLayout } from '../components/layout/dashboard-layout';
import { AdvancedReportingSystem } from '../components/reporting/AdvancedReportingSystem';

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Advanced Reporting</h1>
            <p className="text-muted-foreground">
              Automated report generation, analytics, and business intelligence
            </p>
          </div>
          <AdvancedReportingSystem />
        </div>
      </div>
    </DashboardLayout>
  );
}