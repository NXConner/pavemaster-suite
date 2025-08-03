import { DashboardLayout } from '../components/layout/dashboard-layout';
import { AdvancedAnalyticsDashboard } from '../components/analytics/AdvancedAnalyticsDashboard';

export default function AdvancedAnalytics() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
            <p className="text-muted-foreground">
              AI-powered insights and performance analytics for operational excellence
            </p>
          </div>
          <AdvancedAnalyticsDashboard />
        </div>
      </div>
    </DashboardLayout>
  );
}