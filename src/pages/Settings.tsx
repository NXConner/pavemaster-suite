
import { DashboardLayout } from '../components/layout/dashboard-layout';
import { SettingsManager } from '../components/settings/SettingsManager';

export default function Settings() {
  return (
    <DashboardLayout>
      <SettingsManager />
    </DashboardLayout>
  );
}