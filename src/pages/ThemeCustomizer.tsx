import { DashboardLayout } from '../components/layout/dashboard-layout';
import { EnhancedThemeCustomizer } from '../components/themes/EnhancedThemeCustomizer';

export default function ThemeCustomizer() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <EnhancedThemeCustomizer />
      </div>
    </DashboardLayout>
  );
}