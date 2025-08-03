import { DashboardLayout } from '../components/layout/dashboard-layout';
import { EnterpriseManagement } from '../components/enterprise/EnterpriseManagement';

export default function EnterpriseAdmin() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Enterprise Administration</h1>
            <p className="text-muted-foreground">
              Advanced enterprise features, security management, and organizational controls
            </p>
          </div>
          <EnterpriseManagement />
        </div>
      </div>
    </DashboardLayout>
  );
}