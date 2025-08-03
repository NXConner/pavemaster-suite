import { DashboardLayout } from '../components/layout/dashboard-layout';
import { SystemPerformanceMonitor } from '../components/monitoring/SystemPerformanceMonitor';

export default function SystemMonitoring() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time performance monitoring, health checks, and system optimization
            </p>
          </div>
          <SystemPerformanceMonitor />
        </div>
      </div>
    </DashboardLayout>
  );
}