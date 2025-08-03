import { DashboardLayout } from '../components/layout/dashboard-layout';
import { IoTManagement } from '../components/iot/IoTManagement';

export default function IoT() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">IoT Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage connected devices, sensors, and tracking systems
            </p>
          </div>
          <IoTManagement />
        </div>
      </div>
    </DashboardLayout>
  );
}