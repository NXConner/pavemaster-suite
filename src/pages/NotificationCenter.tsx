import { DashboardLayout } from '../components/layout/dashboard-layout';
import { RealtimeNotificationSystem } from '../components/notifications/RealtimeNotificationSystem';

export default function NotificationCenter() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
            <p className="text-muted-foreground">
              Real-time alerts, system notifications, and tactical updates
            </p>
          </div>
          <RealtimeNotificationSystem />
        </div>
      </div>
    </DashboardLayout>
  );
}